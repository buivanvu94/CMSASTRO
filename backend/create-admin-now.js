/**
 * Simple script to create admin user
 * Run: node create-admin-now.js
 */

import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

async function createAdminUser() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    
    // Create connection
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '261331064',
      database: 'cms_db'
    });
    
    console.log('✅ Connected to database');
    
    // Check if user exists
    console.log('\n🔍 Checking if user exists...');
    const [existingUsers] = await connection.execute(
      'SELECT id, email, role FROM users WHERE email = ?',
      ['buivuit@gmail.com']
    );
    
    if (existingUsers.length > 0) {
      console.log('⚠️  User already exists!');
      console.log('   ID:', existingUsers[0].id);
      console.log('   Email:', existingUsers[0].email);
      console.log('   Role:', existingUsers[0].role);
      
      // Update password
      console.log('\n🔄 Updating password...');
      const password = 'Buivanvu@#999';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await connection.execute(
        'UPDATE users SET password = ?, role = ?, status = ? WHERE email = ?',
        [hashedPassword, 'admin', 'active', 'buivuit@gmail.com']
      );
      
      console.log('✅ Password updated!');
    } else {
      console.log('❌ User not found. Creating...');
      
      // Hash password
      const password = 'Buivanvu@#999';
      console.log('\n🔐 Hashing password...');
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('✅ Password hashed');
      
      // Insert user
      console.log('\n📝 Creating user...');
      const [result] = await connection.execute(
        `INSERT INTO users (full_name, email, password, role, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        ['Bui Van Vu', 'buivuit@gmail.com', hashedPassword, 'admin', 'active']
      );
      
      console.log('✅ User created! ID:', result.insertId);
    }
    
    // Verify user
    console.log('\n✅ Verifying user...');
    const [users] = await connection.execute(
      'SELECT id, full_name, email, role, status, created_at FROM users WHERE email = ?',
      ['buivuit@gmail.com']
    );
    
    if (users.length > 0) {
      const user = users[0];
      console.log('\n📋 User Details:');
      console.log('   ID:', user.id);
      console.log('   Name:', user.full_name);
      console.log('   Email:', user.email);
      console.log('   Role:', user.role);
      console.log('   Status:', user.status);
      console.log('   Created:', user.created_at);
      
      console.log('\n🎉 SUCCESS!');
      console.log('\n📝 Login Credentials:');
      console.log('   URL: http://localhost:4322/login');
      console.log('   Email: buivuit@gmail.com');
      console.log('   Password: Buivanvu@#999');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code) {
      console.error('   Code:', error.code);
    }
    if (error.sqlMessage) {
      console.error('   SQL Error:', error.sqlMessage);
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n👋 Database connection closed');
    }
  }
}

// Run the script
createAdminUser();
