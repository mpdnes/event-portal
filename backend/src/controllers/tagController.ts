import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

// Get all tags
export const getAllTags = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT * FROM tags ORDER BY name'
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
};

// Create new tag (admin only)
export const createTag = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, emoji, color, description } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO tags (name, emoji, color, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, emoji, color, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      res.status(400).json({ error: 'Tag name already exists' });
      return;
    }
    console.error('Create tag error:', error);
    res.status(500).json({ error: 'Failed to create tag' });
  }
};

// Update tag (admin only)
export const updateTag = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, emoji, color, description } = req.body;

    const result = await pool.query(
      `UPDATE tags
       SET name = COALESCE($2, name),
           emoji = COALESCE($3, emoji),
           color = COALESCE($4, color),
           description = COALESCE($5, description)
       WHERE id = $1
       RETURNING *`,
      [id, name, emoji, color, description]
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

// Delete tag (admin only)
export const deleteTag = async (req: AuthRequest, res: Response): Promise<void> => {
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
