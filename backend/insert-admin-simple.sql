-- Simple SQL to create admin user
-- Email: buivuit@gmail.com
-- Password: Buivanvu@#999

USE cms_db;

-- Delete existing user if exists
DELETE FROM users WHERE email = 'buivuit@gmail.com';

-- Insert admin user
INSERT INTO users (full_name, email, password, role, status, created_at, updated_at)
VALUES (
  'Bui Van Vu',
  'buivuit@gmail.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'admin',
  'active',
  NOW(),
  NOW()
);

-- Verify user was created
SELECT id, full_name, email, role, status, created_at FROM users WHERE email = 'buivuit@gmail.com';
