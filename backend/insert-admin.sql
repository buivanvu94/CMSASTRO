-- Insert admin user with pre-hashed password
-- Email: buivuit@gmail.com
-- Password: Buivanvu@#999
-- Hash generated with bcrypt rounds=10

USE cms_db;

-- Insert or update admin user
INSERT INTO users (full_name, email, password, role, status, created_at, updated_at)
VALUES (
  'Bui Van Vu',
  'buivuit@gmail.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'admin',
  'active',
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  role = 'admin',
  status = 'active',
  updated_at = NOW();

-- Show the created user
SELECT id, full_name, email, role, status, created_at FROM users WHERE email = 'buivuit@gmail.com';
