import { Request, Response } from 'express';
import EmailService from '../services/emailService';
import pool from '../config/database';

/**
 * Send a notification email to user(s)
 */
export const sendNotification = async (req: Request, res: Response) => {
  try {
    const { recipient_email, template_name, variables, user_id, session_id } = req.body;

    if (!recipient_email || !template_name) {
      return res.status(400).json({ error: 'recipient_email and template_name required' });
    }

    const result = await EmailService.sendFromTemplate(
      template_name,
      recipient_email,
      variables || {},
      user_id,
      session_id
    );

    res.json(result);
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
};

/**
 * Send registration confirmation email
 */
export const sendRegistrationConfirmation = async (req: Request, res: Response) => {
  try {
    const { registration_id } = req.body;

    if (!registration_id) {
      return res.status(400).json({ error: 'registration_id required' });
    }

    // Get registration details
    const regResult = await pool.query(
      `SELECT r.*, ps.title as session_title, ps.session_date, ps.start_time, 
              u.email, u.first_name
       FROM registrations r
       JOIN pd_sessions ps ON r.session_id = ps.id
       JOIN users u ON r.user_id = u.id
       WHERE r.id = $1`,
      [registration_id]
    );

    if (regResult.rows.length === 0) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    const reg = regResult.rows[0];

    // Check user preferences
    const canEmail = await EmailService.checkEmailPreferences(reg.user_id, 'new_sessions');
    if (!canEmail) {
      return res.status(200).json({ message: 'User has opted out of emails' });
    }

    const result = await EmailService.sendFromTemplate(
      'registration_confirmation',
      reg.email,
      {
        first_name: reg.first_name,
        session_title: reg.session_title,
        session_date: new Date(reg.session_date).toLocaleDateString(),
        session_time: reg.start_time,
      },
      reg.user_id,
      reg.session_id
    );

    res.json(result);
  } catch (error) {
    console.error('Error sending confirmation:', error);
    res.status(500).json({ error: 'Failed to send confirmation' });
  }
};

/**
 * Send survey reminder email
 */
export const sendSurveyReminder = async (req: Request, res: Response) => {
  try {
    const { survey_id, user_ids } = req.body;

    if (!survey_id) {
      return res.status(400).json({ error: 'survey_id required' });
    }

    // Get survey details
    const surveyResult = await pool.query(
      `SELECT s.*, ps.title as session_title
       FROM surveys s
       JOIN pd_sessions ps ON s.session_id = ps.id
       WHERE s.id = $1`,
      [survey_id]
    );

    if (surveyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    const survey = surveyResult.rows[0];

    // Get users to email
    let users;
    if (user_ids && user_ids.length > 0) {
      const placeholders = user_ids.map((_: any, i: number) => `$${i + 1}`).join(',');
      const userResult = await pool.query(
        `SELECT id, email, first_name FROM users WHERE id IN (${placeholders})`,
        user_ids
      );
      users = userResult.rows;
    } else {
      // Get users from registrations
      const userResult = await pool.query(
        `SELECT DISTINCT u.id, u.email, u.first_name
         FROM users u
         JOIN registrations r ON u.id = r.user_id
         WHERE r.session_id = $1`,
        [survey.session_id]
      );
      users = userResult.rows;
    }

    // Send emails
    const results = await Promise.all(
      users.map((user) =>
        EmailService.sendFromTemplate(
          'survey_reminder',
          user.email,
          {
            first_name: user.first_name,
            survey_title: survey.title,
            session_title: survey.session_title,
          },
          user.id,
          survey.session_id
        )
      )
    );

    res.json({ sent: results.length, results });
  } catch (error) {
    console.error('Error sending survey reminder:', error);
    res.status(500).json({ error: 'Failed to send survey reminder' });
  }
};

/**
 * Get email template by name
 */
export const getTemplate = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;

    const template = await EmailService.getTemplate(name);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
};

/**
 * Create or update email template
 */
export const upsertTemplate = async (req: Request, res: Response) => {
  try {
    const { name, subject, html_body, text_body, template_variables, is_active } = req.body;

    if (!name || !subject || !html_body) {
      return res.status(400).json({ error: 'name, subject, and html_body required' });
    }

    const template = await EmailService.upsertTemplate({
      name,
      subject,
      html_body,
      text_body,
      template_variables,
      is_active,
    });

    res.json(template);
  } catch (error) {
    console.error('Error upserting template:', error);
    res.status(500).json({ error: 'Failed to upsert template' });
  }
};

/**
 * Get email logs
 */
export const getEmailLogs = async (req: Request, res: Response) => {
  try {
    const { user_id, session_id, status, limit, offset } = req.query;

    const results = await EmailService.getEmailLogs({
      user_id: user_id as string,
      session_id: session_id as string,
      status: status as string,
      limit: limit ? parseInt(limit as string) : 50,
      offset: offset ? parseInt(offset as string) : 0,
    });

    res.json(results);
  } catch (error) {
    console.error('Error fetching email logs:', error);
    res.status(500).json({ error: 'Failed to fetch email logs' });
  }
};

/**
 * Get user email preferences
 */
export const getEmailPreferences = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;

    const result = await pool.query(
      'SELECT * FROM email_preferences WHERE user_id = $1',
      [user_id]
    );

    if (result.rows.length === 0) {
      // Create default preferences
      await pool.query(
        'INSERT INTO email_preferences (user_id) VALUES ($1)',
        [user_id]
      );
      const newResult = await pool.query(
        'SELECT * FROM email_preferences WHERE user_id = $1',
        [user_id]
      );
      return res.json(newResult.rows[0]);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
};

/**
 * Update user email preferences
 */
export const updateEmailPreferences = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const { receive_session_reminders, receive_new_sessions, receive_feedback_requests, receive_admin_notifications } =
      req.body;

    const preferences = await EmailService.updateEmailPreferences(user_id, {
      receive_session_reminders,
      receive_new_sessions,
      receive_feedback_requests,
      receive_admin_notifications,
    });

    res.json(preferences);
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
};
