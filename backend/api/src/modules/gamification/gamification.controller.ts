import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { GamificationService } from './gamification.service';

@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('leaderboard/:tier')
  async getLeaderboard(
    @Param('tier') tier: string,
    @Query('limit') limit?: number,
  ) {
    return this.gamificationService.getLeaderboard(tier, limit ? Number(limit) : 20);
  }

  @Post('add-xp')
  async addXp(@Body() body: { userId: string; xpPoints: number }) {
    return this.gamificationService.addXp(body.userId, body.xpPoints);
  }

  @Post('deduct-heart')
  async deductHeart(@Body() body: { userId: string }) {
    return this.gamificationService.deductHeart(body.userId);
  }
}
