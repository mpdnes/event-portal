# PD Portal Surveys & Email System - Deployment Guide

## Overview

This guide covers the deployment of the newly implemented surveys and email notification system in the PD Portal. Both features are now fully integrated and ready for production use.

## Prerequisites

- Node.js v18+ installed
- PostgreSQL 15+ running (Docker or local installation)
- Docker and Docker Compose installed
- Valid SMTP credentials (Gmail, SendGrid, or other provider)

## Phase 1: Database Setup

### 1.1 Start PostgreSQL (if using Docker)

```bash
cd c:\Users\mdono\Documents\Work\Programs\pd\pd-portal
docker-compose up -d postgres
```

Wait for the container to be healthy:
```bash
docker exec pd-portal-postgres pg_isready -U postgres
```

### 1.2 Run Database Migrations

Execute the survey tables migration:

```powershell
Get-Content "backend/database/add-surveys-tables.sql" | docker exec -i pd-portal-postgres psql -U postgres -d pd_portal
```

Expected output: Multiple `CREATE TABLE`, `CREATE INDEX`, and `CREATE TRIGGER` statements.

Seed email templates:

```powershell
Get-Content "backend/database/seed-email-templates.sql" | docker exec -i pd-portal-postgres psql -U postgres -d pd_portal
```

Expected output: `INSERT 0 6` (6 pre-built email templates)

### 1.3 Verify Database Setup

Connect to database and verify tables:

```powershell
docker exec -it pd-portal-postgres psql -U postgres -d pd_portal
```

Run these queries to verify:

```sql
-- List survey tables
\dt surveys* email* survey_*;

-- Count email templates
SELECT COUNT(*) FROM email_templates;

-- Verify sample template
SELECT name, subject FROM email_templates LIMIT 1;
```

## Phase 2: Environment Configuration

### 2.1 Configure Email Settings

Edit `backend/.env` and add your SMTP credentials:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@pdportal.com
```

### 2.2 Email Provider Setup

#### **Gmail Setup**
1. Enable 2-Factor Authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use generated password in `SMTP_PASSWORD`

#### **SendGrid Setup**
1. Create SendGrid account
2. Generate API key
3. Use these settings:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxxxx_your_api_key
SMTP_FROM=noreply@pdportal.com
```

#### **Other Providers**
- Outlook: `smtp.outlook.com:587`
- AWS SES: `email-smtp.region.amazonaws.com:587`
- Custom: Use your provider's SMTP details

### 2.3 Test Email Configuration

```bash
cd backend
npm run dev
```

The server will initialize email transporter on startup. Check logs for:
```
✓ Email service initialized successfully
```

## Phase 3: Backend Startup

### 3.1 Install Dependencies

```bash
cd backend
npm install
```

### 3.2 Start Backend Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Expected startup logs:
```
✓ Express server running on port 5000
✓ Connected to PostgreSQL
✓ Email service initialized
✓ Survey service initialized
```

### 3.3 Verify Backend Health

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected",
  "email": "ready"
}
```

## Phase 4: Frontend Startup

### 4.1 Install Dependencies

```bash
cd frontend
npm install
```

### 4.2 Start Frontend Server

```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

### 4.3 Login

1. Navigate to `http://localhost:5173`
2. Login with admin credentials
3. You should see new menu items in the navigation

## Phase 5: Feature Testing

### 5.1 Survey System Testing

#### Create a Survey
1. Go to Admin → Sessions
2. Click on a session
3. Click "Create Survey" (new button)
4. Fill survey details:
   - Title: "Session Feedback"
   - Description: "Please provide feedback"
   - Survey Type: "Post-Session"
5. Add questions:
   - Question 1: "Rate the session" (Rating 1-10)
   - Question 2: "What was most helpful?" (Text)
   - Question 3: "Will attend similar sessions?" (Yes/No choice)
6. Save survey

#### Publish Survey
1. From survey details, click "Publish"
2. Select session registrants (or send to all)
3. Confirm

#### Take Survey (as participant)
1. Login as staff user
2. Go to Dashboard → "My Surveys" (or `/survey/{surveyId}`)
3. Complete all questions
4. Submit

#### View Results (as admin)
1. Go to Admin → Sessions → Session → Surveys
2. Click "View Results"
3. Verify analytics display:
   - Rating questions: Bar chart
   - Multiple choice: Pie chart
   - Text questions: Individual responses

### 5.2 Email System Testing

#### Check Email Logs
1. Go to Admin → Emails
2. View "Email Logs" tab
3. Should see historical emails with status badges

#### Create Email Template
1. Go to Admin → Emails
2. Click "Add Template"
3. Fill in:
   - Name: "test_template"
   - Subject: "Test Email: {{userName}}"
   - Body: "Hello {{userName}}, this is a test."
4. Save

#### Send Email Notification
1. Go to Admin → Emails → "Send Notification" tab
2. Select recipients
3. Choose template
4. Add variable values: `{"userName": "John Doe"}`
5. Send
6. Check email logs for "Sent" status

#### Check Email Preferences (as user)
1. Login as staff user
2. Click profile → "Email Preferences"
3. Toggle notification types on/off
4. Save preferences

### 5.3 Survey Reminders

1. Go to Admin → Sessions → Survey
2. Click "Send Reminder"
3. Select which session registrants to send to
4. Confirm
5. Check email logs for reminder emails sent

