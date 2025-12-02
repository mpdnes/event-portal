import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/database';
import authRoutes from './routes/auth';
import sessionRoutes from './routes/sessions';
import registrationRoutes from './routes/registrations';
import tagRoutes from './routes/tags';
import presenterRoutes from './routes/presenters';
import adminRoutes from './routes/admin';
import { petRoutes } from './routes/pets';
import surveyRoutes from './routes/surveys';
import emailRoutes from './routes/email';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/presenters', presenterRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/pets', petRoutes(pool));
app.use('/api/surveys', surveyRoutes);
app.use('/api/email', emailRoutes);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Test database connection
pool.query('SELECT NOW()')
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch((err: any) => {
    console.error('Database query failed:', err.code || err.message);
    console.warn('Server starting without database - login and data endpoints will fail');
    if (err.code === 'ECONNREFUSED') {
      console.warn('    Check: Is PostgreSQL running on', `${process.env.DB_HOST}:${process.env.DB_PORT}?`);
    } else if (err.code === '3D000') {
      console.warn('    Check: Does database "' + process.env.DB_NAME + '" exist?');
    } else if (err.code === '28P01') {
      console.warn('    Check: Are credentials correct? (user=' + process.env.DB_USER + ')');
    }
  });

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║  🚀 PD Portal API Server Running          ║
║  📡 Port: ${PORT}                          ║
║  🌍 Environment: ${process.env.NODE_ENV || 'development'}          ║
╚═══════════════════════════════════════════╝
  `);
});

export default app;
