-- Create online_registrations table for direct submissions
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