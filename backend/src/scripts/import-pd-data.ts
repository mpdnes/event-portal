import pool from '../config/database';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface PDData {
  title: string;
  presenter: string | null;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  registrants: string[];
}

// Parse a single .docx file
function parseDocxFile(filePath: string): PDData | null {
  try {
    // Extract text from docx using unzip
    const xmlContent = execSync(`unzip -p "${filePath}" word/document.xml`).toString();
    const textMatches = xmlContent.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
    const lines = textMatches.map(m => m.replace(/<[^>]*>/g, '').trim()).filter(l => l);

    if (lines.length < 4) return null;

    const title = lines[0];
    let presenter: string | null = null;
    let dateTime = '';
    let location = '';
    let description = '';
    const registrants: string[] = [];

    // Parse presenter line (e.g., "- presented by Name")
    if (lines[1].startsWith('- presented by')) {
      presenter = lines[1].replace('- presented by', '').trim();
    }

    // Parse date/time line
    const dateTimeMatch = lines.find(l => l.includes('am') || l.includes('pm'));
    if (dateTimeMatch) {
      dateTime = dateTimeMatch;
    }

    // Parse location
    const locationMatch = lines.find(l => l.startsWith('Location:'));
    if (locationMatch) {
      location = locationMatch.replace('Location:', '').trim();
    }

    // Parse description
    const descMatch = lines.find(l => l.startsWith('Description:'));
    if (descMatch) {
      description = descMatch.replace('Description:', '').trim();
    }

    // Parse date and time
    const dateMatch = dateTime.match(/([A-Za-z]+ \d+, \d+)/);
    const timeMatch = dateTime.match(/(\d+:\d+[ap]m)\s*-\s*(\d+:\d+[ap]m)/);

    if (!dateMatch || !timeMatch) {
      console.warn(`Could not parse date/time for ${title}`);
      return null;
    }

    const date = new Date(dateMatch[1]).toISOString().split('T')[0];
    const startTime = timeMatch[1];
    const endTime = timeMatch[2];

    // Collect registrants (names after the description)
    const descIndex = lines.findIndex(l => l.startsWith('Description:'));
    if (descIndex >= 0) {
      for (let i = descIndex + 2; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line && !line.match(/^\d+$/)) {
          registrants.push(line);
        }
      }
    }

    return {
      title,
      presenter,
      date,
      startTime,
      endTime,
      location,
      description,
      registrants
    };
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    return null;
  }
}

// Create tags based on session content
function extractTags(title: string): string[] {
  const tags: string[] = [];

  const lowerTitle = title.toLowerCase();

  if (lowerTitle.includes('yoga') || lowerTitle.includes('meditation') || lowerTitle.includes('stretch')) {
    tags.push('Wellness');
  }
  if (lowerTitle.includes('tour') || lowerTitle.includes('observatory') || lowerTitle.includes('history')) {
    tags.push('Tour');
  }
  if (lowerTitle.includes('ai') || lowerTitle.includes('artificial intelligence') || lowerTitle.includes('technology')) {
    tags.push('Technology');
  }
  if (lowerTitle.includes('captioning') || lowerTitle.includes('verbatim')) {
    tags.push('Captioning');
  }
  if (lowerTitle.includes('movie') || lowerTitle.includes('film')) {
    tags.push('Entertainment');
  }
  if (lowerTitle.includes('career') || lowerTitle.includes('professional')) {
    tags.push('Professional Development');
  }
  if (lowerTitle.includes('cultural') || lowerTitle.includes('diversity') || lowerTitle.includes('humility')) {
    tags.push('Diversity & Inclusion');
  }
  if (lowerTitle.includes('coffee') || lowerTitle.includes('social') || lowerTitle.includes('party')) {
    tags.push('Social');
  }

  if (tags.length === 0) {
    tags.push('General');
  }

  return tags;
}

// Main import function
async function importPDData() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('🗑️  Clearing existing data...');
    await client.query('DELETE FROM registrations');
    await client.query('DELETE FROM session_tags');
    await client.query('DELETE FROM pd_sessions');
    await client.query('DELETE FROM tags');

    // Create tags
    console.log('🏷️  Creating tags...');
    const tagColors: Record<string, { color: string; emoji: string }> = {
      'Wellness': { color: '#10b981', emoji: '🧘' },
      'Tour': { color: '#f59e0b', emoji: '🏛️' },
      'Technology': { color: '#3b82f6', emoji: '💻' },
      'Captioning': { color: '#8b5cf6', emoji: '📝' },
      'Entertainment': { color: '#ec4899', emoji: '🎬' },
      'Professional Development': { color: '#06b6d4', emoji: '📈' },
      'Diversity & Inclusion': { color: '#14b8a6', emoji: '🌍' },
      'Social': { color: '#f97316', emoji: '☕' },
      'General': { color: '#6b7280', emoji: '📚' }
    };

    const tagIds: Record<string, string> = {};

    for (const [tagName, { color, emoji }] of Object.entries(tagColors)) {
      const result = await client.query(
        'INSERT INTO tags (name, color, emoji) VALUES ($1, $2, $3) RETURNING id',
        [tagName, color, emoji]
      );
      tagIds[tagName] = result.rows[0].id;
    }

    // Parse all .docx files
    console.log('\n📄 Parsing PD session files...');
    const pdDir = process.env.PD_DOCS_DIR || './docs/pd-sessions';
    const files = fs.readdirSync(pdDir).filter(f => f.endsWith('.docx') && !f.startsWith('~'));

    let successCount = 0;
    let skipCount = 0;

    for (const file of files) {
      const filePath = path.join(pdDir, file);
      console.log(`\n  Processing: ${file}`);

      const pdData = parseDocxFile(filePath);

      if (!pdData) {
        console.log(`  ⚠️  Skipped (could not parse)`);
        skipCount++;
        continue;
      }

      // Insert session
      const sessionResult = await client.query(
        `INSERT INTO pd_sessions (
          title, description, external_presenter_name, location,
          session_date, start_time, end_time, capacity,
          is_published, requires_password, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id`,
        [
          pdData.title,
          pdData.description,
          pdData.presenter,
          pdData.location,
          pdData.date,
          pdData.startTime,
          pdData.endTime,
          30, // Default capacity
          true,
          false,
          'published'
        ]
      );

      const sessionId = sessionResult.rows[0].id;

      // Add tags
      const sessionTags = extractTags(pdData.title);
      for (const tagName of sessionTags) {
        if (tagIds[tagName]) {
          await client.query(
            'INSERT INTO session_tags (session_id, tag_id) VALUES ($1, $2)',
            [sessionId, tagIds[tagName]]
          );
        }
      }

      console.log(`  ✅ Imported: ${pdData.title}`);
      console.log(`     📅 ${pdData.date} ${pdData.startTime} - ${pdData.endTime}`);
      console.log(`     📍 ${pdData.location}`);
      console.log(`     🏷️  Tags: ${sessionTags.join(', ')}`);

      successCount++;
    }

    await client.query('COMMIT');

    console.log('\n' + '='.repeat(80));
    console.log(`✅ Import complete!`);
    console.log(`   Successfully imported: ${successCount} sessions`);
    console.log(`   Skipped: ${skipCount} files`);
    console.log(`   Created: ${Object.keys(tagIds).length} tags`);
    console.log('='.repeat(80));

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Import failed:', error);
    throw error;
  } finally {
    client.release();
    process.exit(0);
  }
}

// Run import
console.log('🚀 Starting PD data import...\n');
importPDData().catch(console.error);
