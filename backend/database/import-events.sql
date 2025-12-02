-- Import PD Events from Documentation
-- These are PD sessions from the docs folder

INSERT INTO pd_sessions (title, description, presenter_id, location, session_date, start_time, end_time, capacity, is_published, status, created_by)
SELECT
    title,
    description,
    NULL as presenter_id,
    location,
    session_date,
    start_time,
    end_time,
    capacity,
    true,
    'published',
    (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
FROM (VALUES
    ('Artificial Intelligence Tools', 'Explore practical AI tools for professional development and workplace efficiency', NULL, 'TBD', '2025-12-05'::date, '10:00:00'::time, '11:30:00'::time, 30),
    ('Beginner Yoga', 'Introduction to yoga for all fitness levels. Learn basic poses and breathing techniques.', NULL, 'Wellness Center', '2025-12-10'::date, '12:00:00'::time, '13:00:00'::time, 20),
    ('Chair Yoga', 'Gentle yoga practice performed seated. Perfect for flexibility and relaxation.', NULL, 'Staff Lounge', '2025-12-12'::date, '14:00:00'::time, '15:00:00'::time, 15),
    ('Coffee & Cozy Hour', 'Casual social gathering with coffee and snacks. Great for connecting with colleagues.', NULL, 'Staff Lounge', '2025-12-03'::date, '10:00:00'::time, '11:00:00'::time, 25),
    ('Dance Party', 'High-energy dance session for fun and fitness. Bring your dancing shoes!', NULL, 'Gym', '2025-12-15'::date, '17:00:00'::time, '18:00:00'::time, 40),
    ('Guided Meditation', 'Peaceful guided meditation session for stress relief and mindfulness.', NULL, 'Meditation Room', '2025-12-08'::date, '16:00:00'::time, '16:45:00'::time, 20),
    ('Human Anatomy Lab Tour', 'Behind-the-scenes tour of the anatomy lab with hands-on learning.', NULL, 'Science Building - Room 301', '2025-12-09'::date, '14:00:00'::time, '15:30:00'::time, 20),
    ('Learn to Save a Life', 'CPR and first aid training session. Certification provided.', NULL, 'Health Center', '2025-12-11'::date, '10:00:00'::time, '12:00:00'::time, 15),
    ('Math Content Workshop', 'Deep dive into math pedagogy and teaching strategies.', NULL, 'Education Building', '2025-12-13'::date, '13:00:00'::time, '14:30:00'::time, 25),
    ('Movie: Deaf President Now!', 'Documentary screening about deaf activism and rights at Gallaudet University.', NULL, 'Auditorium', '2025-12-14'::date, '15:00:00'::time, '16:30:00'::time, 50),
    ('Navigating Conflict', 'Workshop on conflict resolution and communication strategies.', NULL, 'Conference Room A', '2025-12-16'::date, '10:00:00'::time, '11:30:00'::time, 30),
    ('Observatory Tour', 'Tour of the campus observatory with stargazing opportunities.', NULL, 'Observatory', '2025-12-06'::date, '18:00:00'::time, '19:30:00'::time, 20),
    ('Rochester Local History', 'Explore the history and culture of Rochester, NY.', NULL, 'Local History Museum', '2025-12-07'::date, '14:00:00'::time, '15:30:00'::time, 25),
    ('SHED Makers Space Tour', 'Tour of the campus makerspace with equipment demonstrations.', NULL, 'SHED', '2025-12-04'::date, '13:00:00'::time, '14:00:00'::time, 15),
    ('Strength and Stretch', 'Strength training and flexibility workout session.', NULL, 'Gym', '2025-12-17'::date, '12:00:00'::time, '13:00:00'::time, 20),
    ('Study Abroad Opportunities', 'Information session about international study programs.', NULL, 'Admissions Office', '2025-12-18'::date, '15:00:00'::time, '16:00:00'::time, 30),
    ('The Great Holiday Sing-Along', 'Annual holiday celebration with singing, music, and seasonal treats!', NULL, 'Music Hall', '2025-12-19'::date, '15:00:00'::time, '16:30:00'::time, 50),
    ('Tour & Zine Making Workshop', 'Creative workshop combining campus tour with zine creation.', NULL, 'Art Studio', '2025-12-20'::date, '10:00:00'::time, '12:00:00'::time, 20),
    ('Captionist Cafe', 'Casual meetup for captionists to network and share experiences.', NULL, 'Cafe', '2025-12-02'::date, '10:00:00'::time, '11:00:00'::time, 20),
    ('Captioning Best Practices', 'Workshop on best practices in real-time captioning.', NULL, 'Conference Room B', '2025-12-22'::date, '10:00:00'::time, '11:30:00'::time, 25)
) as events(title, description, presenter_id, location, session_date, start_time, end_time, capacity)
WHERE NOT EXISTS (SELECT 1 FROM pd_sessions WHERE title = events.title);

SELECT 'Events imported successfully!' as status;
