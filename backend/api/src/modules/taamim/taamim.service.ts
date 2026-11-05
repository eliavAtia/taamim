import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TaamimService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves all Moroccan cantillation marks with Unicode NFC normalized strings
   */
  async getAllTaamim() {
    const taamim = await this.prisma.taam.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: 'asc' },
      include: {
        taamSound: {
          include: { cantor: true },
        },
        recordings: {
          where: { recordingType: 'TAAM_SAMPLE' },
          include: {
            cantor: true,
          },
        },
      },
    });

    return taamim.map(({ recordings, ...taam }) => ({
      ...taam,
      taamSamples: recordings,
    }));
  }

  /**
   * Retrieves a specific Taam by ID along with reference recordings and pitch data
   */
  async getTaamById(id: string) {
    const taam = await this.prisma.taam.findUnique({
      where: { id },
      include: {
        taamSound: {
          include: { cantor: true },
        },
        recordings: {
          where: { recordingType: 'TAAM_SAMPLE' },
          include: {
            cantor: true,
          },
        },
      },
    });

    if (!taam) {
      throw new NotFoundException(`טעם עם מזהה ${id} לא נמצא`);
    }

    const { recordings, ...taamData } = taam;
    return {
      ...taamData,
      taamSamples: recordings,
    };
  }
}
