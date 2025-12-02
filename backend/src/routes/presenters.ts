import express from 'express';
import {
  getAllPresenters,
  getPresenterById,
  createPresenter,
  updatePresenter,
  deletePresenter
} from '../controllers/presenterController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Public/authenticated routes
router.get('/', authenticate, getAllPresenters);
router.get('/:id', authenticate, getPresenterById);

// Admin/Manager routes
router.post('/', authenticate, authorize('admin', 'manager'), createPresenter);
router.put('/:id', authenticate, authorize('admin', 'manager'), updatePresenter);
router.delete('/:id', authenticate, authorize('admin'), deletePresenter);

export default router;
