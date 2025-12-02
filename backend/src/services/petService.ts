import { Pool } from 'pg';

export interface UserPet {
  id: string;
  user_id: string;
  name: string;
  pet_type: string;
  level: number;
  experience: number;
  total_sessions_attended: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePetInput {
  user_id: string;
  pet_name?: string;
  species?: string;
}

export class PetService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async createPet(input: CreatePetInput): Promise<UserPet> {
    const { user_id, pet_name = 'My Pet', species = 'companion' } = input;

    const result = await this.pool.query(
      `INSERT INTO user_pets (user_id, name, pet_type, level, experience, total_sessions_attended)
       VALUES ($1, $2, $3, 1, 0, 0)
       RETURNING *`,
      [user_id, pet_name, species]
    );

    return result.rows[0] as UserPet;
  }

  async getPetByUserId(user_id: string): Promise<UserPet | null> {
    try {
      const result = await this.pool.query(
        'SELECT * FROM user_pets WHERE user_id = $1',
        [user_id]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching pet by user_id:', error);
      throw error;
    }
  }

  async getPetById(pet_id: string): Promise<UserPet | null> {
    const result = await this.pool.query(
      'SELECT * FROM user_pets WHERE id = $1',
      [pet_id]
    );

    return result.rows[0] || null;
  }

  async updatePetName(pet_id: string, pet_name: string): Promise<UserPet> {
    const result = await this.pool.query(
      `UPDATE user_pets SET name = $1
       WHERE id = $2
       RETURNING *`,
      [pet_name, pet_id]
    );

    return result.rows[0] as UserPet;
  }

  async addExperience(
    pet_id: string,
    experience: number,
    reason: 'registration' | 'attendance' | 'interaction',
    session_id?: string
  ): Promise<void> {
    // Start transaction
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Update pet experience
      const petResult = await client.query(
        `UPDATE user_pets 
         SET experience = experience + $1
         WHERE id = $2
         RETURNING experience, level`,
        [experience, pet_id]
      );

      const newExperience = petResult.rows[0].experience;

      // Log the experience gain
      await client.query(
        `INSERT INTO pet_experience_log (pet_id, experience_gained, activity_type)
         VALUES ($1, $2, $3)`,
        [pet_id, experience, reason]
      );

      // Calculate new level
      const newLevel = this.calculateLevel(newExperience);

      // Update pet level
      await client.query(
        `UPDATE user_pets SET level = $1 WHERE id = $2`,
        [newLevel, pet_id]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async incrementSessionCount(pet_id: string): Promise<void> {
    await this.pool.query(
      `UPDATE user_pets 
       SET total_sessions_attended = total_sessions_attended + 1
       WHERE id = $1`,
      [pet_id]
    );
  }

  private calculateLevel(experience: number): number {
    const levelThresholds: { [key: number]: number } = {
      1: 0,
      2: 100,
      3: 250,
      4: 450,
      5: 700,
      6: 1000,
      7: 1350,
      8: 1750,
      9: 2200,
      10: 2700,
    };

    for (let level = 10; level >= 1; level--) {
      if (experience >= levelThresholds[level]) {
        return level;
      }
    }
    return 1;
  }

  async getExperienceHistory(
    pet_id: string,
    limit: number = 50
  ): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT * FROM pet_experience_log 
       WHERE user_pet_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [pet_id, limit]
    );

    return result.rows;
  }
}
