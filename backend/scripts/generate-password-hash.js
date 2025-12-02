// Generate bcrypt password hash for test users
// Run with: node scripts/generate-password-hash.js

const bcrypt = require('bcryptjs');

const password = 'password123';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    return;
  }

  console.log('\n==================================');
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('==================================\n');
  console.log('Use this hash in test-data.sql');
  console.log('Replace the password_hash value with the hash above');
  console.log('\n');
});
