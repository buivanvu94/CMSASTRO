/**
 * Test password hashing to debug login issue
 */

import bcrypt from 'bcryptjs';

async function testPasswordHash() {
  console.log('🔐 Testing Password Hash\n');
  
  const plainPassword = 'Buivanvu@#999';
  const storedHash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
  
  console.log('Plain Password:', plainPassword);
  console.log('Stored Hash:', storedHash);
  console.log('');
  
  // Test 1: Compare with stored hash
  console.log('Test 1: Comparing with stored hash...');
  const isMatch1 = await bcrypt.compare(plainPassword, storedHash);
  console.log('Result:', isMatch1 ? '✅ MATCH' : '❌ NO MATCH');
  console.log('');
  
  // Test 2: Generate new hash and compare
  console.log('Test 2: Generating new hash...');
  const newHash = await bcrypt.hash(plainPassword, 10);
  console.log('New Hash:', newHash);
  const isMatch2 = await bcrypt.compare(plainPassword, newHash);
  console.log('Result:', isMatch2 ? '✅ MATCH' : '❌ NO MATCH');
  console.log('');
  
  // Test 3: Test with different passwords
  console.log('Test 3: Testing wrong password...');
  const wrongPassword = 'WrongPassword123';
  const isMatch3 = await bcrypt.compare(wrongPassword, storedHash);
  console.log('Result:', isMatch3 ? '✅ MATCH (SHOULD NOT!)' : '❌ NO MATCH (CORRECT)');
  console.log('');
  
  // Test 4: Check hash format
  console.log('Test 4: Checking hash format...');
  console.log('Hash starts with $2a$10$:', storedHash.startsWith('$2a$10$') ? '✅ YES' : '❌ NO');
  console.log('Hash length:', storedHash.length, '(should be 60)');
  console.log('');
  
  // Conclusion
  console.log('📋 CONCLUSION:');
  if (isMatch1) {
    console.log('✅ Password hash is CORRECT');
    console.log('✅ The issue is NOT with password hashing');
    console.log('⚠️  Check if user exists in database');
    console.log('⚠️  Check if user status is "active"');
  } else {
    console.log('❌ Password hash is INCORRECT');
    console.log('🔧 Need to update password in database');
    console.log('');
    console.log('SQL to fix:');
    console.log(`UPDATE users SET password = '${newHash}' WHERE email = 'buivuit@gmail.com';`);
  }
}

testPasswordHash().catch(console.error);