## Phase 6: Production Deployment

### 6.1 Environment Variables

Ensure all required variables are set in `.env`:

```env
# Server
PORT=5000
NODE_ENV=production

# Database
DB_HOST=prod-db-host
DB_PORT=5432
DB_NAME=pd_portal
DB_USER=postgres
DB_PASSWORD=secure_password

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=prod_email@gmail.com
SMTP_PASSWORD=app_password
SMTP_FROM=noreply@pdportal.com

# JWT
JWT_SECRET=production_secret_key_min_32_chars

# Frontend
FRONTEND_URL=https://pdportal.example.com
```

### 6.2 Database Backup

Before production, backup the database:

```powershell
docker exec pd-portal-postgres pg_dump -U postgres pd_portal > backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql
```

### 6.3 Deploy Backend

```bash
cd backend
npm install --production
npm start
```

### 6.4 Deploy Frontend

```bash
cd frontend
npm install --production
npm run build
# Serve dist/ folder with web server (nginx, Apache, etc.)
```

## Troubleshooting

### Database Connection Issues

**Error**: `connect ECONNREFUSED 127.0.0.1:5432`

**Solution**:
```bash
# Check PostgreSQL is running
docker ps | findstr postgres

# Restart if needed
docker restart pd-portal-postgres
```

### Email Not Sending

**Error**: `SMTP authentication failed`

**Solutions**:
1. Verify SMTP credentials in `.env`
2. For Gmail: Ensure app password (not regular password)
3. Check SMTP_PORT is correct (usually 587 or 465)
4. If SMTP_SECURE=true, use port 465

Check backend logs:
```bash
npm run dev 2>&1 | findstr -i "email"
```

### Survey API Errors

**Error**: `POST /api/surveys 401 Unauthorized`

**Solutions**:
1. Ensure user is authenticated
2. Check JWT token is valid
3. Verify Authorization header format: `Bearer <token>`

Test with curl:
```bash
$headers = @{'Authorization' = 'Bearer your_token'}
Invoke-WebRequest -Uri http://localhost:5000/api/surveys -Headers $headers
```

### Frontend Routes Not Found

**Error**: `/admin/emails` returns 404

**Solutions**:
1. Ensure App.tsx routes are updated
2. Clear browser cache: `Ctrl+Shift+Delete`
3. Restart frontend dev server: `npm run dev`

## API Endpoints Reference

### Survey Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/surveys` | Create survey |
| GET | `/api/surveys/{id}` | Get survey details |
| GET | `/api/surveys/session/{sessionId}` | Get session surveys |
| POST | `/api/surveys/publish` | Publish survey |
| POST | `/api/surveys/close` | Close survey |
| GET | `/api/surveys/results/{id}` | Get survey results |
| POST | `/api/surveys/start` | Start response session |
| POST | `/api/surveys/submit-answer` | Submit answer |
| POST | `/api/surveys/complete` | Complete response |

### Email Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/email/send` | Send email |
| POST | `/api/email/send-survey-reminder` | Send survey reminder |
| POST | `/api/email/template` | Create template |
| GET | `/api/email/template/{name}` | Get template |
| GET | `/api/email/preferences/{userId}` | Get user preferences |
| PUT | `/api/email/preferences/{userId}` | Update preferences |
| GET | `/api/email/logs` | Get email logs |

## Monitoring

### Check System Health

```bash
# Backend health
curl http://localhost:5000/health

# Database connection
curl http://localhost:5000/api/surveys

# Email service status
curl -X POST http://localhost:5000/api/email/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token" \
  -d '{"recipient_email":"test@example.com","template_name":"test"}'
```

### View Logs

Backend logs:
```bash
docker logs -f pd-portal-postgres
```

Frontend build output:
```bash
npm run build 2>&1 | tail -20
```

## Maintenance

### Daily Tasks
- Monitor email logs for failed sends
- Check survey completion rates
- Verify database backups complete

### Weekly Tasks
- Review survey responses
- Test email delivery
- Monitor disk space

### Monthly Tasks
- Clean up old email logs: `DELETE FROM email_logs WHERE created_at < NOW() - INTERVAL '90 days'`
- Archive completed surveys
- Review user preferences

## Support

For issues or questions:
1. Check logs: `npm run dev`
2. Verify environment variables are set
3. Test database connectivity
4. Ensure SMTP credentials are valid
5. Contact development team with error logs

## Rollback Procedures

If you need to rollback the surveys/email system:

```sql
-- Backup current data
CREATE TABLE backup_surveys AS SELECT * FROM surveys;
CREATE TABLE backup_survey_responses AS SELECT * FROM survey_responses;
CREATE TABLE backup_email_logs AS SELECT * FROM email_logs;

-- Drop tables if needed (careful!)
DROP TABLE IF EXISTS survey_responses CASCADE;
DROP TABLE IF EXISTS surveys CASCADE;
DROP TABLE IF EXISTS email_logs CASCADE;
DROP TABLE IF EXISTS email_templates CASCADE;
```

Then restore from database backup file.

## Next Steps

1. ✅ Database migrations completed
2. ✅ Email configuration updated
3. ✅ Backend and frontend deployed
4. Test end-to-end workflows (see Phase 5)
5. Train staff on survey creation and email management
6. Launch to production
