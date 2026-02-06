-- Drop and recreate database
DROP DATABASE IF EXISTS cms_db;
CREATE DATABASE cms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cms_db;

-- Database is now empty and ready for Sequelize sync
