#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'pd_portal',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function createTestSessions() {
  const client = await pool.connect();
  try {
    console.log('📋 Creating test sessions starting from today...\n');
    
    // Get presenter IDs
    const presentersResult = await client.query(`
      SELECT id, name FROM presenters ORDER BY name LIMIT 5
    `);
    const presenters = presentersResult.rows;
    
    if (presenters.length === 0) {
      console.log('❌ No presenters found. Run load-test-data.js first.');
      return;
    }
    
    // Get tag IDs
    const tagsResult = await client.query(`
      SELECT id, name FROM tags ORDER BY name LIMIT 6
    `);
    const tags = tagsResult.rows;
    
    // Get admin user
    const userResult = await client.query(`
      SELECT id FROM users WHERE role = 'admin' LIMIT 1
    `);
    const adminId = userResult.rows[0]?.id;
    
    // Create 5 sessions for the next week
    const sessionTitles = [
      'Artificial Intelligence Workshop',
      'Gentle Yoga for Wellness',
      'Human Anatomy Lab Tour',
      'Music and Mindfulness',
      'Team Building Escape Room'
    ];
    
    const descriptions = [
      'Explore the ever-changing world of AI tools. Learn about ChatGPT, Copilot, and other AI technologies.',
      'Join us for a relaxing yoga session designed for all skill levels.',
      'Get an exclusive behind-the-scenes look at our anatomy lab.',
      'Experience the therapeutic power of music combined with mindfulness.',
      'Work together as a team to solve puzzles and escape the room!'
    ];
    
    const locations = [
      'Room 14-1285',
      'Wellness Center',
      'Science Building - Room 301',
      'Music Hall',
      'Downtown Event Space'
    ];
    
    for (let i = 0; i < 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() + (3 + i)); // Start 3 days from today
      
      const dateStr = date.toISOString().split('T')[0];
      const presenter = presenters[i % presenters.length];
      const tag = tags[i % tags.length];
      
      const result = await client.query(
        `INSERT INTO pd_sessions (
          title, description, presenter_id, location,
          session_date, start_time, end_time, capacity,
          is_published, status, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, 'published', $9)
        RETURNING id`,
        [
          sessionTitles[i],
          descriptions[i],
          presenter.id,
          locations[i],
          dateStr,
          '10:00:00',
          '11:30:00',
          25,
          adminId
        ]
      );
      
      const sessionId = result.rows[0].id;
      
      // Add tag to session
      if (tag) {
        await client.query(
          'INSERT INTO session_tags (session_id, tag_id) VALUES ($1, $2)',
          [sessionId, tag.id]
        );
      }
      
      console.log(`✅ Created: ${sessionTitles[i]} on ${dateStr}`);
    }
    
    console.log('\n✨ Test sessions created successfully!');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
    await pool.end();
  }
}

createTestSessions();
