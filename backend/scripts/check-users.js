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

async function checkUsers() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT email, role, is_active FROM users
    `);
    
    console.log('Users in database:');
    result.rows.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) ${user.is_active ? '[active]' : '[inactive]'}`);
    });
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
    await pool.end();
  }
}

checkUsers();
