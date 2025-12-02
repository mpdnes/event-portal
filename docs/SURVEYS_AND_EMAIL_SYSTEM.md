# Surveys & Email Notifications System

## Overview

The pd-portal now includes a complete survey and email notification system to collect feedback from PD session attendees and keep users informed about upcoming sessions.

## Features

### Surveys System
- **Survey Creation**: Admins can create custom surveys for each PD session
- **Question Types**: Support for text, rating scales, multiple choice, checkboxes, and Likert scales
- **Anonymous Responses**: Option to collect anonymous feedback
- **Multiple Response Support**: Control whether users can respond multiple times
- **Analytics Dashboard**: View aggregated responses and statistics
- **Conditional Responses**: Support for tracking user vs anonymous responses

### Email Notification System
- **Email Templates**: Pre-built templates for common notifications
- **Template Variables**: Dynamic content injection (user name, session details, etc.)
- **Email Preferences**: Users can control which notifications they receive
- **Email Logging**: Track all sent emails and delivery status
- **Automatic Reminders**: Send reminders before sessions or after surveys go live

## Database Schema

### Survey Tables

#### `surveys`
Stores survey metadata
```sql
- id: UUID (primary key)
- title: VARCHAR(255)
- description: TEXT
- session_id: UUID (foreign key to pd_sessions)
- status: 'draft' | 'active' | 'closed' | 'archived'
- is_anonymous: BOOLEAN
- allow_multiple_responses: BOOLEAN
- created_by: UUID (foreign key to users)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `survey_questions`
Individual survey questions
```sql
- id: UUID (primary key)
- survey_id: UUID (foreign key to surveys)
- question_text: TEXT
- question_type: 'text' | 'rating' | 'multiple_choice' | 'checkbox' | 'likert'
- order_id: INTEGER (for ordering questions)
- is_required: BOOLEAN
- rating_scale: INTEGER (for rating type, default 5)
```

#### `survey_question_options`
Options for multiple choice/checkbox questions
```sql
- id: UUID (primary key)
- question_id: UUID (foreign key to survey_questions)
- option_text: VARCHAR(500)
- order_id: INTEGER
```

#### `survey_responses`
User's survey submission record
```sql
- id: UUID (primary key)
- survey_id: UUID (foreign key to surveys)
- user_id: UUID (nullable, for anonymous)
- started_at: TIMESTAMP
- submitted_at: TIMESTAMP
- completed: BOOLEAN
- UNIQUE(survey_id, user_id)
```

#### `survey_answers`
Individual answers within a response
```sql
- id: UUID (primary key)
- response_id: UUID (foreign key to survey_responses)
- question_id: UUID (foreign key to survey_questions)
- answer_text: TEXT (for text questions)
- rating_value: INTEGER (for rating questions)
- selected_option_id: UUID (for multiple choice/checkbox)
```

### Email Tables

#### `email_templates`
Reusable email templates
```sql
- id: UUID (primary key)
- name: VARCHAR(100) UNIQUE
- subject: VARCHAR(255)
- html_body: TEXT
- text_body: TEXT
- template_variables: TEXT (JSON array)
- is_active: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `email_logs`
Email delivery tracking
```sql
- id: UUID (primary key)
- recipient_email: VARCHAR(255)
- subject: VARCHAR(255)
- template_name: VARCHAR(100)
- user_id: UUID (nullable)
- session_id: UUID (nullable)
- status: 'pending' | 'sent' | 'failed' | 'bounced'
- error_message: TEXT
- sent_at: TIMESTAMP
- created_at: TIMESTAMP
```

#### `email_preferences`
User email preferences
```sql
- id: UUID (primary key)
- user_id: UUID UNIQUE (foreign key to users)
- receive_session_reminders: BOOLEAN
- receive_new_sessions: BOOLEAN
- receive_feedback_requests: BOOLEAN
- receive_admin_notifications: BOOLEAN
- updated_at: TIMESTAMP
```

