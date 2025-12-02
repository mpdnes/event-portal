import express from 'express';
import {
  sendNotification,
  sendRegistrationConfirmation,
  sendSurveyReminder,
  getTemplate,
  upsertTemplate,
  getEmailLogs,
  getEmailPreferences,
  updateEmailPreferences,
} from '../controllers/emailController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// User routes
router.get('/preferences/:user_id', authenticate, getEmailPreferences);
router.put('/preferences/:user_id', authenticate, updateEmailPreferences);

// Admin routes
router.post('/send', authenticate, authorize('admin', 'manager'), sendNotification);
router.post('/send-confirmation', authenticate, authorize('admin'), sendRegistrationConfirmation);
router.post('/send-survey-reminder', authenticate, authorize('admin', 'manager'), sendSurveyReminder);

// Template management
router.get('/template/:name', authenticate, authorize('admin'), getTemplate);
router.post('/template', authenticate, authorize('admin'), upsertTemplate);

// Logs
router.get('/logs', authenticate, authorize('admin'), getEmailLogs);

export default router;
