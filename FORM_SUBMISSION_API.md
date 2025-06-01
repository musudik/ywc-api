# Form Submission API Documentation

## Overview

The Form Submission API provides complete CRUD functionality for managing form submissions based on form configurations. It allows users to create, update, submit, and manage their form data with proper authentication and authorization.

## Base URL
`http://localhost:3000/api/form-submissions`

## Authentication
All endpoints require JWT authentication via the `Authorization: Bearer <token>` header.

## Data Models

### FormSubmissionData
```typescript
interface FormSubmissionData {
  id: string;
  form_config_id: string;
  user_id: string;
  form_data: Record<string, any>;
  status: FormSubmissionStatus;
  submitted_at?: Date;
  reviewed_at?: Date;
  reviewed_by?: string;
  review_notes?: string;
  created_at: Date;
  updated_at: Date;
}
```

### FormSubmissionList
```typescript
interface FormSubmissionList {
  id: string;
  form_config_id: string;
  config_name: string;
  user_id: string;
  status: string;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}
```

### FormSubmissionStatus
```typescript
type FormSubmissionStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'under_review';
```

## API Endpoints

### 1. Create Form Submission
**POST** `/api/form-submissions`

Creates a new form submission for the authenticated user.

**Request Body:**
```json
{
  "form_config_id": "config_1748634250513_ux584sc21",
  "form_data": {
    "field1": "value1",
    "field2": "value2"
  },
  "status": "draft"
}
```

**Note:** `form_config_id` can be either:
- A UUID (e.g., `"123e4567-e89b-12d3-a456-426614174000"`)
- A config_id string (e.g., `"config_1748634250513_ux584sc21"`)

The API will automatically resolve config_id strings to their corresponding UUIDs.

**Response:**
```json
{
  "success": true,
  "message": "Form submission created successfully",
  "data": {
    "id": "uuid",
    "form_config_id": "uuid",
    "user_id": "uuid",
    "form_data": { ... },
    "status": "draft",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Get Form Submission by ID
**GET** `/api/form-submissions/:id`

Retrieves a specific form submission. Users can only access their own submissions unless they are ADMIN or COACH.

**Response:**
```json
{
  "success": true,
  "message": "Form submission retrieved successfully",
  "data": {
    "id": "uuid",
    "form_config_id": "uuid",
    "user_id": "uuid",
    "form_data": { ... },
    "status": "draft",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Update Form Submission
**PUT** `/api/form-submissions/:id`

Updates an existing form submission. Users can only update their own submissions unless they are ADMIN or COACH.

**Request Body:**
```json
{
  "form_data": {
    "field1": "updated_value1",
    "field2": "updated_value2"
  },
  "status": "draft",
  "review_notes": "Optional review notes (admin/coach only)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Form submission updated successfully",
  "data": { ... }
}
```

### 4. Get User's Form Submissions
**GET** `/api/form-submissions/user/:userId`

Retrieves all form submissions for a specific user. Regular users can only access their own submissions.

**Response:**
```json
{
  "success": true,
  "message": "Form submissions retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "form_config_id": "uuid",
      "config_name": "Financial Assessment Form",
      "user_id": "uuid",
      "status": "submitted",
      "submitted_at": "2024-01-01T00:00:00.000Z",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 5. Submit Form
**PATCH** `/api/form-submissions/:id/submit`

Changes the status of a form submission from 'draft' to 'submitted' and sets the submitted_at timestamp.

**Response:**
```json
{
  "success": true,
  "message": "Form submitted successfully",
  "data": {
    "id": "uuid",
    "status": "submitted",
    "submitted_at": "2024-01-01T00:00:00.000Z",
    ...
  }
}
```

### 6. Delete Form Submission
**DELETE** `/api/form-submissions/:id`

Deletes a form submission. Users can only delete their own submissions unless they are ADMIN or COACH.

**Response:**
```json
{
  "success": true,
  "message": "Form submission deleted successfully"
}
```

### 7. Get All Form Submissions (Admin/Coach Only)
**GET** `/api/form-submissions`

Retrieves all form submissions with optional filters. Only accessible by ADMIN and COACH roles.

**Query Parameters:**
- `status` - Filter by submission status
- `form_config_id` - Filter by form configuration ID
- `user_id` - Filter by user ID

**Response:**
```json
{
  "success": true,
  "message": "All form submissions retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "form_config_id": "uuid",
      "config_name": "Financial Assessment Form",
      "user_id": "uuid",
      "status": "submitted",
      "submitted_at": "2024-01-01T00:00:00.000Z",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## Authorization Rules

### User Permissions
- **CLIENT**: Can only access, create, update, submit, and delete their own form submissions
- **COACH**: Can access all form submissions, can review and update any submission
- **ADMIN**: Full access to all form submissions and operations

### Status Transitions
- **draft** → **submitted**: Allowed for form owner
- **submitted** → **under_review**: Allowed for COACH/ADMIN
- **under_review** → **approved/rejected**: Allowed for COACH/ADMIN

## Database Schema

The form submissions are stored in the `form_submissions` table:

```sql
CREATE TABLE form_submissions (
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
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Form configuration ID is required",
  "error": "Validation error"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "User authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Admin or Coach role required."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Form submission not found or access denied"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to create form submission",
  "error": "Database connection failed"
}
```

## Usage Examples

### Frontend Integration

#### Creating a Form Submission
```javascript
const formData = {
  form_config_id: "123e4567-e89b-12d3-a456-426614174000",
  form_data: {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    annualIncome: 50000
  },
  status: "draft"
};

const response = await fetch('/api/form-submissions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(formData)
});

const result = await response.json();
```

#### Updating Form Data
```javascript
const updateData = {
  form_data: {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    annualIncome: 55000  // Updated value
  }
};

const response = await fetch(`/api/form-submissions/${submissionId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(updateData)
});
```

#### Submitting a Form
```javascript
const response = await fetch(`/api/form-submissions/${submissionId}/submit`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

#### Getting User's Submissions
```javascript
const response = await fetch(`/api/form-submissions/user/${userId}`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const { data: submissions } = await response.json();
```

## Integration with Form Configurations

Form submissions are tightly integrated with the Form Configuration API:

1. **form_config_id** must reference an existing, active form configuration
2. The **form_data** structure should match the fields defined in the form configuration
3. Form validation can be performed using the configuration's field definitions
4. Document uploads can be managed based on the configuration's document requirements

## Security Features

1. **JWT Authentication**: All endpoints require valid authentication
2. **Role-based Authorization**: Different access levels for CLIENT, COACH, and ADMIN
3. **Ownership Validation**: Users can only access their own data (unless privileged)
4. **Input Validation**: All inputs are validated before processing
5. **SQL Injection Protection**: Uses parameterized queries
6. **Error Handling**: Secure error messages that don't leak sensitive information 