const bcrypt = require('bcryptjs');

const password = 'Buivanvu@#999';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  console.log('Password:', password);
  console.log('Hashed:', hash);
  console.log('');
  console.log('SQL to create admin user:');
  console.log('');
  console.log(`INSERT INTO users (full_name, email, password, role, status, created_at, updated_at)`);
  console.log(`VALUES (`);
  console.log(`  'Bui Van Vu',`);
  console.log(`  'buivuit@gmail.com',`);
  console.log(`  '${hash}',`);
  console.log(`  'admin',`);
  console.log(`  'active',`);
  console.log(`  NOW(),`);
  console.log(`  NOW()`);
  console.log(`);`);
});
