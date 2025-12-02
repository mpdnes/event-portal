# PD Portal - Professional Development Management System

A modern, full-stack web application for managing professional development sessions, training programs, and staff engagement activities.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

### For Staff
- **Session Discovery**: Browse and search upcoming PD sessions
- **Easy Registration**: One-click registration with calendar integration
- **Personal Dashboard**: Track your registered sessions and attendance history
- **Email Notifications**: Receive reminders and updates about sessions
- **Survey Participation**: Provide feedback through integrated surveys
- **Email Preferences**: Customize notification settings

### For Administrators
- **Session Management**: Create, edit, and publish PD sessions
- **Presenter Management**: Maintain a database of presenters and facilitators
- **Registration Tracking**: View attendance, waitlists, and capacity
- **Analytics Dashboard**: Track participation metrics and trends
- **Survey Builder**: Create custom surveys with multiple question types
- **Email System**: Send notifications with customizable templates
- **Tagging System**: Categorize sessions for better discovery

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 14+
- **Authentication**: JWT with bcrypt password hashing
- **Email**: Nodemailer with SMTP support

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **State Management**: React Context + Hooks

## Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher (or Docker)
- npm or yarn package manager

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/pd-portal.git
cd pd-portal
```

### 2. Set Up the Database

**Option A: Using Docker (Recommended)**

```bash
docker run --name pd-portal-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=pd_portal \
  -p 5432:5432 \
  -d postgres:14
```

**Option B: Using Local PostgreSQL**

```bash
createdb pd_portal
```

**Apply Database Schema and Seeds**

```bash
psql -U postgres -d pd_portal -f backend/database/schema.sql
psql -U postgres -d pd_portal -f backend/database/seeds.sql
```

### 3. Configure Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials and SMTP settings
```

**Required Environment Variables** (see `.env.example`):
- `DB_PASSWORD`: Your PostgreSQL password
- `JWT_SECRET`: Secret key for JWT tokens (generate a secure random string)
- SMTP settings for email functionality

### 4. Start Backend Server

```bash
npm run dev
# Backend will run on http://localhost:5000
```

### 5. Configure Frontend

```bash
cd ../frontend
npm install
npm run dev
# Frontend will run on http://localhost:5173
```

### 6. Create an Admin Account

1. Open http://localhost:5173 in your browser
2. Click "Register" and create an account
3. In PostgreSQL, promote your user to admin:

```bash
psql -U postgres -d pd_portal
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
\q
```

4. Refresh the browser and log in

## Documentation

- **[Quick Start Guide](QUICK_START.md)** - Step-by-step setup instructions
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Production deployment instructions
- **[Testing Guide](TESTING_GUIDE.md)** - How to test features
- **[API Documentation](#api-endpoints)** - REST API reference

## Project Structure

```
pd-portal/
├── backend/              # Express.js backend API
│   ├── src/
│   │   ├── config/      # Database and app configuration
│   │   ├── controllers/ # Request handlers
│   │   ├── middleware/  # Auth and validation middleware
│   │   ├── models/      # Data models
│   │   ├── routes/      # API route definitions
│   │   ├── services/    # Business logic (email, surveys, etc.)
│   │   └── server.ts    # Express app entry point
│   ├── database/        # SQL schema and seed files
│   └── package.json
│
├── frontend/            # React frontend application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components (admin, staff, auth)
│   │   ├── services/    # API client services
│   │   ├── context/     # React context for auth
│   │   └── App.tsx      # Main app component
│   └── package.json
│
└── docs/                # Additional documentation
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate and get JWT token
- `GET /api/auth/me` - Get current user profile

### Sessions
- `GET /api/sessions` - List all sessions (with filters)
- `GET /api/sessions/:id` - Get session details
- `POST /api/sessions` - Create new session (admin only)
- `PUT /api/sessions/:id` - Update session (admin only)
- `DELETE /api/sessions/:id` - Delete session (admin only)

### Registrations
- `POST /api/registrations` - Register for a session
- `GET /api/registrations/user/:userId` - Get user's registrations
- `GET /api/registrations/session/:sessionId` - Get session attendees
- `DELETE /api/registrations/:id` - Cancel registration

### Surveys
- `POST /api/surveys` - Create survey (admin only)
- `GET /api/surveys/:id` - Get survey details
- `POST /api/surveys/:id/responses` - Submit survey response
- `GET /api/surveys/results/:id` - Get survey results (admin only)

### Email
- `POST /api/email/send` - Send notification email (admin only)
- `GET /api/email/logs` - View email logs (admin only)
- `GET /api/email/preferences/:userId` - Get user email preferences
- `PUT /api/email/preferences/:userId` - Update email preferences

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Role-Based Access Control**: Admin, Manager, and Staff roles
- **SQL Injection Protection**: Parameterized queries
- **CORS Configuration**: Configured for frontend origin
- **Input Validation**: Express-validator middleware

## Testing

Run the test suite:

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

See [TESTING_GUIDE.md](TESTING_GUIDE.md) for detailed testing procedures.

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production` in backend `.env`
- [ ] Use strong, unique `JWT_SECRET` and `DB_PASSWORD`
- [ ] Configure production SMTP credentials
- [ ] Set up SSL/TLS certificates (HTTPS)
- [ ] Configure firewall rules for database
- [ ] Set up automated database backups
- [ ] Configure frontend API URL for production backend
- [ ] Build frontend for production: `npm run build`
- [ ] Use a process manager (PM2) for backend

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for complete deployment instructions.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Write TypeScript with strict type checking
- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

Built with modern web technologies and best practices to provide a seamless professional development management experience.

## Support

For questions or issues:
- Open an issue on GitHub
- Check existing documentation
- Review the [FAQ section](#faq) below

## FAQ

**Q: How do I reset a user's password?**  
A: Admins can reset passwords through the database or implement a password reset flow using the email system.

**Q: Can I customize email templates?**  
A: Yes! Email templates are stored in the database and can be edited through the admin interface or directly in SQL.

**Q: What if sessions overlap?**  
A: The system allows overlapping sessions but displays warnings when users try to register for concurrent sessions.

**Q: How do I backup the database?**  
A: Use PostgreSQL's `pg_dump` command:
```bash
pg_dump -U postgres pd_portal > backup.sql
```

**Q: Can I integrate with calendar systems?**  
A: The system supports iCal export. Future versions may include Google Calendar and Outlook integration.

---

**Made for professional development teams everywhere**
