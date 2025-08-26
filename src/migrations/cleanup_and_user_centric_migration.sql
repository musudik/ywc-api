-- =====================================
-- CLEANUP AND USER-CENTRIC MIGRATION
-- =====================================

-- Step 1: Drop unused tables with no data
DROP TABLE IF EXISTS children CASCADE;
DROP TABLE IF EXISTS family_details CASCADE;
DROP TABLE IF EXISTS forms CASCADE;
DROP TABLE IF EXISTS form_documents CASCADE;
DROP TABLE IF EXISTS previous_employment CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS person_complete_profile CASCADE;

-- Step 2: Remove personal_id foreign key constraints and columns from all tables
-- This makes everything user-centric

-- Assets table
ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_personal_id_fkey;
ALTER TABLE assets DROP COLUMN IF EXISTS personal_id;

-- Employment details table  
ALTER TABLE employment_details DROP CONSTRAINT IF EXISTS employment_details_personal_id_fkey;
ALTER TABLE employment_details DROP COLUMN IF EXISTS personal_id;

-- Expenses details table
ALTER TABLE expenses_details DROP CONSTRAINT IF EXISTS expenses_details_personal_id_fkey;
ALTER TABLE expenses_details DROP COLUMN IF EXISTS personal_id;

-- Income details table
ALTER TABLE income_details DROP CONSTRAINT IF EXISTS income_details_personal_id_fkey;
ALTER TABLE income_details DROP COLUMN IF EXISTS personal_id;

-- Liabilities table
ALTER TABLE liabilities DROP CONSTRAINT IF EXISTS liabilities_personal_id_fkey;
ALTER TABLE liabilities DROP COLUMN IF EXISTS personal_id;

-- Step 3: Clean up personal_details table
-- Remove coach_user_id column (we'll use coach_id in users table)
ALTER TABLE personal_details DROP CONSTRAINT IF EXISTS personal_details_coach_user_id_fkey;
ALTER TABLE personal_details DROP COLUMN IF EXISTS coach_user_id;

-- Step 4: Add proper indexes for user_id columns
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_employment_details_user_id ON employment_details(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_details_user_id ON expenses_details(user_id);
CREATE INDEX IF NOT EXISTS idx_income_details_user_id ON income_details(user_id);
CREATE INDEX IF NOT EXISTS idx_liabilities_user_id ON liabilities(user_id);

-- Step 5: Ensure all user_id columns are NOT NULL
UPDATE assets SET user_id = (SELECT user_id FROM personal_details LIMIT 1) WHERE user_id IS NULL;
UPDATE employment_details SET user_id = (SELECT user_id FROM personal_details LIMIT 1) WHERE user_id IS NULL;
UPDATE expenses_details SET user_id = (SELECT user_id FROM personal_details LIMIT 1) WHERE user_id IS NULL;
UPDATE income_details SET user_id = (SELECT user_id FROM personal_details LIMIT 1) WHERE user_id IS NULL;
UPDATE liabilities SET user_id = (SELECT user_id FROM personal_details LIMIT 1) WHERE user_id IS NULL;

-- Make user_id NOT NULL
ALTER TABLE assets ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE employment_details ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE expenses_details ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE income_details ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE liabilities ALTER COLUMN user_id SET NOT NULL;

-- Step 6: Update personal_details table structure
-- Make coach_id NOT NULL (it should reference the coach who manages this client)
UPDATE personal_details SET coach_id = (SELECT id FROM users WHERE role = 'COACH' LIMIT 1) WHERE coach_id IS NULL;
ALTER TABLE personal_details ALTER COLUMN coach_id SET NOT NULL;

COMMENT ON COLUMN personal_details.coach_id IS 'References the coach who manages this client';
COMMENT ON COLUMN personal_details.user_id IS 'References the user (client) who owns this personal data';

-- Clean up indexes that might reference dropped columns
DROP INDEX IF EXISTS idx_personal_details_coach_user_id;

-- Step 7: Create online_registrations table for direct submissions
CREATE TABLE IF NOT EXISTS online_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_type VARCHAR(50) NOT NULL DEFAULT 'PrimaryApplicant',
    salutation VARCHAR(10),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    street VARCHAR(255),
    house_number VARCHAR(20),
    postal_code VARCHAR(20),
    city VARCHAR(100),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    whatsapp VARCHAR(20),
    marital_status VARCHAR(50),
    birth_date DATE,
    birth_place VARCHAR(100),
    nationality VARCHAR(100),
    residence_permit VARCHAR(100),
    eu_citizen BOOLEAN DEFAULT false,
    tax_id VARCHAR(50),
    iban VARCHAR(34),
    housing VARCHAR(100),
    coach VARCHAR(255), -- Optional coach field
    registration_data JSONB, -- Store complete form data as JSON
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_online_registrations_email ON online_registrations(email);
CREATE INDEX IF NOT EXISTS idx_online_registrations_status ON online_registrations(status);
CREATE INDEX IF NOT EXISTS idx_online_registrations_created_at ON online_registrations(created_at);
CREATE INDEX IF NOT EXISTS idx_online_registrations_coach ON online_registrations(coach);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_online_registrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_online_registrations_updated_at
    BEFORE UPDATE ON online_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_online_registrations_updated_at();

-- Final verification query
DO $$ 
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Remaining tables are now user-centric.';
  RAISE NOTICE 'Online registrations table created for direct submissions.';
END $$;