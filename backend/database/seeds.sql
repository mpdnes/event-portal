-- Seed data for PD Portal

-- Insert default tags (without emojis)
INSERT INTO tags (name, emoji, color, description) VALUES
('Food Provided', '', '#FF6B6B', 'Session includes food or refreshments'),
('Physical Activity', '', '#4ECDC4', 'Involves physical movement (yoga, tours, etc)'),
('Tour', '', '#95E1D3', 'Facility or location tour'),
('Workshop', '', '#F38181', 'Hands-on workshop or interactive session'),
('Wellness', '', '#AA96DA', 'Mental or physical wellness focus'),
('Technology', '', '#5B9BD5', 'Technology or software related'),
('Cultural', '', '#FFB6D9', 'Cultural learning or awareness'),
('Career Development', '', '#FFD93D', 'Professional growth and career topics'),
('Creative', '', '#FF9A8B', 'Arts, crafts, or creative activities'),
('Social', '', '#6BCF7F', 'Social gathering or team building'),
('Educational', '', '#9B9ECE', 'Learning-focused session'),
('Entertainment', '', '#FEC8D8', 'Movie screening or entertainment'),
('Skill Building', '', '#F6A192', 'Specific skill development');

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('admin@pdportal.com', '$2a$10$Q7TxfVpWsJw6KmwGeeYh3.3dBgSQsYstgMuAP.qSMw6zXJbu8VUFO', 'Admin', 'User', 'admin');

