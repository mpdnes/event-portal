-- Professional Development Portal Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (staff, managers, admins)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'manager', 'staff')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Presenters table (people who lead PD sessions)
CREATE TABLE presenters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    bio TEXT,
    availability_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tags table (for categorizing sessions: food, physical, tour, etc.)
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    emoji VARCHAR(10),
    color VARCHAR(7), -- hex color code
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PD Sessions table
CREATE TABLE pd_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    presenter_id UUID REFERENCES presenters(id) ON DELETE SET NULL,
    external_presenter_name VARCHAR(255), -- for one-off presenters
    location VARCHAR(255),
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    capacity INTEGER,
    is_published BOOLEAN DEFAULT false,
    requires_password BOOLEAN DEFAULT false,
    session_password VARCHAR(255),
    notes TEXT, -- internal notes for Laurie
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'full', 'completed', 'cancelled')),
    times_offered INTEGER DEFAULT 1, -- track how many times this has been offered
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Session tags (many-to-many relationship)
CREATE TABLE session_tags (
    session_id UUID REFERENCES pd_sessions(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (session_id, tag_id)
);

-- Sign-ups/Registrations table
CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES pd_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'no-show', 'cancelled')),
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, user_id)
);

-- Feedback table
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES pd_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- nullable for anonymous feedback
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Session templates (for reusable PD sessions)
CREATE TABLE session_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    presenter_id UUID REFERENCES presenters(id) ON DELETE SET NULL,
    duration_minutes INTEGER,
    capacity INTEGER,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Template tags (many-to-many)
CREATE TABLE template_tags (
    template_id UUID REFERENCES session_templates(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (template_id, tag_id)
);

-- Notifications table (for email alerts)
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'new_session', 'reminder', 'cancellation', etc.
    title VARCHAR(255),
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    related_session_id UUID REFERENCES pd_sessions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Idea submissions (staff can suggest PD topics)
CREATE TABLE idea_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submitted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    suggested_presenter VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'implemented')),
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_sessions_date ON pd_sessions(session_date);
CREATE INDEX idx_sessions_status ON pd_sessions(status);
CREATE INDEX idx_registrations_user ON registrations(user_id);
CREATE INDEX idx_registrations_session ON registrations(session_id);
CREATE INDEX idx_feedback_session ON feedback(session_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_idea_submissions_status ON idea_submissions(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_presenters_updated_at BEFORE UPDATE ON presenters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pd_sessions_updated_at BEFORE UPDATE ON pd_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_templates_updated_at BEFORE UPDATE ON session_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_idea_submissions_updated_at BEFORE UPDATE ON idea_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- User Pets table (gamification system)
CREATE TABLE user_pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL DEFAULT 'My Pet',
    pet_type VARCHAR(50) DEFAULT 'companion', -- types: companion, etc.
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    total_sessions_attended INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pet Experience Log (track XP gains)
CREATE TABLE pet_experience_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_pet_id UUID NOT NULL REFERENCES user_pets(id) ON DELETE CASCADE,
    session_id UUID REFERENCES pd_sessions(id) ON DELETE SET NULL,
    experience_gained INTEGER NOT NULL,
    reason VARCHAR(100) NOT NULL, -- 'registration', 'attendance', 'interaction'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Achievements table
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(100) NOT NULL, -- 'first_session', 'level_5', 'five_sessions_week', etc.
    title VARCHAR(255) NOT NULL,
    description TEXT,
    badge_color VARCHAR(7), -- hex color
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_type)
);

-- User Streaks table
CREATE TABLE user_streaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_session_date DATE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_user_pets_updated_at BEFORE UPDATE ON user_pets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_streaks_updated_at BEFORE UPDATE ON user_streaks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
