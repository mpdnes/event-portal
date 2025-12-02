CREATE TABLE IF NOT EXISTS user_pets (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pet_name VARCHAR(50) NOT NULL,
  species VARCHAR(30) DEFAULT 'Dragon',
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  health INTEGER DEFAULT 100,
  happiness INTEGER DEFAULT 100,
  last_fed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_played TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS pet_experience_log (
  id SERIAL PRIMARY KEY,
  pet_id INTEGER NOT NULL REFERENCES user_pets(id) ON DELETE CASCADE,
  experience_gained INTEGER NOT NULL,
  activity_type VARCHAR(30),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id VARCHAR(50) NOT NULL,
  achievement_name VARCHAR(100) NOT NULL,
  achievement_description TEXT,
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_streaks (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_attendance TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_pets_user_id ON user_pets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);
