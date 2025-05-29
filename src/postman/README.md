# YWC Financial Forms API - Postman Collection

This directory contains Postman collections and environments for testing the YWC Financial Forms API with JWT authentication.

## Files

- `YWC-Financial-Forms-API.postman_collection.json` - Main API collection with all endpoints and authentication
- `YWC-Development.postman_environment.json` - Development environment configuration
- `YWC-Staging.postman_environment.json` - Staging environment configuration
- `run-tests.js` - Newman command-line test runner

## Quick Start

### 1. Import Collection and Environment

1. Open Postman
2. Click **Import** button
3. Import the collection file: `YWC-Financial-Forms-API.postman_collection.json`
4. Import the environment file: `YWC-Development.postman_environment.json`
5. Select the "YWC Development" environment from the environment dropdown

### 2. Start Your Local Server

Make sure your YWC API server is running:

```bash
npm start
```

The server should be running on `http://localhost:3000`

### 3. Authentication Setup

**IMPORTANT:** Most API endpoints now require authentication. Follow these steps:

1. **First-time setup**: Run the **Authentication > Login** request
   - Use credentials: `coach@ywc.com` / `coach123` (from seeded data)
   - The login response will automatically save the JWT token to `{{auth_token}}`
   - User ID and role will be saved for subsequent requests

2. **All protected endpoints** will automatically use the saved token via Bearer authentication

## Collection Structure

### Authentication
- **Login** - `POST /api/auth/login` - Get JWT token
- **Register** - `POST /api/auth/register` - Create new user account
- **Get Profile** - `GET /api/auth/profile` - Get current user info
- **Get My Clients** - `GET /api/auth/me/clients` - List coach's clients (coaches/admins only)
- **Refresh Token** - `POST /api/auth/refresh` - Refresh JWT token
- **Logout** - `POST /api/auth/logout` - Logout user

### Basic Endpoints
- **Welcome Message** - `GET /` - API welcome and info (no auth required)
- **Health Check** - `GET /health` - Server and database status (no auth required)

### Personal Details (Authentication Required)
- **Create Personal Details** - `POST /api/personal-details` (admins/coaches only)
- **Get All Personal Details** - `GET /api/personal-details` (admins/coaches only)
- **Get Personal Details by ID** - `GET /api/personal-details/{id}` (role-based access)
- **Get Personal Details by Coach ID** - `GET /api/personal-details/coach/{coachId}` (admins/coaches only)
- **Update Personal Details** - `PUT /api/personal-details/{id}` (role-based access)
- **Delete Personal Details** - `DELETE /api/personal-details/{id}` (admins/coaches only)

### Employment Details (Authentication Required)
- **Create Employment Details** - `POST /api/employment` (admins/coaches only)
- **Create Secondary Employment** - `POST /api/employment` (admins/coaches only)
- **Get Employment Details by ID** - `GET /api/employment/{id}` (authenticated users)
- **Get Employment by Personal ID** - `GET /api/employment/personal/{personalId}` (role-based access)
- **Update Employment Details** - `PUT /api/employment/{id}` (admins/coaches only)
- **Delete Employment Details** - `DELETE /api/employment/{id}` (admins/coaches only)

## Variables and Authentication

### Automatic Variables
The collection automatically manages these variables:
- `auth_token` - JWT token (auto-saved from login)
- `user_id` - Current user's ID (auto-saved from login)
- `user_role` - Current user's role (auto-saved from login)
- `personal_uuid` - Auto-populated from personal details creation
- `employment_uuid` - Auto-populated from employment details creation

