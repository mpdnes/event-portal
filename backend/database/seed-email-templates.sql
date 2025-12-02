-- Default Email Templates

INSERT INTO email_templates (name, subject, html_body, text_body, template_variables, is_active)
VALUES
(
  'registration_confirmation',
  'Confirmation: You''re Registered for {{session_title}}',
  '<h1>Registration Confirmed</h1>
<p>Hi {{first_name}},</p>
<p>Thank you for registering for <strong>{{session_title}}</strong>.</p>
<p><strong>Session Details:</strong></p>
<ul>
  <li>Date: {{session_date}}</li>
  <li>Time: {{session_time}}</li>
</ul>
<p>We look forward to seeing you there!</p>
<p>If you need to cancel, please reply to this email.</p>',
  'Hi {{first_name}},

Thank you for registering for {{session_title}}.

Session Details:
- Date: {{session_date}}
- Time: {{session_time}}

We look forward to seeing you there!

If you need to cancel, please reply to this email.',
  '["first_name", "session_title", "session_date", "session_time"]',
  true
),
(
  'session_reminder',
  'Reminder: {{session_title}} is Tomorrow!',
  '<h1>Session Reminder</h1>
<p>Hi {{first_name}},</p>
<p>This is a friendly reminder that <strong>{{session_title}}</strong> is happening tomorrow!</p>
<p><strong>Details:</strong></p>
<ul>
  <li>Date: {{session_date}}</li>
  <li>Time: {{session_time}}</li>
  <li>Location: {{location}}</li>
</ul>
<p>See you there!</p>',
  'Hi {{first_name}},

This is a friendly reminder that {{session_title}} is happening tomorrow!

Details:
- Date: {{session_date}}
- Time: {{session_time}}
- Location: {{location}}

See you there!',
  '["first_name", "session_title", "session_date", "session_time", "location"]',
  true
),
(
  'survey_reminder',
  'We''d Love Your Feedback on {{session_title}}',
  '<h1>Help Us Improve</h1>
<p>Hi {{first_name}},</p>
<p>Thank you for attending <strong>{{session_title}}</strong>! We''d love to hear your feedback.</p>
<p>Please take 5 minutes to complete our brief survey: <strong>{{survey_title}}</strong></p>
<p>Your feedback helps us create better professional development opportunities.</p>
<p>Thanks!</p>',
  'Hi {{first_name}},

Thank you for attending {{session_title}}! We''d love to hear your feedback.

Please take 5 minutes to complete our brief survey: {{survey_title}}

Your feedback helps us create better professional development opportunities.

Thanks!',
  '["first_name", "session_title", "survey_title"]',
  true
),
(
  'session_cancelled',
  'Session Cancelled: {{session_title}}',
  '<h1>Session Cancelled</h1>
<p>Hi {{first_name}},</p>
<p>Unfortunately, we need to cancel <strong>{{session_title}}</strong> that was scheduled for {{session_date}}.</p>
<p>{{cancellation_reason}}</p>
<p>We apologize for any inconvenience. Please check back for future sessions.</p>',
  'Hi {{first_name}},

Unfortunately, we need to cancel {{session_title}} that was scheduled for {{session_date}}.

{{cancellation_reason}}

We apologize for any inconvenience. Please check back for future sessions.',
  '["first_name", "session_title", "session_date", "cancellation_reason"]',
  true
),
(
  'new_session_announcement',
  'New PD Session Available: {{session_title}}',
  '<h1>New Professional Development Session</h1>
<p>Hi {{first_name}},</p>
<p>We''ve just announced a new PD session that might interest you!</p>
<p><strong>{{session_title}}</strong></p>
<p>{{session_description}}</p>
<p><strong>Details:</strong></p>
<ul>
  <li>Date: {{session_date}}</li>
  <li>Time: {{session_time}}</li>
  <li>Location: {{location}}</li>
  <li>Presenter: {{presenter}}</li>
</ul>
<p>Register now to secure your spot!</p>',
  'Hi {{first_name}},

We''ve just announced a new PD session that might interest you!

{{session_title}}

{{session_description}}

Details:
- Date: {{session_date}}
- Time: {{session_time}}
- Location: {{location}}
- Presenter: {{presenter}}

Register now to secure your spot!',
  '["first_name", "session_title", "session_description", "session_date", "session_time", "location", "presenter"]',
  true
),
(
  'attendance_certificate',
  'Your {{session_title}} Attendance Certificate',
  '<h1>Attendance Certificate</h1>
<p>Hi {{first_name}},</p>
<p>Congratulations! You have successfully completed <strong>{{session_title}}</strong>.</p>
<p>This email serves as your certificate of attendance.</p>
<p><strong>Session Details:</strong></p>
<ul>
  <li>Title: {{session_title}}</li>
  <li>Date: {{session_date}}</li>
  <li>Duration: {{duration}} hours</li>
</ul>
<p>Thank you for your participation!</p>',
  'Hi {{first_name}},

Congratulations! You have successfully completed {{session_title}}.

This email serves as your certificate of attendance.

Session Details:
- Title: {{session_title}}
- Date: {{session_date}}
- Duration: {{duration}} hours

Thank you for your participation!',
  '["first_name", "session_title", "session_date", "duration"]',
  true
)
ON CONFLICT (name) DO NOTHING;
