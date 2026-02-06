// Quick script to generate password hash
const bcrypt = require('bcryptjs');

const password = 'Buivanvu@#999';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  console.log('\n=================================');
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('=================================\n');
  console.log('SQL to update:');
  console.log(`UPDATE users SET password = '${hash}', status = 'active', role = 'admin' WHERE email = 'buivuit@gmail.com';`);
  console.log('\n=================================\n');
});
