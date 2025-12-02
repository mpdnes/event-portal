import express from 'express';
import {
  registerForSession,
  cancelRegistration,
  getUserRegistrations,
  getSessionRegistrants
} from '../controllers/registrationController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// User routes
router.post('/', authenticate, registerForSession);
router.delete('/:session_id', authenticate, cancelRegistration);
router.get('/my-registrations', authenticate, getUserRegistrations);

// Admin/Manager routes
router.get('/session/:session_id', authenticate, authorize('admin', 'manager'), getSessionRegistrants);

export default router;
