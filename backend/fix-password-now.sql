-- Fix password for buivuit@gmail.com
-- This will generate a NEW hash for password: Buivanvu@#999

USE cms_db;

-- First, let's see current user
SELECT id, full_name, email, role, status, 
       LEFT(password, 20) as password_preview,
       LENGTH(password) as password_length
FROM users 
WHERE email = 'buivuit@gmail.com';

-- Update with a freshly generated hash
-- This hash is for password: Buivanvu@#999
-- Generated with: bcrypt.hash('Buivanvu@#999', 10)
UPDATE users 
SET 
  password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  role = 'admin',
  status = 'active',
  updated_at = NOW()
WHERE email = 'buivuit@gmail.com';

-- Verify the update
SELECT id, full_name, email, role, status,
       LEFT(password, 20) as password_preview,
       LENGTH(password) as password_length,
       created_at, updated_at
FROM users 
WHERE email = 'buivuit@gmail.com';

-- Show all users for reference
SELECT id, email, role, status FROM users;
