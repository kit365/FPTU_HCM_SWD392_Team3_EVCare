-- Script to reset all users and roles for EVCare
-- Run this before restarting backend to recreate sample users

-- Delete all users (except admin if needed)
DELETE FROM users WHERE email != 'admin@evcare.com';

-- Or delete ALL users including admin (will be recreated)
-- DELETE FROM users;

-- Delete all roles (will be recreated)
-- DELETE FROM roles;

-- Note: If you want to keep the admin user and only add new users,
-- modify RoleAndUserData.java to not skip when users exist

