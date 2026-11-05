import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { createReadStream } from 'node:fs';
import { FileInterceptor } from '@nestjs/platform-express';
import { AudioService } from './audio.service';

interface UploadedAudioFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

@Controller('audio')
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

  @Post('evaluate')
  @UseInterceptors(
    FileInterceptor('audioFile', {
      limits: { fileSize: 8 * 1024 * 1024, files: 1 },
    }),
  )
  async evaluateAttempt(
    @UploadedFile() audioFile: UploadedAudioFile | undefined,
    @Body() body: { userId?: string; referenceRecordingId?: string },
  ) {
    if (!audioFile) {
      throw new BadRequestException('חובה לצרף הקלטת קול');
    }

    return this.audioService.evaluateRecording(body.userId, body.referenceRecordingId, audioFile);
  }

  @Get('reference-recordings/:id/file')
  async getReferenceRecording(
    @Param('id') id: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const audio = await this.audioService.getReferenceAudio(id);
    response.set({
      'Content-Type': audio.contentType,
      'Content-Disposition': `inline; filename="${audio.fileName}"`,
    });
    return new StreamableFile(createReadStream(audio.filePath));
  }
}
