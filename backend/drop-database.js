import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dropAndCreateDatabase = async () => {
  try {
    // Connect without database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    console.log('✓ Connected to MySQL');

    // Drop database if exists
    await connection.query(`DROP DATABASE IF EXISTS ${process.env.DB_NAME}`);
    console.log(`✓ Dropped database: ${process.env.DB_NAME}`);

    // Create database
    await connection.query(`CREATE DATABASE ${process.env.DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✓ Created database: ${process.env.DB_NAME}`);

    await connection.end();
    console.log('✓ Database reset complete');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
};

dropAndCreateDatabase();
