# Form Configuration Tool API Documentation

## Overview

The Form Configuration Tool API provides a comprehensive solution for creating, managing, and deploying dynamic forms. This system allows administrators and coaches to build custom forms with complex validation, conditional fields, consent forms, and document requirements.

## Database Schema

### `form_configurations` Table

```sql
CREATE TABLE form_configurations (
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
    usage_count INTEGER NOT NULL DEFAULT 0,
    last_used_at TIMESTAMP,
    CONSTRAINT unique_name_form_type UNIQUE (name, form_type)
);
```

## API Endpoints

### Base URL: `/api/form-configurations`

All endpoints require authentication via JWT token.

## CRUD Operations

### 1. Create Form Configuration
**POST** `/api/form-configurations`

Creates a new form configuration.

#### Request Body:
```json
{
  "name": "Customer Financial Assessment",
  "form_type": "financial_assessment",
  "version": "1.0",
  "description": "Comprehensive financial assessment form for new clients",
  "is_active": true,
  "sections": [
    {
      "id": "personal_info",
      "title": "Personal Information",
      "description": "Basic personal details",
      "order": 1,
      "collapsible": false,
      "fields": [
        {
          "id": "first_name",
          "name": "first_name",
          "label": "First Name",
          "type": "text",
          "required": true,
          "placeholder": "Enter your first name",
          "validation": {
            "min": 2,
            "max": 50,
            "message": "First name must be between 2-50 characters"
          }
        },
        {
          "id": "income_range",
          "name": "income_range",
          "label": "Annual Income Range",
          "type": "select",
          "required": true,
          "options": [
            { "value": "0-30000", "label": "€0 - €30,000" },
            { "value": "30000-60000", "label": "€30,000 - €60,000" },
            { "value": "60000-100000", "label": "€60,000 - €100,000" },
            { "value": "100000+", "label": "€100,000+" }
          ]
        }
      ]
    }
  ],
  "custom_fields": {
    "styling": {
      "theme": "professional",
      "primary_color": "#2563eb"
    },
    "validation": {
      "enable_real_time": true,
      "custom_rules": []
    }
  },
  "consent_form": {
    "enabled": true,
    "title": "Data Processing Consent",
    "content": "I consent to the collection and processing of my personal and financial data for the purpose of financial assessment and advisory services.",
    "required": true,
    "checkboxText": "I agree to the data processing terms"
  },
  "documents": [
    {
      "id": "income_proof",
      "name": "Proof of Income",
      "description": "Recent pay stubs, tax returns, or employment contract",
      "required": true,
      "acceptedTypes": ["pdf", "jpg", "png", "docx"],
      "maxSize": 10
    }
  ]
}
```

#### Response:
```json
{
  "success": true,
  "message": "Form configuration created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "config_id": "config_1697123456789_abc123def",
    "name": "Customer Financial Assessment",
    "form_type": "financial_assessment",
    "version": "1.0",
    "description": "Comprehensive financial assessment form for new clients",
    "is_active": true,
    "sections": [...],
    "custom_fields": {...},
    "consent_form": {...},
    "documents": [...],
    "usage_count": 0,
    "created_at": "2023-10-12T10:30:00.000Z",
    "updated_at": "2023-10-12T10:30:00.000Z",
    "created_by_id": "user-uuid-here"
  }
}
```

### 2. Get All Form Configurations
**GET** `/api/form-configurations`

Retrieves all form configurations with optional filtering.

#### Query Parameters:
- `form_type` (optional): Filter by form type
- `is_active` (optional): Filter by active status (true/false)
- `created_by_id` (optional): Filter by creator
- `version` (optional): Filter by version

#### Examples:
```
GET /api/form-configurations?form_type=financial_assessment&is_active=true
GET /api/form-configurations?created_by_id=user-uuid
```

### 3. Get Form Configuration by ID
**GET** `/api/form-configurations/:id`

Retrieves a specific form configuration by its UUID.

### 4. Get Form Configuration by Config ID
**GET** `/api/form-configurations/config/:configId`

Retrieves a form configuration by its config_id. This endpoint also increments the usage count.

### 5. Get Form Configurations by User
**GET** `/api/form-configurations/user/:userId`

Retrieves all form configurations created by a specific user.

### 6. Get Form Configurations by Type
**GET** `/api/form-configurations/type/:formType`

