import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { access } from 'node:fs/promises';
import * as path from 'node:path';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import FormData = require('form-data');

interface UploadedAudioFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

@Injectable()
export class AudioService {
  private audioEngineUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.audioEngineUrl = this.configService.get<string>('AUDIO_ENGINE_URL', 'http://localhost:8000');
  }

  async evaluateRecording(
    userId: string | undefined,
    referenceRecordingId: string | undefined,
    audioFile: UploadedAudioFile,
  ) {
    if (!userId || !referenceRecordingId) {
      throw new BadRequestException('חסרים מזהה משתמש או מזהה הקלטת ייחוס');
    }

    const extensionByMimeType: Record<string, string> = {
      'audio/mp4': '.m4a',
      'audio/m4a': '.m4a',
      'audio/x-m4a': '.m4a',
      'audio/aac': '.aac',
      'audio/wav': '.wav',
      'audio/x-wav': '.wav',
      'audio/webm': '.webm',
      'audio/ogg': '.ogg',
    };
    const extension = extensionByMimeType[audioFile.mimetype];

    if (!extension || !audioFile.buffer?.length || audioFile.size <= 0) {
      throw new BadRequestException('פורמט ההקלטה אינו נתמך או שהקובץ ריק');
    }

    const form = new FormData();
    form.append('file', audioFile.buffer, {
      filename: `user-attempt${extension}`,
      contentType: audioFile.mimetype,
      knownLength: audioFile.size,
    });

    let userPitchData: any;
    try {
      const extraction = await axios.post(
        `${this.audioEngineUrl}/api/v1/extract-pitch`,
        form,
        {
          headers: form.getHeaders(),
          maxBodyLength: 8 * 1024 * 1024,
          timeout: 30_000,
        },
      );
      userPitchData = extraction.data;
    } catch (error: any) {
      const detail = error.response?.data?.detail || error.message;
      throw new BadRequestException(`לא ניתן היה לעבד את ההקלטה: ${detail}`);
    }

    return this.evaluateAttempt(userId, referenceRecordingId, userPitchData);
  }

  async getReferenceAudio(referenceRecordingId: string) {
    const reference = await this.prisma.referenceRecording.findUnique({
      where: { id: referenceRecordingId },
      select: { storagePath: true },
    });

    if (!reference?.storagePath) {
      throw new NotFoundException('קובץ הקלטת הייחוס לא נמצא');
    }

    const apiRoot = path.resolve(__dirname, '..', '..', '..');
    const storageRoot = path.resolve(apiRoot, 'storage');
    const filePath = path.resolve(apiRoot, reference.storagePath);
    const relativePath = path.relative(storageRoot, filePath);

    if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
      throw new BadRequestException('נתיב הקלטת הייחוס אינו תקין');
    }

    try {
      await access(filePath);
    } catch {
      throw new NotFoundException('קובץ הקלטת הייחוס לא נמצא');
    }

    const extension = path.extname(filePath).toLowerCase();
    const contentTypes: Record<string, string> = {
      '.ogg': 'audio/ogg',
      '.wav': 'audio/wav',
      '.m4a': 'audio/mp4',
      '.mp3': 'audio/mpeg',
    };

    return {
      filePath,
      fileName: path.basename(filePath),
      contentType: contentTypes[extension] ?? 'application/octet-stream',
    };
  }

  /**
   * Authoritative scoring: Compares user recording against pre-computed Cantor pitch data using DTW
   */
  async evaluateAttempt(userId: string, referenceRecordingId: string, userPitchData: any) {
    const reference = await this.prisma.referenceRecording.findUnique({
      where: { id: referenceRecordingId },
      include: { taam: true, cantor: true },
    });

    if (!reference) {
      throw new NotFoundException('הקלטת החזן לא נמצאה');
    }

    // Call Python FastAPI DSP engine
    try {
      const referenceContour =
        typeof reference.pitchDataJson === 'string'
          ? JSON.parse(reference.pitchDataJson)
          : reference.pitchDataJson;

      const response = await axios.post(`${this.audioEngineUrl}/api/v1/score-attempt`, {
        userContour: userPitchData,
        referenceContour,
        referenceTonicF0: reference.tonicF0,
      });

      const {
        dtwDistance,
        accuracyScore,
        pitchAccuracy,
        timingAccuracy,
        isPassed,
        feedbackHebrew,
      } = response.data;

      const xpEarned = isPassed ? Math.round(accuracyScore / 5) : 5;

      // Save user attempt in DB
      const attempt = await this.prisma.userPracticeAttempt.create({
        data: {
          userId,
          referenceRecordingId,
          userTonicF0: userPitchData.tonicF0Hz || 0,
          dtwDistance,
          accuracyScore,
          pitchAccuracy,
          timingAccuracy,
          isPassed,
          feedbackJson: JSON.stringify({ feedbackHebrew }),
          xpEarned,
        },
      });

      return {
        attemptId: attempt.id,
        accuracyScore,
        pitchAccuracy,
        timingAccuracy,
        isPassed,
        feedbackHebrew,
        xpEarned,
      };
    } catch (error: any) {
      throw new BadRequestException(`שגיאה בתקשורת עם מנוע ה-DSP של האודיו: ${error.message}`);
    }
  }
}
