import { Pool } from 'pg';

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_type: string;
  title: string;
  description?: string;
  badge_color?: string;
  unlocked_at: string;
}

export const ACHIEVEMENT_DEFINITIONS = {
  FIRST_SESSION: {
    type: 'first_session',
    title: '🎓 First Steps',
    description: 'Registered for your first PD session',
    badge_color: '#3b82f6',
  },
  FIVE_SESSIONS: {
    type: 'five_sessions',
    title: '📚 Learner',
    description: 'Registered for 5 PD sessions',
    badge_color: '#8b5cf6',
  },
  TEN_SESSIONS: {
    type: 'ten_sessions',
    title: '🏆 Scholar',
    description: 'Registered for 10 PD sessions',
    badge_color: '#ec4899',
  },
  LEVEL_5: {
    type: 'level_5',
    title: '⭐ Rising Star',
    description: 'Reached level 5',
    badge_color: '#f59e0b',
  },
  LEVEL_10: {
    type: 'level_10',
    title: '👑 Master',
    description: 'Reached level 10',
    badge_color: '#fbbf24',
  },
  WEEKLY_STREAK: {
    type: 'weekly_streak',
    title: '🔥 On Fire',
    description: 'Maintained a 7-day attendance streak',
    badge_color: '#ef4444',
  },
  PERFECT_ATTENDANCE: {
    type: 'perfect_attendance',
    title: '⚡ Perfect',
    description: 'Attended all offered sessions in a month',
    badge_color: '#10b981',
  },
} as const;

export class AchievementService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async unlockAchievement(
    user_id: string,
    achievementType: string
  ): Promise<UserAchievement | null> {
    const achievement =
      ACHIEVEMENT_DEFINITIONS[
        achievementType as keyof typeof ACHIEVEMENT_DEFINITIONS
      ];

    if (!achievement) {
      return null;
    }

    try {
      const result = await this.pool.query(
        `INSERT INTO user_achievements (user_id, achievement_type, title, description, badge_color)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id, achievement_type) DO NOTHING
         RETURNING *`,
        [user_id, achievement.type, achievement.title, achievement.description, achievement.badge_color]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      return null;
    }
  }

  async getAchievementsByUserId(user_id: string): Promise<UserAchievement[]> {
    const result = await this.pool.query(
      `SELECT * FROM user_achievements 
       WHERE user_id = $1
       ORDER BY unlocked_at DESC`,
      [user_id]
    );

    return result.rows;
  }

  async hasAchievement(user_id: string, achievement_type: string): Promise<boolean> {
    const result = await this.pool.query(
      `SELECT 1 FROM user_achievements 
       WHERE user_id = $1 AND achievement_type = $2`,
      [user_id, achievement_type]
    );

    return result.rows.length > 0;
  }

  async checkAndUnlockAchievements(
    user_id: string,
    sessionCount: number,
    level: number,
    streak: number
  ): Promise<UserAchievement[]> {
    const unlockedAchievements: UserAchievement[] = [];

    // Check for session-based achievements
    if (sessionCount === 1) {
      const achievement = await this.unlockAchievement(user_id, 'FIRST_SESSION');
      if (achievement) unlockedAchievements.push(achievement);
    }

    if (sessionCount === 5) {
      const achievement = await this.unlockAchievement(user_id, 'FIVE_SESSIONS');
      if (achievement) unlockedAchievements.push(achievement);
    }

    if (sessionCount === 10) {
      const achievement = await this.unlockAchievement(user_id, 'TEN_SESSIONS');
      if (achievement) unlockedAchievements.push(achievement);
    }

    // Check for level-based achievements
    if (level === 5) {
      const achievement = await this.unlockAchievement(user_id, 'LEVEL_5');
      if (achievement) unlockedAchievements.push(achievement);
    }

    if (level === 10) {
      const achievement = await this.unlockAchievement(user_id, 'LEVEL_10');
      if (achievement) unlockedAchievements.push(achievement);
    }

    // Check for streak-based achievements
    if (streak === 7) {
      const achievement = await this.unlockAchievement(user_id, 'WEEKLY_STREAK');
      if (achievement) unlockedAchievements.push(achievement);
    }

    return unlockedAchievements;
  }
}
