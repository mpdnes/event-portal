# Migration & Setup Checklist

## Pre-Implementation Checklist

- [ ] Backup PostgreSQL database
- [ ] Stop running backend server
- [ ] Have email service credentials ready (Gmail, SendGrid, etc.)

## Database Migration

### 1. Apply Survey & Email Tables

```bash
cd backend
psql -U postgres -d pd_portal -f database/add-surveys-tables.sql
```

Verify:
```bash
psql -U postgres -d pd_portal -c "\dt" | grep survey
psql -U postgres -d pd_portal -c "\dt" | grep email
```

Should see 8 survey tables and 3 email tables.

### 2. Seed Email Templates

```bash
psql -U postgres -d pd_portal -f database/seed-email-templates.sql
```

Verify:
```bash
psql -U postgres -d pd_portal -c "SELECT name FROM email_templates;"
```

Should see 6 templates listed.

## Backend Configuration

### 1. Environment Setup

```bash
cd backend
cp .env.example .env  # (if not already configured)
```

Update `.env` with email configuration:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com              # or your SMTP provider
EMAIL_PORT=587                         # 587 for TLS, 465 for SSL
EMAIL_SECURE=false                     # true for 465, false for 587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password       # Use app-specific password for Gmail
EMAIL_FROM=noreply@yourorg.com
```

**Gmail Setup Example:**
1. Enable 2FA on Gmail account
2. Generate app password at https://myaccount.google.com/apppasswords
3. Use the 16-character password in EMAIL_PASSWORD

### 2. Install Dependencies

```bash
npm install
# (nodemailer should already be in package.json)
```

Verify:
```bash
npm list nodemailer
```

### 3. Verify Routes are Registered

Check `backend/src/server.ts` should have:
```typescript
import surveyRoutes from './routes/surveys';
import emailRoutes from './routes/email';

// ... in app.use():
app.use('/api/surveys', surveyRoutes);
app.use('/api/email', emailRoutes);
```

## Testing

### 1. Start Backend

```bash
npm run dev
```

Wait for: `🚀 PD Portal API Server Running`

### 2. Test Survey API

```bash
# Get a user ID first (assuming admin user exists)
USER_ID="your-admin-uuid"
SESSION_ID="your-session-uuid"
TOKEN="your-jwt-token"

# Create a test survey
curl -X POST http://localhost:5000/api/surveys \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Survey",
    "description": "Testing the survey system",
    "session_id": "'$SESSION_ID'",
    "is_anonymous": true
  }'
```

### 3. Test Email API

```bash
# Create a test email template
curl -X POST http://localhost:5000/api/email/template \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test_email",
    "subject": "Test Email from {{first_name}}",
    "html_body": "<h1>Hello {{first_name}}</h1><p>This is a test.</p>",
    "text_body": "Hello {{first_name}}\n\nThis is a test.",
    "template_variables": ["first_name"],
    "is_active": true
  }'

# Send a test email
curl -X POST http://localhost:5000/api/email/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_email": "your-email@example.com",
    "template_name": "test_email",
    "variables": {
      "first_name": "John"
    }
  }'

# Check email logs
curl http://localhost:5000/api/email/logs \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Verify Database

```bash
# Check surveys table
psql -U postgres -d pd_portal -c "SELECT * FROM surveys;"

# Check email templates
psql -U postgres -d pd_portal -c "SELECT name, is_active FROM email_templates;"

# Check email logs
psql -U postgres -d pd_portal -c "SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 5;"
```

## Frontend Integration

### 1. Update Admin Dashboard

Add survey management to session detail page:
```tsx
import SurveyBuilder from '@/components/surveys/SurveyBuilder';

// In session detail component:
<SurveyBuilder 
  sessionId={sessionId}
  onSurveyCreated={(id) => {
    console.log('Survey created:', id);
    // Optionally refresh page or show success
  }}
/>
```

### 2. Add Survey Taker Page

Create new route: `/survey/:surveyId`
```tsx
import SurveyTaker from '@/components/surveys/SurveyTaker';

<SurveyTaker 
  surveyId={surveyId}
  onComplete={() => navigate('/sessions')}
/>
```

### 3. Add Email Preferences Page

Create user settings page:
```tsx
import { useEffect, useState } from 'react';
import axios from 'axios';

export function EmailPreferences() {
  const [prefs, setPrefs] = useState(null);
  
  useEffect(() => {
    axios.get(`/api/email/preferences/${userId}`)
      .then(res => setPrefs(res.data));
  }, []);
  
  const handleUpdate = async (updated) => {
    await axios.put(`/api/email/preferences/${userId}`, updated);
  };
  
  // Render preference toggles
}
```

