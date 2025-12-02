import nodemailer from 'nodemailer';
import pool from '../config/database';
import { EmailData, EmailTemplate, EmailLog } from '../types/survey';

// Initialize email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'localhost',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: process.env.EMAIL_USER ? {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  } : undefined,
});

export class EmailService {
  /**
   * Send an email from a template
   */
  static async sendFromTemplate(
    templateName: string,
    recipient: string,
    variables: Record<string, string>,
    userId?: string,
    sessionId?: string
  ): Promise<EmailLog> {
    try {
      // Get template
      const template = await this.getTemplate(templateName);
      if (!template) {
        throw new Error(`Template "${templateName}" not found`);
      }

      // Replace variables in subject and body
      let subject = template.subject;
      let htmlBody = template.html_body;
      let textBody = template.text_body || '';

      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(regex, value);
        htmlBody = htmlBody.replace(regex, value);
        textBody = textBody.replace(regex, value);
      });

      // Send email
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@pdportal.local',
        to: recipient,
        subject,
        html: htmlBody,
        text: textBody,
      });

      // Log email
      return await this.logEmail({
        recipient_email: recipient,
        subject,
        template_name: templateName,
        user_id: userId,
        session_id: sessionId,
        status: 'sent',
      });
    } catch (error) {
      console.error('Email send error:', error);
      // Log failed email
      return await this.logEmail({
        recipient_email: recipient,
        template_name: templateName,
        user_id: userId,
        session_id: sessionId,
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Send a custom email
   */
  static async sendEmail(emailData: EmailData): Promise<EmailLog> {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@pdportal.local',
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      });

      return await this.logEmail({
        recipient_email: emailData.to,
        subject: emailData.subject,
        template_name: emailData.templateName,
        user_id: emailData.userId,
        session_id: emailData.sessionId,
        status: 'sent',
      });
    } catch (error) {
      console.error('Email send error:', error);
      return await this.logEmail({
        recipient_email: emailData.to,
        subject: emailData.subject,
        user_id: emailData.userId,
        session_id: emailData.sessionId,
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get email template by name
   */
  static async getTemplate(name: string): Promise<EmailTemplate | null> {
    const result = await pool.query(
      'SELECT * FROM email_templates WHERE name = $1 AND is_active = true',
      [name]
    );
    return result.rows[0] || null;
  }

  /**
   * Create or update email template
   */
  static async upsertTemplate(template: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const {
      name,
      subject,
      html_body,
      text_body,
      template_variables,
      is_active = true,
    } = template;

    const result = await pool.query(
      `INSERT INTO email_templates (name, subject, html_body, text_body, template_variables, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (name) DO UPDATE SET
       subject = $2,
       html_body = $3,
       text_body = $4,
       template_variables = $5,
       is_active = $6,
       updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [name, subject, html_body, text_body, JSON.stringify(template_variables), is_active]
    );

    return result.rows[0];
  }

  /**
   * Log email
   */
  static async logEmail(log: Partial<EmailLog>): Promise<EmailLog> {
    const result = await pool.query(
      `INSERT INTO email_logs (recipient_email, subject, template_name, user_id, session_id, status, error_message, sent_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        log.recipient_email,
        log.subject,
        log.template_name,
        log.user_id,
        log.session_id,
        log.status || 'pending',
        log.error_message,
        log.status === 'sent' ? new Date() : null,
      ]
    );

    return result.rows[0];
  }

  /**
   * Get email logs
   */
  static async getEmailLogs(filters?: {
    user_id?: string;
    session_id?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ rows: EmailLog[]; count: number }> {
    let query = 'SELECT * FROM email_logs WHERE 1=1';
    const params: any[] = [];
    let countIndex = 1;

    if (filters?.user_id) {
      query += ` AND user_id = $${countIndex++}`;
      params.push(filters.user_id);
    }

    if (filters?.session_id) {
      query += ` AND session_id = $${countIndex++}`;
      params.push(filters.session_id);
    }

    if (filters?.status) {
      query += ` AND status = $${countIndex++}`;
      params.push(filters.status);
    }

    // Get count
    const countResult = await pool.query(
      `SELECT COUNT(*) as count FROM (${query}) as subquery`,
      params
    );
    const count = parseInt(countResult.rows[0].count, 10);

    // Get paginated results
    query += ' ORDER BY created_at DESC';
    if (filters?.limit) {
      query += ` LIMIT $${countIndex++}`;
      params.push(filters.limit);
    }
    if (filters?.offset) {
      query += ` OFFSET $${countIndex++}`;
      params.push(filters.offset);
    }

    const result = await pool.query(query, params);
    return { rows: result.rows, count };
  }

  /**
   * Check user email preferences
   */
  static async checkEmailPreferences(userId: string, preferenceType: string): Promise<boolean> {
    const result = await pool.query(
      'SELECT * FROM email_preferences WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      // Create default preferences
      await pool.query(
        `INSERT INTO email_preferences (user_id) VALUES ($1)`,
        [userId]
      );
      return true; // Default to enabled
    }

    const prefs = result.rows[0];
    const preferenceMap: Record<string, boolean> = {
      session_reminders: prefs.receive_session_reminders,
      new_sessions: prefs.receive_new_sessions,
      feedback_requests: prefs.receive_feedback_requests,
      admin_notifications: prefs.receive_admin_notifications,
    };

    return preferenceMap[preferenceType] ?? true;
  }

  /**
   * Update user email preferences
   */
  static async updateEmailPreferences(userId: string, preferences: Partial<any>): Promise<any> {
    const result = await pool.query(
      `UPDATE email_preferences SET
       receive_session_reminders = COALESCE($2, receive_session_reminders),
       receive_new_sessions = COALESCE($3, receive_new_sessions),
       receive_feedback_requests = COALESCE($4, receive_feedback_requests),
       receive_admin_notifications = COALESCE($5, receive_admin_notifications),
       updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1
       RETURNING *`,
      [
        userId,
        preferences.receive_session_reminders,
        preferences.receive_new_sessions,
        preferences.receive_feedback_requests,
        preferences.receive_admin_notifications,
      ]
    );

    return result.rows[0];
  }
}

export default EmailService;
