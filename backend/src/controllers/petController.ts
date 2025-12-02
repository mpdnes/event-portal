import { Request, Response } from 'express';
import { Pool } from 'pg';
import { PetService } from '../services/petService';
import { AchievementService } from '../services/achievementService';
import { StreakService } from '../services/streakService';

export class PetController {
  private petService: PetService;
  private achievementService: AchievementService;
  private streakService: StreakService;

  constructor(pool: Pool) {
    this.petService = new PetService(pool);
    this.achievementService = new AchievementService(pool);
    this.streakService = new StreakService(pool);
  }

  async getMyPet(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      let pet = await this.petService.getPetByUserId(userId);

      // Auto-create pet if doesn't exist
      if (!pet) {
        pet = await this.petService.createPet({
          user_id: userId,
          pet_name: 'My Pet',
          species: 'Dragon',
        });
      }

      const achievements = await this.achievementService.getAchievementsByUserId(userId);
      const streak = await this.streakService.getStreakByUserId(userId);

      res.json({
        pet,
        achievements,
        streak,
      });
    } catch (error) {
      console.error('Error fetching pet:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createPet(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { name = 'My Pet', pet_type = 'companion' } = req.body;

      // Check if user already has a pet
      const existingPet = await this.petService.getPetByUserId(userId);
      if (existingPet) {
        res.status(400).json({ error: 'User already has a pet' });
        return;
      }

      const pet = await this.petService.createPet({
        user_id: userId,
        pet_name: name,
        species: 'Dragon',
      });

      // Initialize streak
      await this.streakService.getOrCreateStreak(userId);

      res.status(201).json(pet);
    } catch (error) {
      console.error('Error creating pet:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updatePetName(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { name } = req.body;

      if (!userId || !name) {
        res.status(400).json({ error: 'Invalid input' });
        return;
      }

      const pet = await this.petService.getPetByUserId(userId);
      if (!pet) {
        res.status(404).json({ error: 'Pet not found' });
        return;
      }

      const updatedPet = await this.petService.updatePetName(String(pet.id), name);
      res.json(updatedPet);
    } catch (error) {
      console.error('Error updating pet name:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async addExperience(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { experience, reason, session_id } = req.body;

      if (!userId || !experience || !reason) {
        res.status(400).json({ error: 'Invalid input' });
        return;
      }

      const pet = await this.petService.getPetByUserId(userId);
      if (!pet) {
        res.status(404).json({ error: 'Pet not found' });
        return;
      }

      await this.petService.addExperience(
        String(pet.id),
        experience,
        reason,
        session_id
      );

      // Check for achievement unlocks
      const updatedPet = await this.petService.getPetById(String(pet.id));
      if (updatedPet) {
        await this.achievementService.checkAndUnlockAchievements(
          userId,
          updatedPet.experience,
          updatedPet.level,
          0 // Streak will be updated separately
        );
      }

      const result = await this.petService.getPetById(String(pet.id));
      res.json(result);
    } catch (error) {
      console.error('Error adding experience:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getProgressSummary(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      let pet = await this.petService.getPetByUserId(userId);

      // Auto-create if doesn't exist
      if (!pet) {
        try {
          pet = await this.petService.createPet({
            user_id: userId,
            pet_name: 'My Pet',
            species: 'Dragon',
          });
          await this.streakService.getOrCreateStreak(userId);
        } catch (createError) {
          console.error('Error creating pet:', createError);
          res.status(500).json({ error: 'Failed to create pet', details: createError instanceof Error ? createError.message : String(createError) });
          return;
        }
      }

      const achievements = await this.achievementService.getAchievementsByUserId(userId);
      let streak = await this.streakService.getStreakByUserId(userId);

      if (!streak) {
        streak = await this.streakService.getOrCreateStreak(userId);
      }

      res.json({
        pet,
        achievements: achievements || [],
        streak,
        summary: {
          totalSessions: pet.experience,
          totalXP: pet.experience,
          currentLevel: pet.level,
          nextLevelXP: this.calculateXPToNextLevel(pet.experience, pet.level),
          progressToNextLevel: this.calculateProgressPercentage(pet.experience, pet.level),
        },
      });
    } catch (error) {
      console.error('Error fetching progress summary:', error);
      res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) });
    }
  }

  private calculateXPToNextLevel(currentXP: number, currentLevel: number): number {
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

    const nextLevel = (currentLevel + 1) as keyof typeof levelThresholds;
    if (!levelThresholds[nextLevel]) {
      return 0;
    }

    return Math.max(0, levelThresholds[nextLevel] - currentXP);
  }

  private calculateProgressPercentage(currentXP: number, currentLevel: number): number {
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

    const currentLevelThreshold = levelThresholds[currentLevel as keyof typeof levelThresholds];
    const nextLevel = (currentLevel + 1) as keyof typeof levelThresholds;
    const nextLevelThreshold = levelThresholds[nextLevel];

    if (!nextLevelThreshold) {
      return 100;
    }

    const progress =
      ((currentXP - currentLevelThreshold) /
        (nextLevelThreshold - currentLevelThreshold)) *
      100;
    return Math.min(100, Math.max(0, progress));
  }
}