## Automation Setup (Optional)

### 1. Survey Reminders (Cron Job)

Create `backend/scripts/send-survey-reminders.ts`:
```typescript
import axios from 'axios';
import pool from '../config/database';

export async function sendSurveyReminders() {
  // Find surveys that became active today
  const surveys = await pool.query(
    "SELECT * FROM surveys WHERE status = 'active' AND DATE(created_at) = CURRENT_DATE"
  );
  
  for (const survey of surveys.rows) {
    // Send reminder emails
    // ...
  }
}
```

Add to cron or task scheduler:
```bash
# Run daily at 8 AM
0 8 * * * cd /path/to/backend && npx ts-node scripts/send-survey-reminders.ts
```

### 2. Session Reminders (Cron Job)

Similar setup for session day reminders:
```bash
# Run daily at 9 AM
0 9 * * * cd /path/to/backend && npx ts-node scripts/send-session-reminders.ts
```

## Troubleshooting

### Email Not Sending

1. **Check email configuration:**
   ```bash
   echo $EMAIL_HOST $EMAIL_PORT $EMAIL_USER
   ```

2. **Check email logs:**
   ```bash
   psql -U postgres -d pd_portal -c "SELECT * FROM email_logs WHERE status = 'failed' ORDER BY created_at DESC;"
   ```

3. **Test SMTP connection:**
   ```bash
   telnet $EMAIL_HOST $EMAIL_PORT
   ```

4. **Gmail specific:**
   - Verify app password (not regular password)
   - Check "Less secure apps" setting if needed
   - Ensure 2FA is enabled

### Survey Not Appearing

1. Check survey was created:
   ```bash
   psql -U postgres -d pd_portal -c "SELECT * FROM surveys;"
   ```

2. Check questions were added:
   ```bash
   psql -U postgres -d pd_portal -c "SELECT * FROM survey_questions WHERE survey_id = 'your-id';"
   ```

3. Check status is 'active':
   ```bash
   psql -U postgres -d pd_portal -c "UPDATE surveys SET status = 'active' WHERE id = 'your-id';"
   ```

### CORS Issues with Email API

Verify in `server.ts`:
```typescript
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',  // frontend
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
```

## Performance Optimization

### Add Indices (Already in Migration)

```bash
psql -U postgres -d pd_portal -c "
CREATE INDEX IF NOT EXISTS idx_surveys_session ON surveys(session_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey ON survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
"
```

### Archive Old Emails (Optional)

```sql
-- Archive emails older than 90 days
DELETE FROM email_logs 
WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '90 days' 
AND status = 'sent';
```

## Rollback Plan

If you need to rollback:

```bash
# Drop all new tables (WARNING: destructive)
psql -U postgres -d pd_portal -f - <<EOF
DROP TABLE IF EXISTS survey_answers CASCADE;
DROP TABLE IF EXISTS survey_responses CASCADE;
DROP TABLE IF EXISTS survey_question_options CASCADE;
DROP TABLE IF EXISTS survey_questions CASCADE;
DROP TABLE IF EXISTS surveys CASCADE;
DROP TABLE IF EXISTS email_logs CASCADE;
DROP TABLE IF EXISTS email_preferences CASCADE;
DROP TABLE IF EXISTS email_templates CASCADE;
EOF

# Remove route imports from server.ts
# Restart backend
```

## Success Checklist

- [ ] Database tables created (verify with `\dt`)
- [ ] Email templates seeded (verify with SELECT)
- [ ] Backend started without errors
- [ ] Survey API endpoints responding
- [ ] Email API endpoints responding
- [ ] Test survey created successfully
- [ ] Test email sent successfully
- [ ] Frontend components integrated
- [ ] User preferences working
- [ ] Email logs recording deliveries

## Documentation References

- Full API docs: `docs/SURVEYS_AND_EMAIL_SYSTEM.md`
- Implementation details: `IMPLEMENTATION_SUMMARY.md`
- Database schema: `backend/database/add-surveys-tables.sql`

## Support

If you encounter issues:

1. Check logs: `tail -f server.log`
2. Review database: `psql -U postgres -d pd_portal`
3. Check email configuration: `echo $EMAIL_*`
4. Review error messages in email_logs table
5. Consult troubleshooting section above
