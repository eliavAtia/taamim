/**
 * Gamification Domain Types (Duolingo style: Hearts, Streaks, Leagues, XP)
 */

export enum LeagueTier {
  BRONZE = 'BRONZE',     // ליגת ארד
  SILVER = 'SILVER',     // ליגת כסף
  GOLD = 'GOLD',         // ליגת זהב
  SAPPHIRE = 'SAPPHIRE', // ליגת ספיר
  RUBY = 'RUBY',         // ליגת אודם
  DIAMOND = 'DIAMOND',   // ליגת יהלום
}

export interface LeagueStandingUser {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  weeklyXp: number;
  isCurrentUser: boolean;
}

export interface DailyStreakState {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // ISO format YYYY-MM-DD
  isStreakMaintainedToday: boolean;
  streakFreezeAvailable: number;
}

export interface HeartSystemState {
  hearts: number;         // Max 5
  maxHearts: number;      // 5
  nextHeartRefillMs: number | null; // Timestamp when next heart arrives
  isUnlimited: boolean;   // For premium users or practice mode
}