### Environment Variables
- `base_url` - API base URL (http://localhost:3000 for development)

## Role-Based Access Control (RBAC)

### User Roles
- **ADMIN** - Full access to all resources
- **COACH** - Can manage their own clients and fill forms on their behalf
- **CLIENT** - Can only access their own data
- **GUEST** - Limited access (typically read-only)

### Access Permissions

| Endpoint | Admin | Coach | Client | Guest |
|----------|-------|-------|--------|-------|
| Login/Register | ✅ | ✅ | ✅ | ✅ |
| Get Profile | ✅ | ✅ | ✅ | ❌ |
| Create Personal Details | ✅ | ✅ (own clients) | ❌ | ❌ |
| View Personal Details | ✅ | ✅ (own clients) | ✅ (own data) | ❌ |
| Update Personal Details | ✅ | ✅ (own clients) | ✅ (own data) | ❌ |
| Delete Personal Details | ✅ | ✅ (own clients) | ❌ | ❌ |
| Employment Details | ✅ | ✅ (own clients) | ✅ (own data) | ❌ |

## Testing Workflow

### Recommended Testing Order

1. **Authentication**
   - **Login** - Use `coach@ywc.com` / `coach123`
   - Verify token is saved in collection variables
   - **Get Profile** - Confirm authentication works

2. **Create Personal Details**
   - Use the authenticated coach's ID as `coach_id`
   - The `personal_uuid` will be automatically saved

3. **Test Personal Details Operations**
   - Get All Personal Details (admin/coach only)
   - Get Personal Details by ID (uses saved `personal_uuid`)
   - Update Personal Details
   - Get Personal Details by Coach ID

4. **Create Employment Details**
   - Uses saved `personal_uuid`
   - The `employment_uuid` will be automatically saved

5. **Test Employment Operations**
   - Get Employment Details by ID
   - Get Employment by Personal ID
   - Update Employment Details
   - Create Secondary Employment (optional)

6. **Test Authentication Features**
   - Get My Clients (coaches/admins only)
   - Refresh Token
   - Register new user (test role restrictions)

7. **Cleanup (Optional)**
   - Delete Employment Details
   - Delete Personal Details

## Sample Request Bodies

### Authentication
```json
// Login
{
  "email": "coach@ywc.com",
  "password": "coach123"
}

// Register
{
  "email": "newuser@ywc.com",
  "password": "password123",
  "first_name": "New",
  "last_name": "User",
  "role": "CLIENT"
}
```

### Personal Details Creation (Authenticated)
```json
{
  "coach_id": "{{user_id}}",
  "applicant_type": "PrimaryApplicant",
  "salutation": "Mr",
  "first_name": "John",
  "last_name": "Doe",
  "street": "Hauptstraße",
  "house_number": "123",
  "postal_code": "10115",
  "city": "Berlin",
  "email": "john.doe@example.com",
  "phone": "+49 30 12345678",
  "whatsapp": "+49 30 12345678",
  "marital_status": "married",
  "birth_date": "1985-06-15",
  "birth_place": "Hamburg",
  "nationality": "German",
  "residence_permit": "German Passport",
  "eu_citizen": true,
  "tax_id": "12345678901",
  "iban": "DE89370400440532013000",
  "housing": "owner"
}
```

### Employment Details Creation (Authenticated)
```json
{
  "personal_id": "{{personal_uuid}}",
  "employment_type": "PrimaryEmployment",
  "occupation": "Software Engineer",
  "contract_type": "Permanent",
  "contract_duration": "Unlimited",
  "employer_name": "Tech Solutions GmbH",
  "employed_since": "2020-03-01"
}
```

## Authentication Headers

All protected endpoints automatically include:
```
Authorization: Bearer {{auth_token}}
```

The token is automatically managed by the collection scripts.

## Environment Setup

### Development Environment
- Base URL: `http://localhost:3000`
- Used for local development and testing
- Default login: `coach@ywc.com` / `coach123`

### Staging Environment
- Base URL: `https://staging-api.ywc.com` (placeholder)
- Used for staging server testing
- May require different authentication credentials

## Validation Rules

### Authentication Validation
- Email must be valid format
- Password minimum 6 characters
- First name and last name required (1-100 characters)
- Role must be one of: ADMIN, COACH, CLIENT, GUEST

### Personal Details Validation
- `coach_id` - Must be a valid UUID
- `applicant_type` - Must be "PrimaryApplicant" or "SecondaryApplicant"
- `first_name`, `last_name` - Required, 1-100 characters
- `email` - Must be a valid email address
- `birth_date` - Must be ISO 8601 date format
- `eu_citizen` - Must be boolean

### Employment Details Validation
- `personal_id` - Must be a valid UUID
- `employment_type` - Must be "PrimaryEmployment" or "SecondaryEmployment"
- `occupation` - Required, max 200 characters
- `contract_type` - Required, max 100 characters
- `employer_name` - Required, max 200 characters
- `employed_since` - Must be ISO 8601 date format

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* response data */ }
}
```

### Authentication Success Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@ywc.com",
      "first_name": "User",
      "last_name": "Name",
      "role": "COACH",
      "is_active": true
    },
    "token": "jwt.token.here",
    "expiresIn": "24h"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Operation failed",
  "error": "Detailed error message"
}
```

### Authentication Error Response
```json
{
  "success": false,
  "message": "Access denied. No token provided or invalid format.",
  "error": "Authentication required"
}
```

### Authorization Error Response
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions.",
  "error": "Required roles: ADMIN, COACH"
}
```

## Getting Test Credentials

To get valid credentials for testing:

### From Seeded Data
1. **Admin**: `admin@ywc.com` / `admin123`
2. **Coach**: `coach@ywc.com` / `coach123`
3. **Client**: `client@ywc.com` / `client123`

### Manual Database Query
```sql
SELECT id, email, role FROM users WHERE is_active = true;
```

## Troubleshooting

### Authentication Issues

1. **401 Unauthorized**
   - Token missing or expired
   - Run the Login request to get a new token
   - Check that `{{auth_token}}` variable is set

2. **403 Forbidden**
   - User doesn't have required permissions
   - Check user role vs endpoint requirements
   - Some endpoints require admin/coach roles

3. **Token Expired**
   - JWT tokens expire after 24 hours
   - Use the Refresh Token endpoint
   - Or login again to get a new token

### Common Issues

1. **404 Not Found**
   - Ensure the server is running on the correct port
   - Check the base_url in your environment

2. **Validation Errors**
   - Check that all required fields are provided
   - Ensure field formats match the validation rules
   - Verify UUID formats are correct

3. **Database Connection Errors**
   - Ensure PostgreSQL is running
   - Check database credentials in environment variables
   - Run the Health Check endpoint to verify

4. **Role-Based Access Errors**
   - Ensure you're using the correct user role for the endpoint
   - Admins and coaches can create/manage personal details
   - Clients can only view their own data

## Automated Testing

Run automated tests using Newman:

```bash
# Install Newman globally
npm install -g newman

# Run tests
npm run test:postman

# Or directly with Newman
newman run src/postman/YWC-Financial-Forms-API.postman_collection.json \
  -e src/postman/YWC-Development.postman_environment.json
```

## Support

For issues or questions about the API collection:
1. Check authentication token is valid and not expired
2. Verify user role permissions for the endpoint
3. Check the console logs in Postman for detailed error information
4. Ensure your local server is running and accessible
5. Check the API server logs for detailed error information 