## API Endpoints

### Survey Endpoints

#### Create Survey
```http
POST /api/surveys
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Session Feedback",
  "description": "Please share your feedback about the session",
  "session_id": "uuid",
  "is_anonymous": false,
  "allow_multiple_responses": false
}
```

#### Get Survey with Questions
```http
GET /api/surveys/:survey_id
Authorization: Bearer <token>
```

#### Add Question
```http
POST /api/surveys/questions
Authorization: Bearer <token>
Content-Type: application/json

{
  "survey_id": "uuid",
  "question_text": "How satisfied were you?",
  "question_type": "rating",
  "order_id": 0,
  "is_required": true,
  "rating_scale": 5
}
```

#### Add Question Option
```http
POST /api/surveys/questions/options
Authorization: Bearer <token>
Content-Type: application/json

{
  "question_id": "uuid",
  "option_text": "Very Satisfied",
  "order_id": 0
}
```

#### Start Survey Response
```http
POST /api/surveys/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "survey_id": "uuid"
}

Response:
{
  "id": "response_id_uuid",
  "survey_id": "uuid",
  "user_id": "uuid",
  "started_at": "2024-01-01T10:00:00Z"
}
```

#### Submit Answer
```http
POST /api/surveys/submit-answer
Authorization: Bearer <token>
Content-Type: application/json

{
  "response_id": "uuid",
  "question_id": "uuid",
  "answer_text": "This was great!",  // OR
  "rating_value": 5,              // OR
  "selected_option_id": "uuid"    // depending on question type
}
```

#### Complete Survey
```http
POST /api/surveys/complete
Authorization: Bearer <token>
Content-Type: application/json

{
  "response_id": "uuid"
}
```

#### Get Survey Results
```http
GET /api/surveys/results/:survey_id
Authorization: Bearer <token>

Response:
{
  "survey_id": "uuid",
  "total_responses": 25,
  "questions": [
    {
      "question_id": "uuid",
      "question_text": "How satisfied were you?",
      "question_type": "rating",
      "rating_distribution": { "1": 2, "2": 5, "3": 8, "4": 7, "5": 3 },
      "average_rating": 3.44
    }
  ]
}
```

#### Publish Survey
```http
POST /api/surveys/publish
Authorization: Bearer <token>
Content-Type: application/json

{
  "survey_id": "uuid"
}
```

### Email Endpoints

#### Send Notification
```http
POST /api/email/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipient_email": "user@example.com",
  "template_name": "registration_confirmation",
  "variables": {
    "first_name": "John",
    "session_title": "Advanced TypeScript",
    "session_date": "2024-01-15",
    "session_time": "2:00 PM"
  },
  "user_id": "uuid",
  "session_id": "uuid"
}
```

#### Send Registration Confirmation
```http
POST /api/email/send-confirmation
Authorization: Bearer <token>
Content-Type: application/json

{
  "registration_id": "uuid"
}
```

#### Send Survey Reminder
```http
POST /api/email/send-survey-reminder
Authorization: Bearer <token>
Content-Type: application/json

{
  "survey_id": "uuid",
  "user_ids": ["uuid1", "uuid2"]  // optional, defaults to all session registrations
}
```

#### Get Email Preferences
```http
GET /api/email/preferences/:user_id
Authorization: Bearer <token>

Response:
{
  "id": "uuid",
  "user_id": "uuid",
  "receive_session_reminders": true,
  "receive_new_sessions": true,
  "receive_feedback_requests": true,
  "receive_admin_notifications": false,
  "updated_at": "2024-01-01T10:00:00Z"
}
```

#### Update Email Preferences
```http
PUT /api/email/preferences/:user_id
Authorization: Bearer <token>
Content-Type: application/json

{
  "receive_session_reminders": true,
  "receive_new_sessions": false,
  "receive_feedback_requests": true,
  "receive_admin_notifications": false
}
```

