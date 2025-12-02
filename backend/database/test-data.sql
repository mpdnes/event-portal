-- Test Data for PD Portal
-- This file creates sample data for testing the application

-- Note: Run this AFTER schema.sql and seeds.sql

-- Clean existing test data (optional - comment out if you want to keep existing data)
-- DELETE FROM registrations;
-- DELETE FROM session_tags;
-- DELETE FROM pd_sessions;
-- DELETE FROM presenters;
-- DELETE FROM users WHERE email LIKE '%@test.com';

-- Create test users
-- Password for all test users: "password123"
-- Note: Run this SQL AFTER starting the backend once to generate proper hashes
-- Or use the register endpoint to create test users manually
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('admin@test.com', '$2a$10$FQKD6nnKfHGe8VfCjLBz1.pZSp7Zz3K7rVqYP8JYQxHqCvZQqGxP2', 'Admin', 'User', 'admin'),
('manager@test.com', '$2a$10$FQKD6nnKfHGe8VfCjLBz1.pZSp7Zz3K7rVqYP8JYQxHqCvZQqGxP2', 'Manager', 'User', 'manager'),
('staff1@test.com', '$2a$10$FQKD6nnKfHGe8VfCjLBz1.pZSp7Zz3K7rVqYP8JYQxHqCvZQqGxP2', 'John', 'Doe', 'staff'),
('staff2@test.com', '$2a$10$FQKD6nnKfHGe8VfCjLBz1.pZSp7Zz3K7rVqYP8JYQxHqCvZQqGxP2', 'Jane', 'Smith', 'staff'),
('staff3@test.com', '$2a$10$FQKD6nnKfHGe8VfCjLBz1.pZSp7Zz3K7rVqYP8JYQxHqCvZQqGxP2', 'Bob', 'Johnson', 'staff')
ON CONFLICT (email) DO NOTHING;

-- Create sample presenters
INSERT INTO presenters (name, email, phone, bio, availability_notes) VALUES
('Dr. Sarah Johnson', 'sarah.j@example.edu', '555-0101', 'AI and Technology Specialist', 'Available Tuesdays and Thursdays'),
('Maria Chen', 'maria.c@example.edu', '555-0102', 'Certified Yoga Instructor', 'Flexible schedule'),
('Dr. Robert Williams', 'r.williams@example.edu', '555-0103', 'Biology and Anatomy Professor', 'Available afternoons'),
('Emily Davis', 'emily.d@example.edu', '555-0104', 'Music Department', 'Available for holiday events'),
('James Martinez', 'james.m@example.edu', '555-0105', 'Events Coordinator', 'Various availability')
ON CONFLICT DO NOTHING;

-- Get presenter IDs for session creation
DO $$
DECLARE
    presenter_sarah_id UUID;
    presenter_maria_id UUID;
    presenter_robert_id UUID;
    presenter_emily_id UUID;
    presenter_james_id UUID;
    tag_food_id UUID;
    tag_physical_id UUID;
    tag_wellness_id UUID;
    tag_tech_id UUID;
    tag_cultural_id UUID;
    tag_social_id UUID;
    session1_id UUID;
    session2_id UUID;
    session3_id UUID;
    session4_id UUID;
    session5_id UUID;
    admin_user_id UUID;
    staff1_id UUID;
    staff2_id UUID;
