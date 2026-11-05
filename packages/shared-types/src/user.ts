/**
 * User & Progression Types
 */

import { LeagueTier, DailyStreakState, HeartSystemState } from './gamification';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  totalXp: number;
  leagueTier: LeagueTier;
  streak: DailyStreakState;
  hearts: HeartSystemState;
  createdAt: string;
}

export enum LessonStatus {
  LOCKED = 'LOCKED',
  UNLOCKED = 'UNLOCKED',
  COMPLETED = 'COMPLETED',
  MASTERED = 'MASTERED', // Gold crown
}

export interface UserLessonProgress {
  lessonId: string;
  status: LessonStatus;
  stars: number;         // 1-3 stars
  highScore: number;
  completedAt?: string;
}