Retrieves all active form configurations of a specific type.

### 7. Update Form Configuration
**PUT** `/api/form-configurations/:id`

Updates an existing form configuration.

#### Request Body:
```json
{
  "name": "Updated Form Name",
  "description": "Updated description",
  "sections": [...],
  "is_active": false
}
```

### 8. Delete Form Configuration
**DELETE** `/api/form-configurations/:id`

Deletes a form configuration permanently.

## Advanced Operations

### 9. Toggle Form Status
**PATCH** `/api/form-configurations/:id/status`

Activates or deactivates a form configuration.

#### Request Body:
```json
{
  "is_active": false
}
```

### 10. Clone Form Configuration
**POST** `/api/form-configurations/:id/clone`

Creates a copy of an existing form configuration.

#### Request Body:
```json
{
  "name": "Cloned Form Configuration Name"
}
```

### 11. Get Usage Statistics
**GET** `/api/form-configurations/statistics`

Retrieves usage statistics for form configurations.

#### Query Parameters:
- `userId` (optional): Filter statistics by creator

#### Response:
```json
{
  "success": true,
  "message": "Usage statistics retrieved successfully",
  "data": [
    {
      "id": "config-uuid",
      "config_id": "config_123",
      "name": "Financial Assessment",
      "form_type": "financial_assessment",
      "version": "1.0",
      "usage_count": 45,
      "last_used_at": "2023-10-12T15:30:00.000Z",
      "is_active": true,
      "created_at": "2023-10-01T10:00:00.000Z"
    }
  ]
}
```

## Form Structure

### Field Types
The system supports the following field types:

- **text**: Single-line text input
- **email**: Email input with validation
- **number**: Numeric input
- **date**: Date picker
- **select**: Dropdown selection
- **checkbox**: Single checkbox
- **radio**: Radio button group
- **textarea**: Multi-line text input
- **file**: File upload

### Field Validation
Each field can have validation rules:

```json
{
  "validation": {
    "min": 0,
    "max": 100,
    "pattern": "^[A-Za-z]+$",
    "message": "Custom error message"
  }
}
```

### Conditional Fields
Fields can be conditionally shown based on other field values:

```json
{
  "conditional": {
    "field": "employment_status",
    "value": "employed",
    "operator": "equals"
  }
}
```

### Document Configuration
Configure required documents for the form:

```json
{
  "documents": [
    {
      "id": "unique_doc_id",
      "name": "Document Name",
      "description": "Document description",
      "required": true,
      "acceptedTypes": ["pdf", "jpg", "png"],
      "maxSize": 5
    }
  ]
}
```

## Usage Examples

### Frontend Integration

#### Fetching Form Configuration
```javascript
// Get active forms of a specific type
const response = await fetch('/api/form-configurations/type/financial_assessment', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const { data: forms } = await response.json();
```

#### Creating a New Configuration
```javascript
const newConfig = {
  name: "Client Onboarding Form",
  form_type: "onboarding",
  sections: [
    {
      id: "basic_info",
      title: "Basic Information",
      order: 1,
      fields: [
        {
          id: "email",
          name: "email",
          label: "Email Address",
          type: "email",
          required: true
        }
      ]
    }
  ],
  consent_form: {
    enabled: true,
    title: "Privacy Consent",
    content: "I agree to data processing...",
    required: true
  }
};

const response = await fetch('/api/form-configurations', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(newConfig)
});
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Descriptive error message",
  "error": "Technical error details (in development mode)"
}
```

Common HTTP status codes:
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **401**: Unauthorized
- **404**: Not Found
- **500**: Internal Server Error

## Security

- All endpoints require JWT authentication
- Users can only modify configurations they created (unless admin)
- Input validation on all fields
- SQL injection protection through parameterized queries
- XSS protection through input sanitization

## Performance Considerations

- Indexes on frequently queried fields (config_id, form_type, is_active)
- JSONB for efficient storage and querying of configuration data
- Usage statistics tracking for optimization
- Pagination support for large datasets

## Migration and Deployment

The form configurations table is automatically created when running the migration script. Sample configurations are included for testing purposes.

For production deployment:
1. Run database migrations
2. Create initial admin configurations
3. Set up proper user permissions
4. Configure monitoring for usage statistics

## Support

For technical support or feature requests related to the Form Configuration Tool API, please refer to the main API documentation or contact the development team. 