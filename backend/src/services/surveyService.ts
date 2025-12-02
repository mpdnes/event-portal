import pool from '../config/database';
import {
  Survey,
  SurveyQuestion,
  SurveyQuestionOption,
  SurveyResponse,
  SurveyAnswer,
  SurveyWithQuestions,
} from '../types/survey';

export class SurveyService {
  /**
   * Create a new survey
   */
  static async createSurvey(survey: Partial<Survey>): Promise<Survey> {
    const result = await pool.query(
      `INSERT INTO surveys (title, description, session_id, status, is_anonymous, allow_multiple_responses, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        survey.title,
        survey.description || null,
        survey.session_id,
        survey.status || 'draft',
        survey.is_anonymous || false,
        survey.allow_multiple_responses || false,
        survey.created_by,
      ]
    );
    return result.rows[0];
  }

  /**
   * Get survey with all questions and options
   */
  static async getSurveyWithQuestions(surveyId: string): Promise<SurveyWithQuestions | null> {
    const surveyResult = await pool.query('SELECT * FROM surveys WHERE id = $1', [surveyId]);

    if (surveyResult.rows.length === 0) {
      return null;
    }

    const survey = surveyResult.rows[0];

    const questionsResult = await pool.query(
      'SELECT * FROM survey_questions WHERE survey_id = $1 ORDER BY order_id ASC',
      [surveyId]
    );

    const questions = await Promise.all(
      questionsResult.rows.map(async (question) => {
        const optionsResult = await pool.query(
          'SELECT * FROM survey_question_options WHERE question_id = $1 ORDER BY order_id ASC',
          [question.id]
        );
        return {
          ...question,
          options: optionsResult.rows,
        };
      })
    );

    const responseCountResult = await pool.query(
      'SELECT COUNT(DISTINCT user_id) as count FROM survey_responses WHERE survey_id = $1 AND completed = true',
      [surveyId]
    );

    return {
      ...survey,
      questions,
      response_count: parseInt(responseCountResult.rows[0].count, 10),
    };
  }

  /**
   * Add question to survey
   */
  static async addQuestion(question: Partial<SurveyQuestion>): Promise<SurveyQuestion> {
    const result = await pool.query(
      `INSERT INTO survey_questions (survey_id, question_text, question_type, order_id, is_required, rating_scale)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        question.survey_id,
        question.question_text,
        question.question_type,
        question.order_id || 0,
        question.is_required !== false,
        question.rating_scale || 5,
      ]
    );
    return result.rows[0];
  }

  /**
   * Add option to a multiple choice question
   */
  static async addQuestionOption(option: Partial<SurveyQuestionOption>): Promise<SurveyQuestionOption> {
    const result = await pool.query(
      `INSERT INTO survey_question_options (question_id, option_text, order_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [option.question_id, option.option_text, option.order_id || 0]
    );
    return result.rows[0];
  }

  /**
   * Start a survey response
   */
  static async startSurveyResponse(surveyId: string, userId?: string): Promise<SurveyResponse> {
    const result = await pool.query(
      `INSERT INTO survey_responses (survey_id, user_id, started_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       RETURNING *`,
      [surveyId, userId || null]
    );
    return result.rows[0];
  }

  /**
   * Submit an answer to a survey question
   */
  static async submitAnswer(answer: Partial<SurveyAnswer>): Promise<SurveyAnswer> {
    const result = await pool.query(
      `INSERT INTO survey_answers (response_id, question_id, answer_text, rating_value, selected_option_id)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (response_id, question_id) DO UPDATE SET
       answer_text = EXCLUDED.answer_text,
       rating_value = EXCLUDED.rating_value,
       selected_option_id = EXCLUDED.selected_option_id
       RETURNING *`,
      [
        answer.response_id,
        answer.question_id,
        answer.answer_text || null,
        answer.rating_value || null,
        answer.selected_option_id || null,
      ]
    );
    return result.rows[0];
  }

  /**
   * Complete a survey response
   */
  static async completeSurveyResponse(responseId: string): Promise<SurveyResponse> {
    const result = await pool.query(
      `UPDATE survey_responses SET completed = true, submitted_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [responseId]
    );
    return result.rows[0];
  }

  /**
   * Get survey responses (with filtering)
   */
  static async getSurveyResponses(surveyId: string, filters?: {
    completed_only?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ rows: SurveyResponse[]; count: number }> {
    let query = 'SELECT * FROM survey_responses WHERE survey_id = $1';
    const params: any[] = [surveyId];

    if (filters?.completed_only) {
      query += ' AND completed = true';
    }

    // Get count
    const countResult = await pool.query(`SELECT COUNT(*) as count FROM (${query}) as subquery`, params);
    const count = parseInt(countResult.rows[0].count, 10);

    query += ' ORDER BY submitted_at DESC';
    if (filters?.limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(filters.limit);
    }
    if (filters?.offset) {
      query += ` OFFSET $${params.length + 1}`;
      params.push(filters.offset);
    }

    const result = await pool.query(query, params);
    return { rows: result.rows, count };
  }

  /**
   * Get survey results/analytics
   */
  static async getSurveyResults(surveyId: string): Promise<any> {
    const surveyResult = await pool.query('SELECT * FROM surveys WHERE id = $1', [surveyId]);

    if (surveyResult.rows.length === 0) {
      throw new Error('Survey not found');
    }

    const survey = surveyResult.rows[0];

    const questionsResult = await pool.query(
      'SELECT * FROM survey_questions WHERE survey_id = $1 ORDER BY order_id ASC',
      [surveyId]
    );

    const results: any = {
      survey_id: surveyId,
      total_responses: 0,
      questions: [],
    };

    // Get response count
    const responseCountResult = await pool.query(
      'SELECT COUNT(DISTINCT user_id) as count FROM survey_responses WHERE survey_id = $1 AND completed = true',
      [surveyId]
    );
    results.total_responses = parseInt(responseCountResult.rows[0].count, 10);

    // Process each question
    for (const question of questionsResult.rows) {
      const questionData: any = {
        question_id: question.id,
        question_text: question.question_text,
        question_type: question.question_type,
        responses: [],
      };

      if (question.question_type === 'rating') {
        // Get rating distribution
        const ratingResult = await pool.query(
          `SELECT rating_value, COUNT(*) as count
           FROM survey_answers sa
           JOIN survey_responses sr ON sa.response_id = sr.id
           WHERE sa.question_id = $1 AND sr.completed = true
           GROUP BY rating_value
           ORDER BY rating_value`,
          [question.id]
        );

        const ratings: Record<number, number> = {};
        for (let i = 1; i <= question.rating_scale; i++) {
          ratings[i] = 0;
        }
        ratingResult.rows.forEach((row) => {
          ratings[row.rating_value] = parseInt(row.count, 10);
        });

        questionData.rating_distribution = ratings;
        questionData.average_rating =
          ratingResult.rows.length > 0
            ? (
                ratingResult.rows.reduce(
                  (sum, row) => sum + row.rating_value * row.count,
                  0
                ) / results.total_responses
              ).toFixed(2)
            : null;
      } else if (question.question_type === 'multiple_choice' || question.question_type === 'checkbox') {
        // Get option distribution
        const optionsResult = await pool.query(
          'SELECT * FROM survey_question_options WHERE question_id = $1 ORDER BY order_id ASC',
          [question.id]
        );

        for (const option of optionsResult.rows) {
          const countResult = await pool.query(
            `SELECT COUNT(*) as count
             FROM survey_answers sa
             JOIN survey_responses sr ON sa.response_id = sr.id
             WHERE sa.question_id = $1 AND sa.selected_option_id = $2 AND sr.completed = true`,
            [question.id, option.id]
          );

          questionData.responses.push({
            option_id: option.id,
            option_text: option.option_text,
            count: parseInt(countResult.rows[0].count, 10),
          });
        }
      } else if (question.question_type === 'text') {
        // Get all text responses
        const textResult = await pool.query(
          `SELECT answer_text
           FROM survey_answers sa
           JOIN survey_responses sr ON sa.response_id = sr.id
           WHERE sa.question_id = $1 AND sr.completed = true`,
          [question.id]
        );

        questionData.responses = textResult.rows.map((row) => row.answer_text).filter(Boolean);
      }

      results.questions.push(questionData);
    }

    return results;
  }

  /**
   * Publish survey
   */
  static async publishSurvey(surveyId: string): Promise<Survey> {
    const result = await pool.query(
      "UPDATE surveys SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [surveyId]
    );
    return result.rows[0];
  }

  /**
   * Close survey
   */
  static async closeSurvey(surveyId: string): Promise<Survey> {
    const result = await pool.query(
      "UPDATE surveys SET status = 'closed', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [surveyId]
    );
    return result.rows[0];
  }

  /**
   * Delete survey and all responses
   */
  static async deleteSurvey(surveyId: string): Promise<void> {
    await pool.query('DELETE FROM surveys WHERE id = $1', [surveyId]);
  }
}

export default SurveyService;
