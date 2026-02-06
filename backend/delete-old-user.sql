-- Delete old user to avoid conflict
USE cms_db;
DELETE FROM users WHERE email = 'buivuit@gmail.com';
SELECT 'User deleted successfully' as status;
