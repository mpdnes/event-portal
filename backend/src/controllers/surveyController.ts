import { Request, Response } from 'express';
import SurveyService from '../services/surveyService';
import EmailService from '../services/emailService';
import pool from '../config/database';

/**
 * Create a new survey for a session
 */
export const createSurvey = async (req: Request, res: Response) => {
  try {
    const { title, description, session_id, is_anonymous, allow_multiple_responses } = req.body;
    const user_id = (req as any).user?.id;

    if (!title || !session_id) {
      return res.status(400).json({ error: 'Title and session_id required' });
    }

    const survey = await SurveyService.createSurvey({
      title,
      description,
      session_id,
      is_anonymous,
      allow_multiple_responses,
      created_by: user_id,
    });

    res.status(201).json(survey);
  } catch (error) {
    console.error('Error creating survey:', error);
    res.status(500).json({ error: 'Failed to create survey' });
  }
};

/**
 * Get survey with questions
 */
export const getSurvey = async (req: Request, res: Response) => {
  try {
    const { survey_id } = req.params;

    const survey = await SurveyService.getSurveyWithQuestions(survey_id);

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    res.json(survey);
  } catch (error) {
    console.error('Error fetching survey:', error);
    res.status(500).json({ error: 'Failed to fetch survey' });
  }
};

/**
 * Add question to survey
 */
export const addQuestion = async (req: Request, res: Response) => {
  try {
    const { survey_id, question_text, question_type, order_id, is_required, rating_scale } = req.body;

    if (!survey_id || !question_text || !question_type) {
      return res.status(400).json({ error: 'survey_id, question_text, and question_type required' });
    }

    const question = await SurveyService.addQuestion({
      survey_id,
      question_text,
      question_type,
      order_id,
      is_required,
      rating_scale,
    });

    res.status(201).json(question);
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ error: 'Failed to add question' });
  }
};

/**
 * Add option to question
 */
export const addQuestionOption = async (req: Request, res: Response) => {
  try {
    const { question_id, option_text, order_id } = req.body;

    if (!question_id || !option_text) {
      return res.status(400).json({ error: 'question_id and option_text required' });
    }

    const option = await SurveyService.addQuestionOption({
      question_id,
      option_text,
      order_id,
    });

    res.status(201).json(option);
  } catch (error) {
    console.error('Error adding option:', error);
    res.status(500).json({ error: 'Failed to add option' });
  }
};

/**
 * Start survey response
 */
export const startSurveyResponse = async (req: Request, res: Response) => {
  try {
    const { survey_id } = req.body;
    const user_id = (req as any).user?.id;

    if (!survey_id) {
      return res.status(400).json({ error: 'survey_id required' });
    }

    // Check if user already has a response (if multiple responses not allowed)
    const survey = await SurveyService.getSurveyWithQuestions(survey_id);
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    if (!survey.allow_multiple_responses && user_id) {
      const existingResponse = await pool.query(
        'SELECT * FROM survey_responses WHERE survey_id = $1 AND user_id = $2',
        [survey_id, user_id]
      );

      if (existingResponse.rows.length > 0) {
        return res.status(400).json({ error: 'You have already responded to this survey' });
      }
    }

    const response = await SurveyService.startSurveyResponse(survey_id, user_id);
    res.status(201).json(response);
  } catch (error) {
    console.error('Error starting survey response:', error);
    res.status(500).json({ error: 'Failed to start survey response' });
  }
};

/**
 * Submit survey answer
 */
export const submitAnswer = async (req: Request, res: Response) => {
  try {
    const { response_id, question_id, answer_text, rating_value, selected_option_id } = req.body;

    if (!response_id || !question_id) {
      return res.status(400).json({ error: 'response_id and question_id required' });
    }

    const answer = await SurveyService.submitAnswer({
      response_id,
      question_id,
      answer_text,
      rating_value,
      selected_option_id,
    });

    res.json(answer);
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
};

/**
 * Complete survey response
 */
export const completeSurveyResponse = async (req: Request, res: Response) => {
  try {
    const { response_id } = req.body;

    if (!response_id) {
      return res.status(400).json({ error: 'response_id required' });
    }

    const response = await SurveyService.completeSurveyResponse(response_id);
    res.json(response);
  } catch (error) {
    console.error('Error completing survey response:', error);
    res.status(500).json({ error: 'Failed to complete survey response' });
  }
};

/**
 * Get survey results
 */
export const getSurveyResults = async (req: Request, res: Response) => {
  try {
    const { survey_id } = req.params;

    const results = await SurveyService.getSurveyResults(survey_id);
    res.json(results);
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
};

/**
 * Publish survey
 */
export const publishSurvey = async (req: Request, res: Response) => {
  try {
    const { survey_id } = req.body;

    if (!survey_id) {
      return res.status(400).json({ error: 'survey_id required' });
    }

    const survey = await SurveyService.publishSurvey(survey_id);
    res.json(survey);
  } catch (error) {
    console.error('Error publishing survey:', error);
    res.status(500).json({ error: 'Failed to publish survey' });
  }
};

/**
 * Close survey
 */
export const closeSurvey = async (req: Request, res: Response) => {
  try {
    const { survey_id } = req.body;

    if (!survey_id) {
      return res.status(400).json({ error: 'survey_id required' });
    }

    const survey = await SurveyService.closeSurvey(survey_id);
    res.json(survey);
  } catch (error) {
    console.error('Error closing survey:', error);
    res.status(500).json({ error: 'Failed to close survey' });
  }
};

/**
 * Get surveys for a session
 */
export const getSessionSurveys = async (req: Request, res: Response) => {
  try {
    const { session_id } = req.params;

    const result = await pool.query(
      'SELECT * FROM surveys WHERE session_id = $1 ORDER BY created_at DESC',
      [session_id]
    );

    const surveys = await Promise.all(
      result.rows.map((survey) => SurveyService.getSurveyWithQuestions(survey.id))
    );

    res.json(surveys);
  } catch (error) {
    console.error('Error fetching surveys:', error);
    res.status(500).json({ error: 'Failed to fetch surveys' });
  }
};
