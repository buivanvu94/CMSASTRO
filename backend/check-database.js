/**
 * Check database tables
 */

import mysql from 'mysql2/promise';

async function checkDatabase() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '261331064',
      database: 'cms_db'
    });
    
    console.log('✅ Connected to database');
    
    // Check tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\n📋 Tables in cms_db:');
    tables.forEach(table => {
      console.log('  -', Object.values(table)[0]);
    });
    
    // Check users table structure
    const [columns] = await connection.execute('DESCRIBE users');
    console.log('\n📋 Users table structure:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // Count users
    const [count] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`\n👥 Total users: ${count[0].count}`);
    
    // List users
    if (count[0].count > 0) {
      const [users] = await connection.execute('SELECT id, full_name, email, role, status FROM users');
      console.log('\n📋 Existing users:');
      users.forEach(user => {
        console.log(`  - ${user.email} (${user.role}) - ${user.status}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkDatabase();
