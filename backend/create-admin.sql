-- Create admin user
-- Password: Buivanvu@#999
-- Hashed with bcrypt (10 rounds): $2a$10$YourHashedPasswordHere

-- First, check if user exists
SELECT * FROM users WHERE email = 'buivuit@gmail.com';

-- If user doesn't exist, insert new admin user
-- Note: You need to hash the password first using bcrypt
-- The hash below is for password: Buivanvu@#999
INSERT INTO users (full_name, email, password, role, status, created_at, updated_at)
VALUES (
  'Bui Van Vu',
  'buivuit@gmail.com',
  '$2a$10$rOZxqKH8qVqKqVqKqVqKqeqVqKqVqKqVqKqVqKqVqKqVqKqVqKqVq',
  'admin',
  'active',
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  role = 'admin',
  status = 'active',
  updated_at = NOW();

-- Verify the user was created
SELECT id, full_name, email, role, status, created_at FROM users WHERE email = 'buivuit@gmail.com';
