import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

// Get all presenters
export const getAllPresenters = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT * FROM presenters ORDER BY name'
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get presenters error:', error);
    res.status(500).json({ error: 'Failed to fetch presenters' });
  }
};

// Get single presenter
export const getPresenterById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM presenters WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Presenter not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get presenter error:', error);
    res.status(500).json({ error: 'Failed to fetch presenter' });
  }
};

// Create new presenter (admin/manager)
export const createPresenter = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone, bio, availability_notes } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO presenters (name, email, phone, bio, availability_notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, email, phone, bio, availability_notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create presenter error:', error);
    res.status(500).json({ error: 'Failed to create presenter' });
  }
};

// Update presenter (admin/manager)
export const updatePresenter = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, phone, bio, availability_notes } = req.body;

    const result = await pool.query(
      `UPDATE presenters
       SET name = COALESCE($2, name),
           email = COALESCE($3, email),
           phone = COALESCE($4, phone),
           bio = COALESCE($5, bio),
           availability_notes = COALESCE($6, availability_notes)
       WHERE id = $1
       RETURNING *`,
      [id, name, email, phone, bio, availability_notes]
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

// Delete presenter (admin)
export const deletePresenter = async (req: AuthRequest, res: Response): Promise<void> => {
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