#### Create/Update Email Template
```http
POST /api/email/template
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "custom_notification",
  "subject": "Custom Subject",
  "html_body": "<h1>Hello {{first_name}}</h1>",
  "text_body": "Hello {{first_name}}",
  "template_variables": ["first_name", "session_title"],
  "is_active": true
}
```

#### Get Email Logs
```http
GET /api/email/logs?user_id=uuid&status=sent&limit=50&offset=0
Authorization: Bearer <token>

Response:
{
  "rows": [...],
  "count": 150
}
```

## Built-in Email Templates

### 1. registration_confirmation
Sent when user registers for a session
- Variables: `first_name`, `session_title`, `session_date`, `session_time`

### 2. session_reminder
Sent 24 hours before session
- Variables: `first_name`, `session_title`, `session_date`, `session_time`, `location`

### 3. survey_reminder
Sent when survey becomes active
- Variables: `first_name`, `survey_title`, `session_title`

### 4. session_cancelled
Sent when session is cancelled
- Variables: `first_name`, `session_title`, `session_date`, `cancellation_reason`

### 5. new_session_announcement
Sent when new session is published
- Variables: `first_name`, `session_title`, `session_description`, `session_date`, `session_time`, `location`, `presenter`

### 6. attendance_certificate
Sent after session completion
- Variables: `first_name`, `session_title`, `session_date`, `duration`

## Frontend Components

### SurveyTaker Component
Component for users to take a survey
```tsx
import SurveyTaker from '@/components/surveys/SurveyTaker';

<SurveyTaker 
  surveyId="uuid" 
  onComplete={() => console.log('Survey completed')}
/>
```

### SurveyBuilder Component
Component for admins to create surveys
```tsx
import SurveyBuilder from '@/components/surveys/SurveyBuilder';

<SurveyBuilder 
  sessionId="uuid"
  onSurveyCreated={(surveyId) => console.log('Survey created:', surveyId)}
/>
```

## Environment Configuration

Add these variables to `.env`:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@domain.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@pdportal.com
```

## Setup Instructions

1. **Run Database Migrations**
```bash
# Apply survey and email tables
psql -U postgres -d pd_portal -f backend/database/add-surveys-tables.sql

# Seed default email templates
psql -U postgres -d pd_portal -f backend/database/seed-email-templates.sql
```

2. **Install Dependencies**
```bash
cd backend
npm install nodemailer
```

3. **Configure Email Settings**
Update `.env` with your email service credentials

4. **Restart Backend**
```bash
npm run dev
```

## Usage Workflow

### For Admins: Creating a Survey

1. Navigate to admin panel for a completed session
2. Click "Create Survey"
3. Use `SurveyBuilder` component to define survey
4. Add questions with various types
5. Set whether survey is anonymous
6. Publish survey when ready
7. Send reminder emails to session attendees

### For Users: Taking a Survey

1. Receive email notification with survey link
2. Click to open survey
3. Complete `SurveyTaker` component
4. Submit responses
5. View confirmation message

### For Admins: Reviewing Results

1. Go to survey results page
2. View aggregate statistics
3. Export responses as needed
4. Use insights to improve future sessions

## Error Handling

### Email Send Failures
- Failed emails are logged with error message
- Admin can retry from email logs
- Failed emails don't block survey workflow

### Survey Response Issues
- Users cannot submit duplicate responses if not allowed
- Required questions are enforced
- Partial submissions are saved automatically

## Performance Considerations

- Indexes on `survey_id`, `user_id`, and `status` fields
- Pagination support for large response sets
- Email logs are automatically archived after 90 days (optional)
- Survey questions are cached on the client side

## Security

- Survey responses can be anonymous
- Email preferences are user-specific
- Email logs do not contain sensitive data
- Template variables are escaped to prevent XSS
- All endpoints require authentication
