import express from 'express';
import { Pool } from 'pg';
import { PetController } from '../controllers/petController';
import { authenticate } from '../middleware/auth';

export function petRoutes(pool: Pool) {
  const router = express.Router();
  const petController = new PetController(pool);

  // Get user's pet and progression summary
  router.get('/progress-summary', authenticate, (req, res) =>
    petController.getProgressSummary(req, res)
  );

  router.get('/my-pet', authenticate, (req, res) =>
    petController.getMyPet(req, res)
  );

  // Create pet
  router.post('/', authenticate, (req, res) =>
    petController.createPet(req, res)
  );

  // Update pet name
  router.put('/name', authenticate, (req, res) =>
    petController.updatePetName(req, res)
  );

  // Add experience
  router.post('/experience', authenticate, (req, res) =>
    petController.addExperience(req, res)
  );

  return router;
}
