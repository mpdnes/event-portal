import express from 'express';
import {
  getAllTags,
  createTag,
  updateTag,
  deleteTag
} from '../controllers/tagController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Public/authenticated routes
router.get('/', authenticate, getAllTags);

// Admin routes
router.post('/', authenticate, authorize('admin'), createTag);
router.put('/:id', authenticate, authorize('admin'), updateTag);
router.delete('/:id', authenticate, authorize('admin'), deleteTag);

export default router;
