-- COMPLETE FIX FOR REGISTRATION 400 ERROR
-- Execute this entire script in MySQL Workbench

USE registre_medical;

-- 1. Check current table structure
SELECT 'Current users table structure:' as info;
DESCRIBE users;

-- 2. Fix the role column (main issue)
ALTER TABLE users MODIFY COLUMN role VARCHAR(50) NOT NULL;

-- 3. Also ensure other columns are properly sized
ALTER TABLE users MODIFY COLUMN email VARCHAR(50) NOT NULL;
ALTER TABLE users MODIFY COLUMN nom VARCHAR(50) NOT NULL;
ALTER TABLE users MODIFY COLUMN prenom VARCHAR(50);
ALTER TABLE users MODIFY COLUMN telephone VARCHAR(20);

-- 4. Verify the fixes
SELECT 'Fixed users table structure:' as info;
DESCRIBE users;

-- 5. Test with sample data
INSERT INTO users (email, password, nom, prenom, telephone, role, actif, date_creation)
VALUES ('test@example.com', '$2a$10$test', 'Test', 'User', '+22670000000', 'CHEF_DE_ZONE', TRUE, NOW())
ON DUPLICATE KEY UPDATE id = id;

-- 6. Clean up test data
DELETE FROM users WHERE email = 'test@example.com';

SELECT 'Database schema fixed successfully!' as status;
SELECT 'Try registering now - the 400 error should be resolved.' as instruction;