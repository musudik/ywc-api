-- Create form_documents table
CREATE TABLE IF NOT EXISTS form_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_submission_id UUID NOT NULL,
    client_id UUID NOT NULL,
    form_config_id VARCHAR(255) NOT NULL,
    file_name VARCHAR(500) NOT NULL,
    applicant_type VARCHAR(50) NOT NULL,
    document_id VARCHAR(255) NOT NULL,
    firebase_path TEXT NOT NULL,
    upload_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    CONSTRAINT fk_form_documents_form_submission 
        FOREIGN KEY (form_submission_id) REFERENCES form_submissions(id) ON DELETE CASCADE,
    
    -- Indexes for better performance
    CONSTRAINT idx_form_documents_form_submission_id 
        UNIQUE (form_submission_id, document_id, applicant_type)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_form_documents_client_id ON form_documents(client_id);
CREATE INDEX IF NOT EXISTS idx_form_documents_upload_status ON form_documents(upload_status);
CREATE INDEX IF NOT EXISTS idx_form_documents_uploaded_at ON form_documents(uploaded_at);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_form_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_form_documents_updated_at
    BEFORE UPDATE ON form_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_form_documents_updated_at(); 