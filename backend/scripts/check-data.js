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

async function checkData() {
  const client = await pool.connect();
  try {
    console.log('\n📊 Checking database content...\n');
    
    // Check sessions
    const sessionsResult = await client.query(`
      SELECT id, title, session_date, start_time, is_published, status
      FROM pd_sessions
      ORDER BY session_date
      LIMIT 10
    `);
    
    console.log('Published Sessions (first 10):');
    console.log('─'.repeat(80));
    sessionsResult.rows.forEach((row, idx) => {
      console.log(`${idx + 1}. [${row.is_published ? '✓' : '✗'}] ${row.title}`);
      console.log(`   Date: ${row.session_date} at ${row.start_time}, Status: ${row.status}`);
    });
    
    // Count summary
    const countResult = await client.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_published THEN 1 ELSE 0 END) as published,
        SUM(CASE WHEN is_published = false THEN 1 ELSE 0 END) as draft
      FROM pd_sessions
    `);
    
    console.log('\n📈 Summary:');
    console.log('─'.repeat(80));
    const { total, published, draft } = countResult.rows[0];
    console.log(`Total Sessions: ${total}`);
    console.log(`Published: ${published}`);
    console.log(`Draft: ${draft}`);
    
    // Check users
    const usersResult = await client.query('SELECT COUNT(*) as count FROM users');
    console.log(`\nTotal Users: ${usersResult.rows[0].count}`);
    
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await client.end();
    await pool.end();
  }
}

checkData();
