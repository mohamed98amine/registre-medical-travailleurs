-- Fix for role column truncation error
-- Run this in MySQL Workbench or command line

USE registre_medical;

-- Check current structure
DESCRIBE users;

-- Fix the role column to support longer values
ALTER TABLE users MODIFY COLUMN role VARCHAR(50) NOT NULL;

-- Verify the fix
DESCRIBE users;

-- Test with a sample role value
SELECT 'Role column fixed - should now accept values like CHEF_DE_ZONE' as status;