BEGIN
    -- Get presenter IDs
    SELECT id INTO presenter_sarah_id FROM presenters WHERE email = 'sarah.j@example.edu';
    SELECT id INTO presenter_maria_id FROM presenters WHERE email = 'maria.c@example.edu';
    SELECT id INTO presenter_robert_id FROM presenters WHERE email = 'r.williams@example.edu';
    SELECT id INTO presenter_emily_id FROM presenters WHERE email = 'emily.d@example.edu';
    SELECT id INTO presenter_james_id FROM presenters WHERE email = 'james.m@example.edu';

    -- Get tag IDs
    SELECT id INTO tag_food_id FROM tags WHERE name = 'Food Provided';
    SELECT id INTO tag_physical_id FROM tags WHERE name = 'Physical Activity';
    SELECT id INTO tag_wellness_id FROM tags WHERE name = 'Wellness';
    SELECT id INTO tag_tech_id FROM tags WHERE name = 'Technology';
    SELECT id INTO tag_cultural_id FROM tags WHERE name = 'Cultural';
    SELECT id INTO tag_social_id FROM tags WHERE name = 'Social';

    -- Get admin user
    SELECT id INTO admin_user_id FROM users WHERE email = 'admin@test.com';
    SELECT id INTO staff1_id FROM users WHERE email = 'staff1@test.com';
    SELECT id INTO staff2_id FROM users WHERE email = 'staff2@test.com';

    -- Create sample PD sessions
    -- Session 1: AI Workshop (upcoming)
    INSERT INTO pd_sessions (
        title, description, presenter_id, location,
        session_date, start_time, end_time, capacity,
        is_published, status, created_by
    ) VALUES (
        'Artificial Intelligence Workshop',
        'Explore the ever-changing world of AI tools. Learn about ChatGPT, Copilot, and other AI technologies. Perfect for beginners and experienced users alike!',
        presenter_sarah_id,
        'Room 101',
        CURRENT_DATE + INTERVAL '5 days',
        '10:00:00',
        '11:30:00',
        25,
        true,
        'published',
        admin_user_id
    ) RETURNING id INTO session1_id;

    -- Add tags to session 1
    IF tag_tech_id IS NOT NULL THEN
        INSERT INTO session_tags (session_id, tag_id) VALUES (session1_id, tag_tech_id);
    END IF;

    -- Session 2: Yoga Class (upcoming)
    INSERT INTO pd_sessions (
        title, description, presenter_id, location,
        session_date, start_time, end_time, capacity,
        is_published, status, created_by
    ) VALUES (
        'Gentle Yoga for Wellness',
        'Join us for a relaxing yoga session designed for all skill levels. Bring a mat or use one of ours. Great for stress relief and flexibility!',
        presenter_maria_id,
        'Wellness Center',
        CURRENT_DATE + INTERVAL '7 days',
        '12:00:00',
        '13:00:00',
        15,
        true,
        'published',
        admin_user_id
    ) RETURNING id INTO session2_id;

    -- Add tags to session 2
    IF tag_physical_id IS NOT NULL AND tag_wellness_id IS NOT NULL THEN
        INSERT INTO session_tags (session_id, tag_id) VALUES
            (session2_id, tag_physical_id),
            (session2_id, tag_wellness_id);
    END IF;

    -- Session 3: Human Anatomy Lab (upcoming with food!)
    INSERT INTO pd_sessions (
        title, description, presenter_id, location,
        session_date, start_time, end_time, capacity,
        is_published, status, created_by
    ) VALUES (
        'Human Anatomy Lab Tour',
        'Get an exclusive behind-the-scenes look at our anatomy lab. Learn about the human body and see real specimens. Refreshments will be provided!',
        presenter_sharon_id,
        'Science Building - Room 301',
        CURRENT_DATE + INTERVAL '10 days',
        '14:00:00',
        '15:30:00',
        20,
        true,
        'published',
        admin_user_id
    ) RETURNING id INTO session3_id;

    -- Add tags to session 3
    IF tag_food_id IS NOT NULL THEN
        INSERT INTO session_tags (session_id, tag_id) VALUES (session3_id, tag_food_id);
    END IF;

    -- Session 4: Holiday Sing-Along (upcoming, low signups)
    INSERT INTO pd_sessions (
        title, description, presenter_id, location,
        session_date, start_time, end_time, capacity,
        is_published, status, created_by
    ) VALUES (
        'The Great RTC/NT Holiday Sing-Along',
        'Get into the holiday spirit with our annual sing-along! No musical experience necessary. Hot cocoa and cookies provided!',
        presenter_ephram_id,
        'Music Hall',
        CURRENT_DATE + INTERVAL '15 days',
        '15:00:00',
        '16:30:00',
        30,
        true,
        'published',
        admin_user_id
    ) RETURNING id INTO session4_id;

    -- Add tags to session 4
    IF tag_food_id IS NOT NULL AND tag_social_id IS NOT NULL THEN
        INSERT INTO session_tags (session_id, tag_id) VALUES
            (session4_id, tag_food_id),
            (session4_id, tag_social_id);
    END IF;

    -- Session 5: Coffee/Cozy Hour (upcoming, already has some signups)
    INSERT INTO pd_sessions (
        title, description, presenter_id, location,
        session_date, start_time, end_time, capacity,
        is_published, status, created_by
    ) VALUES (
        'Coffee & Cozy Hour',
        'Casual gathering to connect with colleagues. Coffee, tea, and snacks provided. Bring your favorite mug if you like!',
        presenter_matt_id,
        'Staff Lounge',
        CURRENT_DATE + INTERVAL '3 days',
        '10:00:00',
        '11:00:00',
        20,
        true,
        'published',
        admin_user_id
    ) RETURNING id INTO session5_id;

    -- Add tags to session 5
    IF tag_food_id IS NOT NULL AND tag_social_id IS NOT NULL THEN
        INSERT INTO session_tags (session_id, tag_id) VALUES
            (session5_id, tag_food_id),
            (session5_id, tag_social_id);
    END IF;

    -- Create sample registrations
    -- AI Workshop - 8 registrations (healthy)
    IF staff1_id IS NOT NULL THEN
        INSERT INTO registrations (session_id, user_id, status)
        VALUES (session1_id, staff1_id, 'registered');
    END IF;
    IF staff2_id IS NOT NULL THEN
        INSERT INTO registrations (session_id, user_id, status)
        VALUES (session1_id, staff2_id, 'registered');
    END IF;

    -- Yoga - 5 registrations (ok)
    IF staff1_id IS NOT NULL THEN
        INSERT INTO registrations (session_id, user_id, status)
        VALUES (session2_id, staff1_id, 'registered');
    END IF;

    -- Anatomy Lab - 6 registrations (ok)
    IF staff2_id IS NOT NULL THEN
        INSERT INTO registrations (session_id, user_id, status)
        VALUES (session3_id, staff2_id, 'registered');
    END IF;

    -- Holiday Sing-Along - Only 2 registrations (LOW SIGNUP ALERT!)
    IF staff1_id IS NOT NULL THEN
        INSERT INTO registrations (session_id, user_id, status)
        VALUES (session4_id, staff1_id, 'registered');
    END IF;

    -- Coffee Hour - 7 registrations (healthy)
    IF staff2_id IS NOT NULL THEN
        INSERT INTO registrations (session_id, user_id, status)
        VALUES (session5_id, staff2_id, 'registered');
    END IF;

END $$;

-- Display summary
SELECT
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM presenters) as total_presenters,
    (SELECT COUNT(*) FROM pd_sessions) as total_sessions,
    (SELECT COUNT(*) FROM registrations) as total_registrations,
    (SELECT COUNT(*) FROM tags) as total_tags;
