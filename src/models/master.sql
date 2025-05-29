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

-- Financial data indexes
CREATE INDEX IF NOT EXISTS idx_employment_details_user_id ON employment_details(user_id);
CREATE INDEX IF NOT EXISTS idx_income_details_user_id ON income_details(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_details_user_id ON expenses_details(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_liabilities_user_id ON liabilities(user_id);

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
CREATE TRIGGER update_employment_details_updated_at BEFORE UPDATE ON employment_details FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_income_details_updated_at BEFORE UPDATE ON income_details FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_details_updated_at BEFORE UPDATE ON expenses_details FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_liabilities_updated_at BEFORE UPDATE ON liabilities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================

COMMENT ON TABLE users IS 'Core user table for authentication and role management';
COMMENT ON COLUMN users.coach_id IS 'Self-referencing foreign key to create coach-client relationships';

COMMENT ON TABLE personal_details IS 'User profile and personal information';
COMMENT ON COLUMN personal_details.user_id IS 'References the user who owns this personal data';
COMMENT ON COLUMN personal_details.coach_id IS 'References the coach who manages this client';

COMMENT ON TABLE employment_details IS 'User employment information';
COMMENT ON TABLE income_details IS 'User income information (German tax system)';
COMMENT ON TABLE expenses_details IS 'User expense tracking (German living costs)';
COMMENT ON TABLE assets IS 'User asset portfolio (German financial assets)';
COMMENT ON TABLE liabilities IS 'User liabilities and debts (German loan types)';

-- =====================================
-- SEED DATA
-- =====================================

-- Insert default roles into users table (these act as role templates)
INSERT INTO users (id, email, password, first_name, last_name, role, is_active) 
VALUES 
    (uuid_generate_v4(), 'admin@ywc.com', '$2b$10$example_hash', 'System', 'Admin', 'ADMIN', true),
    (uuid_generate_v4(), 'coach@ywc.com', '$2b$10$example_hash', 'Default', 'Coach', 'COACH', true)
ON CONFLICT (email) DO NOTHING; 