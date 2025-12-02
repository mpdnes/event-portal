-- Test data for surveys system
-- Run this to populate test surveys for end-to-end testing

-- First, get a session ID (this assumes you have sessions created)
-- Replace SESSION_ID below with an actual session ID from your database

-- 1. Create a test survey
INSERT INTO surveys (id, session_id, title, description, survey_type, is_anonymous, is_published, created_by, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM sessions LIMIT 1),  -- Gets first session
  'Session Feedback - Test',
  'Please provide your feedback on this training session',
  'post-session',
  false,
  false,
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
  NOW(),
  NOW()
) RETURNING id;

-- 2. Add questions to survey (copy survey_id from previous query)
-- Replace SURVEY_ID with the ID returned above

-- Rating question
INSERT INTO survey_questions (id, survey_id, question_type, question_text, question_order, required, created_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM surveys WHERE title = 'Session Feedback - Test' LIMIT 1),
  'rating',
  'How would you rate this session overall?',
  1,
  true,
  NOW()
);

-- Text question
INSERT INTO survey_questions (id, survey_id, question_type, question_text, question_order, required, created_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM surveys WHERE title = 'Session Feedback - Test' LIMIT 1),
  'text',
  'What was the most helpful part of this session?',
  2,
  true,
  NOW()
);

-- Multiple choice question
INSERT INTO survey_questions (id, survey_id, question_type, question_text, question_order, required, created_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM surveys WHERE title = 'Session Feedback - Test' LIMIT 1),
  'multiple-choice',
  'Will you apply what you learned?',
  3,
  true,
  NOW()
) RETURNING id AS multiple_choice_q_id;

-- 3. Add options to multiple choice question (copy question_id)
INSERT INTO survey_question_options (id, question_id, option_text, option_order, created_at)
VALUES 
  (gen_random_uuid(), (SELECT id FROM survey_questions WHERE question_text = 'Will you apply what you learned?' LIMIT 1), 'Definitely', 1, NOW()),
  (gen_random_uuid(), (SELECT id FROM survey_questions WHERE question_text = 'Will you apply what you learned?' LIMIT 1), 'Probably', 2, NOW()),
  (gen_random_uuid(), (SELECT id FROM survey_questions WHERE question_text = 'Will you apply what you learned?' LIMIT 1), 'Maybe', 3, NOW()),
  (gen_random_uuid(), (SELECT id FROM survey_questions WHERE question_text = 'Will you apply what you learned?' LIMIT 1), 'Unlikely', 4, NOW());

-- 4. Verify survey was created
SELECT 
  s.id,
  s.title,
  s.description,
  COUNT(q.id) as question_count
FROM surveys s
LEFT JOIN survey_questions q ON q.survey_id = s.id
WHERE s.title = 'Session Feedback - Test'
GROUP BY s.id, s.title, s.description;
