import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GamificationService {
  private redisClient: Redis;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
    const redisPort = this.configService.get<number>('REDIS_PORT', 6379);
    this.redisClient = new Redis({
      host: redisHost,
      port: redisPort,
      lazyConnect: true,
    });
  }

  /**
   * Helper to format weekly league Redis key: league:{tier}:{YYYY_WW}
   */
  private getWeeklyLeagueKey(tier: string, date: Date = new Date()): string {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `league:${tier}:${d.getUTCFullYear()}_W${weekNo}`;
  }

  /**
   * Adds XP to user in both atomic DB transaction and Redis ZSET weekly league
   */
  async addXp(userId: string, xpPoints: number) {
    // 1. Fetch user
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 2. Atomic DB transaction for XP and Streak
    const updatedUser = await this.prisma.$transaction(async (tx) => {
      let newStreak = user.streakCount;
      const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;

      if (lastActive) {
        lastActive.setHours(0, 0, 0, 0);
        const diffDays = Math.round((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1; // Streak broken, restarted
        }
      } else {
        newStreak = 1;
      }

      return tx.user.update({
        where: { id: userId },
        data: {
          totalXp: { increment: xpPoints },
          streakCount: newStreak,
          longestStreak: Math.max(newStreak, user.longestStreak),
          lastActiveDate: new Date(),
        },
      });
    });

    // 3. Update Redis ZSET for Weekly League Leaderboard
    try {
      const leagueKey = this.getWeeklyLeagueKey(user.leagueTier);
      await this.redisClient.zincrby(leagueKey, xpPoints, userId);
    } catch {
      // Redis fallback / offline mode during initial setup
    }

    return updatedUser;
  }

  /**
   * Decrements a heart upon mistake (Atomic transaction)
   */
  async deductHeart(userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new BadRequestException('משתמש לא נמצא');

      if (user.hearts <= 0) {
        throw new BadRequestException('אזלו הלבבות! יש להמתין למילוי או לתרגל במצב חיזוק');
      }

      return tx.user.update({
        where: { id: userId },
        data: {
          hearts: { decrement: 1 },
        },
      });
    });
  }

  /**
   * Retrieves top standings from Redis ZSET for user's current league tier
   */
  async getLeaderboard(tier: string, limit: number = 20) {
    const leagueKey = this.getWeeklyLeagueKey(tier);
    try {
      // ZREVRANGE with scores: highest XP first
      const rawResults = await this.redisClient.zrevrange(leagueKey, 0, limit - 1, 'WITHSCORES');
      const leaderboard = [];
      for (let i = 0; i < rawResults.length; i += 2) {
        leaderboard.push({
          userId: rawResults[i],
          weeklyXp: parseInt(rawResults[i + 1], 10),
          rank: Math.floor(i / 2) + 1,
        });
      }
      return leaderboard;
    } catch {
      return [];
    }
  }
}
