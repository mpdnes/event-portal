import express from 'express';
import {
  createSurvey,
  getSurvey,
  addQuestion,
  addQuestionOption,
  startSurveyResponse,
  submitAnswer,
  completeSurveyResponse,
  getSurveyResults,
  publishSurvey,
  closeSurvey,
  getSessionSurveys,
} from '../controllers/surveyController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/start', authenticate, startSurveyResponse);
router.post('/submit-answer', authenticate, submitAnswer);
router.post('/complete', authenticate, completeSurveyResponse);

// Admin/Manager routes
router.post('/', authenticate, authorize('admin', 'manager'), createSurvey);
router.get('/:survey_id', authenticate, getSurvey);
router.post('/questions', authenticate, authorize('admin', 'manager'), addQuestion);
router.post('/questions/options', authenticate, authorize('admin', 'manager'), addQuestionOption);
router.post('/publish', authenticate, authorize('admin', 'manager'), publishSurvey);
router.post('/close', authenticate, authorize('admin', 'manager'), closeSurvey);
router.get('/results/:survey_id', authenticate, authorize('admin', 'manager'), getSurveyResults);
router.get('/session/:session_id', authenticate, authorize('admin', 'manager'), getSessionSurveys);

export default router;
