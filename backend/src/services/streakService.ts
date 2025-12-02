import { Pool } from 'pg';

export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_session_date?: string;
  updated_at: string;
}

export class StreakService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async getOrCreateStreak(user_id: string): Promise<UserStreak> {
    const result = await this.pool.query(
      `INSERT INTO user_streaks (user_id, current_streak, longest_streak)
       VALUES ($1, 0, 0)
       ON CONFLICT (user_id) DO NOTHING
       RETURNING *`,
      [user_id]
    );

    // If insert returned nothing, fetch existing
    if (result.rows.length === 0) {
      const existing = await this.pool.query(
        'SELECT * FROM user_streaks WHERE user_id = $1',
        [user_id]
      );
      return existing.rows[0] as UserStreak;
    }

    return result.rows[0] as UserStreak;
  }

  async getStreakByUserId(user_id: string): Promise<UserStreak | null> {
    const result = await this.pool.query(
      'SELECT * FROM user_streaks WHERE user_id = $1',
      [user_id]
    );

    return result.rows[0] || null;
  }

  async updateStreakForSession(user_id: string): Promise<UserStreak> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Get current streak
      const streakResult = await client.query(
        'SELECT * FROM user_streaks WHERE user_id = $1 FOR UPDATE',
        [user_id]
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (streakResult.rows.length === 0) {
        // Create new streak
        const result = await client.query(
          `INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_session_date)
           VALUES ($1, 1, 1, $2)
           RETURNING *`,
          [user_id, today.toISOString().split('T')[0]]
        );

        await client.query('COMMIT');
        return result.rows[0] as UserStreak;
      }

      const streak = streakResult.rows[0];
      const lastSessionDate = streak.last_session_date
        ? new Date(streak.last_session_date)
        : null;
      lastSessionDate?.setHours(0, 0, 0, 0);

      let newCurrentStreak = streak.current_streak;
      let newLongestStreak = streak.longest_streak;

      if (lastSessionDate) {
        const dayDiff = Math.floor(
          (today.getTime() - lastSessionDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (dayDiff === 1) {
          // Consecutive day - increment streak
          newCurrentStreak += 1;
          newLongestStreak = Math.max(newLongestStreak, newCurrentStreak);
        } else if (dayDiff === 0) {
          // Same day - no change
          // Do nothing
        } else {
          // Break in streak - reset
          newCurrentStreak = 1;
        }
      } else {
        // First session
        newCurrentStreak = 1;
        newLongestStreak = 1;
      }

      // Update streak
      const result = await client.query(
        `UPDATE user_streaks 
         SET current_streak = $1, longest_streak = $2, last_session_date = $3, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $4
         RETURNING *`,
        [newCurrentStreak, newLongestStreak, today.toISOString().split('T')[0], user_id]
      );

      await client.query('COMMIT');
      return result.rows[0] as UserStreak;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async resetStreakIfNeeded(user_id: string): Promise<UserStreak> {
    const streakResult = await this.pool.query(
      'SELECT * FROM user_streaks WHERE user_id = $1',
      [user_id]
    );

    if (streakResult.rows.length === 0) {
      return await this.getOrCreateStreak(user_id);
    }

    const streak = streakResult.rows[0];
    const lastSessionDate = streak.last_session_date
      ? new Date(streak.last_session_date)
      : null;

    if (!lastSessionDate) {
      return streak;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastSessionDate.setHours(0, 0, 0, 0);

    const dayDiff = Math.floor(
      (today.getTime() - lastSessionDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Reset if more than 1 day has passed
    if (dayDiff > 1) {
      const result = await this.pool.query(
        `UPDATE user_streaks 
         SET current_streak = 0, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $1
         RETURNING *`,
        [user_id]
      );

      return result.rows[0] as UserStreak;
    }

    return streak;
  }
}
