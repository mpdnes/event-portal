import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  resetUserPassword,
  getAllTags,
  createTag,
  updateTag,
  deleteTag,
  getAllPresenters,
  createPresenter,
  updatePresenter,
  deletePresenter,
  getDatabaseStats
} from '../controllers/adminController';

const router = express.Router();

// Middleware to check admin role
const adminOnly = (req: AuthRequest, res: any, next: any) => {
  if (req.user?.role !== 'admin' && req.user?.role !== 'manager') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
};

// User management
router.get('/users', authenticate, adminOnly, getAllUsers);
router.get('/users/:id', authenticate, adminOnly, getUserById);
router.put('/users/:id', authenticate, adminOnly, updateUser);
router.delete('/users/:id', authenticate, adminOnly, deleteUser);
router.post('/users/:id/reset-password', authenticate, adminOnly, resetUserPassword);

// Tag management
router.get('/tags', authenticate, adminOnly, getAllTags);
router.post('/tags', authenticate, adminOnly, createTag);
router.put('/tags/:id', authenticate, adminOnly, updateTag);
router.delete('/tags/:id', authenticate, adminOnly, deleteTag);

// Presenter management
router.get('/presenters', authenticate, adminOnly, getAllPresenters);
router.post('/presenters', authenticate, adminOnly, createPresenter);
router.put('/presenters/:id', authenticate, adminOnly, updatePresenter);
router.delete('/presenters/:id', authenticate, adminOnly, deletePresenter);

// Database stats
router.get('/stats', authenticate, adminOnly, getDatabaseStats);

export default router;
