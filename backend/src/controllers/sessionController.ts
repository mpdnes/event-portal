import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { PDSession, PDSessionWithDetails } from '../types';

// Get all published sessions (for staff view)
export const getAllSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { start_date, end_date, tag } = req.query;

    let query = `
      SELECT
        s.*,
        p.name as presenter_name,
        p.email as presenter_email,
        COUNT(DISTINCT r.id) as registration_count,
        BOOL_OR(r.user_id = $1) as user_registered,
        json_agg(DISTINCT jsonb_build_object(
          'id', t.id,
          'name', t.name,
          'emoji', t.emoji,
          'color', t.color
        )) FILTER (WHERE t.id IS NOT NULL) as tags
      FROM pd_sessions s
      LEFT JOIN presenters p ON s.presenter_id = p.id
      LEFT JOIN registrations r ON s.id = r.session_id AND r.status = 'registered'
      LEFT JOIN session_tags st ON s.id = st.session_id
      LEFT JOIN tags t ON st.tag_id = t.id
      WHERE s.is_published = true
    `;

    const params: any[] = [userId];
    let paramIndex = 2;

    if (start_date) {
      query += ` AND s.session_date >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      query += ` AND s.session_date <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }

    if (tag) {
      query += ` AND EXISTS (
        SELECT 1 FROM session_tags st2
        JOIN tags t2 ON st2.tag_id = t2.id
        WHERE st2.session_id = s.id AND t2.name = $${paramIndex}
      )`;
      params.push(tag);
      paramIndex++;
    }

    query += ' GROUP BY s.id, p.name, p.email ORDER BY s.session_date, s.start_time';

    const result = await pool.query(query, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
};

// Get single session with full details
export const getSessionById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const result = await pool.query(
      `
      SELECT
        s.*,
        json_build_object(
          'id', p.id,
          'name', p.name,
          'email', p.email,
          'bio', p.bio
        ) as presenter,
        COUNT(DISTINCT r.id) as registration_count,
        BOOL_OR(r.user_id = $2) as user_registered,
        json_agg(DISTINCT jsonb_build_object(
          'id', t.id,
          'name', t.name,
          'emoji', t.emoji,
          'color', t.color,
          'description', t.description
        )) FILTER (WHERE t.id IS NOT NULL) as tags
      FROM pd_sessions s
      LEFT JOIN presenters p ON s.presenter_id = p.id
      LEFT JOIN registrations r ON s.id = r.session_id AND r.status = 'registered'
      LEFT JOIN session_tags st ON s.id = st.session_id
      LEFT JOIN tags t ON st.tag_id = t.id
      WHERE s.id = $1
      GROUP BY s.id, p.id, p.name, p.email, p.bio
      `,
      [id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
};

// Create new session (admin/manager only)
export const createSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      presenter_id,
      external_presenter_name,
      location,
      session_date,
      start_time,
      end_time,
      capacity,
      is_published,
      requires_password,
      session_password,
      notes,
      tags
    } = req.body;

    const userId = req.user?.id;

    // Validation
    if (!title || !session_date || !start_time || !end_time) {
      res.status(400).json({ error: 'Required fields missing' });
      return;
    }

    // Insert session
    const sessionResult = await pool.query(
      `INSERT INTO pd_sessions (
        title, description, presenter_id, external_presenter_name,
        location, session_date, start_time, end_time, capacity,
        is_published, requires_password, session_password, notes,
        status, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        title, description, presenter_id, external_presenter_name,
        location, session_date, start_time, end_time, capacity,
        is_published, requires_password, session_password, notes,
        is_published ? 'published' : 'draft', userId
      ]
    );

    const session = sessionResult.rows[0];

    // Add tags if provided
    if (tags && Array.isArray(tags) && tags.length > 0) {
      const tagValues = tags.map((tagId: string) => `('${session.id}', '${tagId}')`).join(',');
      await pool.query(`INSERT INTO session_tags (session_id, tag_id) VALUES ${tagValues}`);
    }

    res.status(201).json(session);
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
};

// Update session (admin/manager only)
export const updateSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const { tags, ...sessionData } = updates;

    // Build dynamic update query
    const fields = Object.keys(sessionData);
    const values = Object.values(sessionData);

    if (fields.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');

    const result = await pool.query(
      `UPDATE pd_sessions SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // Update tags if provided
    if (tags !== undefined) {
      await pool.query('DELETE FROM session_tags WHERE session_id = $1', [id]);

      if (Array.isArray(tags) && tags.length > 0) {
        const tagValues = tags.map((tagId: string) => `('${id}', '${tagId}')`).join(',');
        await pool.query(`INSERT INTO session_tags (session_id, tag_id) VALUES ${tagValues}`);
      }
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({ error: 'Failed to update session' });
  }
};

// Delete session (admin only)
export const deleteSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM pd_sessions WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
};

// Get admin dashboard stats
export const getAdminStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stats = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE s.status = 'published') as published_sessions,
        COUNT(*) FILTER (WHERE s.status = 'draft') as draft_sessions,
        COUNT(*) FILTER (WHERE s.status = 'completed') as completed_sessions,
        COUNT(DISTINCT r.user_id) as total_participants,
        AVG(f.rating) as average_rating
      FROM pd_sessions s
      LEFT JOIN registrations r ON s.id = r.session_id
      LEFT JOIN feedback f ON s.id = f.session_id
    `);

    // Get sessions with low signups
    const lowSignups = await pool.query(`
      SELECT s.id, s.title, s.session_date, COUNT(r.id) as signup_count
      FROM pd_sessions s
      LEFT JOIN registrations r ON s.id = r.session_id AND r.status = 'registered'
      WHERE s.status = 'published' AND s.session_date > CURRENT_DATE
      GROUP BY s.id
      HAVING COUNT(r.id) < 3
      ORDER BY s.session_date
    `);

    res.json({
      ...stats.rows[0],
      low_signup_sessions: lowSignups.rows
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
