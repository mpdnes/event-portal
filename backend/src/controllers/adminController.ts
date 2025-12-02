import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database';
import { User } from '../types';

// ========== USER MANAGEMENT ==========

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, role, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, role, is_active, created_at FROM users WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, role, is_active } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, email = $3, role = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING id, email, first_name, last_name, role, is_active, created_at`,
      [first_name, last_name, email, role, is_active, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (id === (req as any).user?.id) {
      res.status(400).json({ error: 'Cannot delete your own account' });
      return;
    }

    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

export const resetUserPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email',
      [password_hash, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ message: 'Password reset successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

// ========== TAG MANAGEMENT ==========

export const getAllTags = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT id, name, emoji, color, description, created_at FROM tags ORDER BY name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
};

export const createTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, emoji, color, description } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Tag name is required' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO tags (name, emoji, color, description)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, emoji, color, description, created_at`,
      [name, emoji || null, color || null, description || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create tag error:', error);
    res.status(500).json({ error: 'Failed to create tag' });
  }
};

export const updateTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, emoji, color, description } = req.body;

    const result = await pool.query(
      `UPDATE tags 
       SET name = $1, emoji = $2, color = $3, description = $4
       WHERE id = $5
       RETURNING id, name, emoji, color, description, created_at`,
      [name, emoji, color, description, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Tag not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update tag error:', error);
    res.status(500).json({ error: 'Failed to update tag' });
  }
};

export const deleteTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM tags WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Tag not found' });
      return;
    }

    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(500).json({ error: 'Failed to delete tag' });
  }
};

// ========== PRESENTER MANAGEMENT ==========

export const getAllPresenters = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, bio, availability_notes, created_at FROM presenters ORDER BY name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get presenters error:', error);
    res.status(500).json({ error: 'Failed to fetch presenters' });
  }
};

export const createPresenter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, bio, availability_notes } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Presenter name is required' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO presenters (name, email, phone, bio, availability_notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, phone, bio, availability_notes, created_at`,
      [name, email || null, phone || null, bio || null, availability_notes || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create presenter error:', error);
    res.status(500).json({ error: 'Failed to create presenter' });
  }
};

export const updatePresenter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, phone, bio, availability_notes } = req.body;

    const result = await pool.query(
      `UPDATE presenters 
       SET name = $1, email = $2, phone = $3, bio = $4, availability_notes = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING id, name, email, phone, bio, availability_notes, created_at`,
      [name, email, phone, bio, availability_notes, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Presenter not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update presenter error:', error);
    res.status(500).json({ error: 'Failed to update presenter' });
  }
};

export const deletePresenter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM presenters WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Presenter not found' });
      return;
    }

    res.json({ message: 'Presenter deleted successfully' });
  } catch (error) {
    console.error('Delete presenter error:', error);
    res.status(500).json({ error: 'Failed to delete presenter' });
  }
};

// ========== DATABASE STATS ==========

export const getDatabaseStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM users'),
      pool.query('SELECT COUNT(*) as count FROM pd_sessions'),
      pool.query('SELECT COUNT(*) as count FROM registrations'),
      pool.query('SELECT COUNT(*) as count FROM tags'),
      pool.query('SELECT COUNT(*) as count FROM presenters'),
    ]);

    res.json({
      users: parseInt(stats[0].rows[0].count),
      sessions: parseInt(stats[1].rows[0].count),
      registrations: parseInt(stats[2].rows[0].count),
      tags: parseInt(stats[3].rows[0].count),
      presenters: parseInt(stats[4].rows[0].count),
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
