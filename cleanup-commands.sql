-- =====================================
-- DATABASE CLEANUP COMMANDS
-- =====================================
-- Use these commands to manually clean your database

-- Method 1: Drop all tables individually (safer)
-- Run these commands one by one or all together

-- Drop tables in dependency order (children first, then parents)
DROP TABLE IF EXISTS form_documents CASCADE;
DROP TABLE IF EXISTS form_submissions CASCADE;
DROP TABLE IF EXISTS form_configurations CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS liabilities CASCADE;
DROP TABLE IF EXISTS expenses_details CASCADE;
DROP TABLE IF EXISTS income_details CASCADE;
DROP TABLE IF EXISTS employment_details CASCADE;
DROP TABLE IF EXISTS family_members CASCADE;
DROP TABLE IF EXISTS personal_details CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop any remaining functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_form_documents_updated_at() CASCADE;

-- Optional: Drop and recreate UUID extension
-- DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================
-- VERIFICATION QUERIES
-- =====================================
-- Run these to verify cleanup

-- Check remaining tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check remaining functions
SELECT proname 
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Check extensions
SELECT extname FROM pg_extension;

-- =====================================
-- COMPLETE DATABASE RESET (DANGEROUS!)
-- =====================================
-- Only use this if you want to completely reset everything
-- This will disconnect all users and recreate the database

-- Connect to 'postgres' database first, then run:
-- SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'ywc' AND pid <> pg_backend_pid();
-- DROP DATABASE IF EXISTS ywc;
-- CREATE DATABASE ywc OWNER ywc;

-- =====================================
-- AFTER CLEANUP
-- =====================================
-- After running cleanup, execute the master schema:
-- \i src/models/master.sql
-- 
-- Or using psql command line:
-- psql -U ywc -d ywc -f src/models/master.sql 