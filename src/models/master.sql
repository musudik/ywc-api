-- =====================================
-- YWC Financial Forms Database Schema
-- Clean User-Centric Architecture
-- =====================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================
-- USER MANAGEMENT
-- =====================================

-- Users Table (Core table for authentication and user management)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'COACH', 'CLIENT', 'GUEST')),
    coach_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Self-referencing for coach-client relationship
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================
-- FINANCIAL DATA TABLES
-- =====================================

-- Personal Details Table (User profile information)
CREATE TABLE IF NOT EXISTS personal_details (
    personal_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    coach_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    applicant_type VARCHAR(20) CHECK (applicant_type IN ('PrimaryApplicant', 'SecondaryApplicant')) NOT NULL,
    salutation VARCHAR(10) CHECK (salutation IN ('Mr', 'Mrs', 'Ms', 'Dr', 'Prof')) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    street VARCHAR(255) NOT NULL,
    house_number VARCHAR(20) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    city VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    whatsapp VARCHAR(20),
    marital_status VARCHAR(50) NOT NULL,
    birth_date DATE NOT NULL,
    birth_place VARCHAR(100) NOT NULL,
    nationality VARCHAR(100) NOT NULL,
    residence_permit VARCHAR(100),
    eu_citizen BOOLEAN NOT NULL,
    tax_id VARCHAR(100),
    iban VARCHAR(100),
    housing VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Family Members Table (User's family information)
CREATE TABLE IF NOT EXISTS family_members (
    family_member_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    relation VARCHAR(20) CHECK (relation IN ('Spouse', 'Child', 'Parent', 'Other')) NOT NULL,
    birth_date DATE NOT NULL,
    nationality VARCHAR(100) NOT NULL,
    tax_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employment Details Table
CREATE TABLE IF NOT EXISTS employment_details (
    employment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employment_type VARCHAR(100) NOT NULL,
    occupation VARCHAR(200) NOT NULL,
    contract_type VARCHAR(100),
    contract_duration VARCHAR(100),
    employer_name VARCHAR(200),
    employed_since DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Income Details Table (German tax system focused)
CREATE TABLE IF NOT EXISTS income_details (
    income_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    gross_income DECIMAL(15, 2) NOT NULL DEFAULT 0,
    net_income DECIMAL(15, 2) NOT NULL DEFAULT 0,
    tax_class VARCHAR(10) CHECK (tax_class IN ('I', 'II', 'III', 'IV', 'V', 'VI')) NOT NULL,
    tax_id VARCHAR(100),
    number_of_salaries INTEGER DEFAULT 12,
    child_benefit DECIMAL(10, 2) DEFAULT 0,
    other_income DECIMAL(10, 2) DEFAULT 0,
    income_trade_business DECIMAL(10, 2) DEFAULT 0,
    income_self_employed_work DECIMAL(10, 2) DEFAULT 0,
    income_side_job DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expenses Details Table (German living expenses)
CREATE TABLE IF NOT EXISTS expenses_details (
    expenses_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cold_rent DECIMAL(10, 2) DEFAULT 0,
    electricity DECIMAL(10, 2) DEFAULT 0,
    living_expenses DECIMAL(10, 2) DEFAULT 0,
    gas DECIMAL(10, 2) DEFAULT 0,
    telecommunication DECIMAL(10, 2) DEFAULT 0,
    account_maintenance_fee DECIMAL(10, 2) DEFAULT 0,
    alimony DECIMAL(10, 2) DEFAULT 0,
    subscriptions DECIMAL(10, 2) DEFAULT 0,
    other_expenses DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assets Table (German financial assets)
CREATE TABLE IF NOT EXISTS assets (
    asset_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    real_estate DECIMAL(15, 2) DEFAULT 0,
    securities DECIMAL(15, 2) DEFAULT 0,
    bank_deposits DECIMAL(15, 2) DEFAULT 0,
    building_savings DECIMAL(15, 2) DEFAULT 0,
    insurance_values DECIMAL(15, 2) DEFAULT 0,
    other_assets DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Liabilities Table (German loans and debts)
CREATE TABLE IF NOT EXISTS liabilities (
    liability_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    loan_type VARCHAR(100),
    loan_bank VARCHAR(200),
    loan_amount DECIMAL(15, 2),
    loan_monthly_rate DECIMAL(10, 2),
    loan_interest DECIMAL(5, 3),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Form Configurations Table (Configuration tool for dynamic forms)
CREATE TABLE IF NOT EXISTS form_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_id VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    form_type VARCHAR(100) NOT NULL,
    version VARCHAR(50) NOT NULL DEFAULT '1.0',
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sections JSONB NOT NULL DEFAULT '[]'::jsonb,
    custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
    consent_form JSONB NOT NULL DEFAULT '{}'::jsonb,
    documents JSONB NOT NULL DEFAULT '[]'::jsonb,
    applicantconfig VARCHAR(100) NOT NULL DEFAULT 'single' CHECK (applicantconfig IN ('single', 'joint', 'family', 'business', 'individual', 'multiple')),
    usage_count INTEGER NOT NULL DEFAULT 0,
    last_used_at TIMESTAMP,
    CONSTRAINT unique_name_form_type UNIQUE (name, form_type)
);

-- Form Submissions Table (User form submissions)
CREATE TABLE IF NOT EXISTS form_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_config_id UUID NOT NULL REFERENCES form_configurations(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'under_review')),
    submitted_at TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    review_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================
-- INDEXES FOR PERFORMANCE
-- =====================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_coach_id ON users(coach_id);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Personal details indexes
CREATE INDEX IF NOT EXISTS idx_personal_details_user_id ON personal_details(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_details_coach_id ON personal_details(coach_id);
CREATE INDEX IF NOT EXISTS idx_personal_details_email ON personal_details(email);

-- Family members indexes
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_relation ON family_members(relation);

-- Financial data indexes
CREATE INDEX IF NOT EXISTS idx_employment_details_user_id ON employment_details(user_id);
CREATE INDEX IF NOT EXISTS idx_income_details_user_id ON income_details(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_details_user_id ON expenses_details(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_liabilities_user_id ON liabilities(user_id);

-- Form configurations indexes
CREATE INDEX IF NOT EXISTS idx_form_configurations_config_id ON form_configurations(config_id);
CREATE INDEX IF NOT EXISTS idx_form_configurations_created_by_id ON form_configurations(created_by_id);
CREATE INDEX IF NOT EXISTS idx_form_configurations_form_type ON form_configurations(form_type);
CREATE INDEX IF NOT EXISTS idx_form_configurations_is_active ON form_configurations(is_active);
CREATE INDEX IF NOT EXISTS idx_form_configurations_name_form_type ON form_configurations(name, form_type);
CREATE INDEX IF NOT EXISTS idx_form_configurations_applicantconfig ON form_configurations(applicantconfig);

-- Form submissions indexes
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_config_id ON form_submissions(form_config_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_user_id ON form_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_status ON form_submissions(status);
CREATE INDEX IF NOT EXISTS idx_form_submissions_submitted_at ON form_submissions(submitted_at);
CREATE INDEX IF NOT EXISTS idx_form_submissions_reviewed_by ON form_submissions(reviewed_by);

-- =====================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_personal_details_updated_at BEFORE UPDATE ON personal_details FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON family_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employment_details_updated_at BEFORE UPDATE ON employment_details FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_income_details_updated_at BEFORE UPDATE ON income_details FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_details_updated_at BEFORE UPDATE ON expenses_details FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_liabilities_updated_at BEFORE UPDATE ON liabilities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_form_configurations_updated_at BEFORE UPDATE ON form_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_form_submissions_updated_at BEFORE UPDATE ON form_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================

COMMENT ON TABLE users IS 'Core user table for authentication and role management';
COMMENT ON COLUMN users.coach_id IS 'Self-referencing foreign key to create coach-client relationships';

COMMENT ON TABLE personal_details IS 'User profile and personal information';
COMMENT ON COLUMN personal_details.user_id IS 'References the user who owns this personal data';
COMMENT ON COLUMN personal_details.coach_id IS 'References the coach who manages this client';

COMMENT ON TABLE family_members IS 'Family member information for users';
COMMENT ON COLUMN family_members.user_id IS 'References the user who owns this family member data';
COMMENT ON COLUMN family_members.relation IS 'Relationship type: Spouse, Child, Parent, or Other';

COMMENT ON TABLE employment_details IS 'User employment information';
COMMENT ON TABLE income_details IS 'User income information (German tax system)';
COMMENT ON TABLE expenses_details IS 'User expense tracking (German living costs)';
COMMENT ON TABLE assets IS 'User asset portfolio (German financial assets)';
COMMENT ON TABLE liabilities IS 'User liabilities and debts (German loan types)';

COMMENT ON TABLE form_configurations IS 'Dynamic form configurations for the configuration tool';
COMMENT ON COLUMN form_configurations.config_id IS 'Unique identifier for the configuration';
COMMENT ON COLUMN form_configurations.created_by_id IS 'References the user who created this configuration';
COMMENT ON COLUMN form_configurations.sections IS 'JSON configuration for form sections and fields';
COMMENT ON COLUMN form_configurations.custom_fields IS 'JSON configuration for custom form fields';
COMMENT ON COLUMN form_configurations.consent_form IS 'JSON configuration for consent form settings';
COMMENT ON COLUMN form_configurations.documents IS 'JSON configuration for required documents';
COMMENT ON COLUMN form_configurations.applicantconfig IS 'Applicant configuration type: single, joint, family, business, individual, or multiple';

COMMENT ON TABLE form_submissions IS 'User form submissions based on form configurations';
COMMENT ON COLUMN form_submissions.form_config_id IS 'References the form configuration used for this submission';
COMMENT ON COLUMN form_submissions.user_id IS 'References the user who submitted this form';
COMMENT ON COLUMN form_submissions.form_data IS 'JSON data containing the submitted form values';
COMMENT ON COLUMN form_submissions.status IS 'Current status of the form submission';
COMMENT ON COLUMN form_submissions.reviewed_by IS 'References the user who reviewed this submission';

-- =====================================
-- SEED DATA
-- =====================================

-- Insert default roles into users table (these act as role templates)
INSERT INTO users (id, email, password, first_name, last_name, role, is_active) 
VALUES 
    (uuid_generate_v4(), 'admin@ywc.com', '$2b$10$example_hash', 'System', 'Admin', 'ADMIN', true),
    (uuid_generate_v4(), 'coach@ywc.com', '$2b$10$example_hash', 'Default', 'Coach', 'COACH', true)
ON CONFLICT (email) DO NOTHING; 