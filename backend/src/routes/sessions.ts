import express from 'express';
import {
  getAllSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
  getAdminStats
} from '../controllers/sessionController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Public/authenticated routes
router.get('/', authenticate, getAllSessions);
router.get('/:id', authenticate, getSessionById);

// Admin/Manager routes
router.post('/', authenticate, authorize('admin', 'manager'), createSession);
router.put('/:id', authenticate, authorize('admin', 'manager'), updateSession);
router.delete('/:id', authenticate, authorize('admin'), deleteSession);

// Admin dashboard
router.get('/admin/stats', authenticate, authorize('admin', 'manager'), getAdminStats);

export default router;
