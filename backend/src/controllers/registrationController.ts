import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

// Register for a session
export const registerForSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { session_id } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Check if session exists and is published
    const sessionCheck = await pool.query(
      'SELECT id, capacity, status FROM pd_sessions WHERE id = $1',
      [session_id]
    );

    if (sessionCheck.rows.length === 0) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const session = sessionCheck.rows[0];

    if (session.status !== 'published') {
      res.status(400).json({ error: 'Session is not available for registration' });
      return;
    }

    // Check if already registered
    const existingReg = await pool.query(
      'SELECT id FROM registrations WHERE session_id = $1 AND user_id = $2',
      [session_id, userId]
    );

    if (existingReg.rows.length > 0) {
      res.status(400).json({ error: 'Already registered for this session' });
      return;
    }

    // Check capacity
    if (session.capacity) {
      const registrationCount = await pool.query(
        'SELECT COUNT(*) as count FROM registrations WHERE session_id = $1 AND status = $2',
        [session_id, 'registered']
      );

      if (parseInt(registrationCount.rows[0].count) >= session.capacity) {
        res.status(400).json({ error: 'Session is full' });
        return;
      }
    }

    // Create registration
    const result = await pool.query(
      `INSERT INTO registrations (session_id, user_id, status)
       VALUES ($1, $2, 'registered')
       RETURNING *`,
      [session_id, userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register for session' });
  }
};

// Cancel registration
export const cancelRegistration = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { session_id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const result = await pool.query(
      `UPDATE registrations
       SET status = 'cancelled'
       WHERE session_id = $1 AND user_id = $2 AND status = 'registered'
       RETURNING *`,
      [session_id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Registration not found' });
      return;
    }

    res.json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    console.error('Cancel registration error:', error);
    res.status(500).json({ error: 'Failed to cancel registration' });
  }
};

// Get user's registrations
export const getUserRegistrations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const result = await pool.query(
      `
      SELECT
        r.*,
        json_build_object(
          'id', s.id,
          'title', s.title,
          'description', s.description,
          'session_date', s.session_date,
          'start_time', s.start_time,
          'end_time', s.end_time,
          'location', s.location,
          'presenter_name', p.name,
          'external_presenter_name', s.external_presenter_name,
          'tags', COALESCE(
            json_agg(
              json_build_object(
                'id', t.id,
                'name', t.name,
                'emoji', t.emoji,
                'color', t.color
              )
            ) FILTER (WHERE t.id IS NOT NULL),
            '[]'::json
          )
        ) as session
      FROM registrations r
      JOIN pd_sessions s ON r.session_id = s.id
      LEFT JOIN presenters p ON s.presenter_id = p.id
      LEFT JOIN session_tags st ON s.id = st.session_id
      LEFT JOIN tags t ON st.tag_id = t.id
      WHERE r.user_id = $1 AND r.status = 'registered'
      GROUP BY r.id, s.id, p.id
      ORDER BY s.session_date, s.start_time
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
};

// Get session registrants (admin/manager only)
export const getSessionRegistrants = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { session_id } = req.params;

    const result = await pool.query(
      `
      SELECT
        r.*,
        json_build_object(
          'id', u.id,
          'email', u.email,
          'first_name', u.first_name,
          'last_name', u.last_name
        ) as user
      FROM registrations r
      JOIN users u ON r.user_id = u.id
      WHERE r.session_id = $1 AND r.status = 'registered'
      ORDER BY r.registered_at
      `,
      [session_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get registrants error:', error);
    res.status(500).json({ error: 'Failed to fetch registrants' });
  }
};
