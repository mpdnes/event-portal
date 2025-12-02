#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'pd_portal',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function loadTestData() {
  const client = await pool.connect();
  try {
    console.log('📋 Loading test data...');
    
    // Read and execute test-data.sql
    const testDataPath = path.join(__dirname, '../database/test-data.sql');
    const sql = fs.readFileSync(testDataPath, 'utf-8');
    
    // Split by semicolons and execute each statement
    const statements = sql.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await client.query(statement);
        } catch (err) {
          // Skip errors for ON CONFLICT clauses
          if (!err.message.includes('already exists') && !err.message.includes('duplicate')) {
            console.warn('⚠️ Warning:', err.message);
          }
        }
      }
    }
    
    console.log('✅ Test data loaded successfully!');
    
    // Verify data was loaded
    const sessionsResult = await client.query('SELECT COUNT(*) as count FROM pd_sessions WHERE is_published = true');
    console.log(`📊 Published sessions: ${sessionsResult.rows[0].count}`);
    
  } catch (err) {
    console.error('❌ Error loading test data:', err);
    process.exit(1);
  } finally {
    await client.end();
    await pool.end();
  }
}

loadTestData();
