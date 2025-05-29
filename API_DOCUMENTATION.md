# YWC Financial Forms API - Complete Documentation

## Overview

The YWC Financial Forms API provides a comprehensive system for managing personal financial data with JWT authentication and role-based access control. This API supports the complete financial profile management workflow from personal details to complex financial summaries.

## Authentication

All endpoints (except login/register) require JWT authentication via Bearer token:
```
Authorization: Bearer <your-jwt-token>
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "coach@ywc.com",
  "password": "coach123"
}
```

## API Endpoints

### 1. Personal Details
Base URL: `/api/personal-details`

#### Create Personal Details
```http
POST /api/personal-details
Authorization: Bearer <token>
Content-Type: application/json

{
  "coach_id": "uuid",
  "applicant_type": "PrimaryApplicant",
  "salutation": "Mr.",
  "first_name": "John",
  "last_name": "Doe",
  "street": "Main Street",
  "house_number": "123",
  "postal_code": "12345",
  "city": "Berlin",
  "email": "john.doe@example.com",
  "phone": "+49123456789",
  "whatsapp": "+49123456789",
  "marital_status": "Single",
  "birth_date": "1990-01-01",
  "birth_place": "Berlin",
  "nationality": "German",
  "residence_permit": "EU Citizen",
  "eu_citizen": true,
  "tax_id": "12345678901",
  "iban": "DE89370400440532013000",
  "housing": "Rent"
}
```

**Marital Status Values** (accepts both capitalized and lowercase):
- `"Single"` or `"single"`
- `"Married"` or `"married"`
- `"Divorced"` or `"divorced"`
- `"Widowed"` or `"widowed"`

### 2. Employment Details
Base URL: `/api/employment`

#### Create Employment Details
```http
POST /api/employment
Authorization: Bearer <token>
Content-Type: application/json

{
  "personal_id": "uuid",
  "employment_type": "PrimaryEmployment",
  "occupation": "Software Engineer",
  "contract_type": "Permanent",
  "contract_duration": "Unlimited",
  "employer_name": "Tech Company GmbH",
  "employed_since": "2020-01-01"
}
```

#### Get Employment by Personal ID
```http
GET /api/employment/personal/{personal_id}
Authorization: Bearer <token>
```

### 3. Income Details
Base URL: `/api/income`

#### Create Income Details
```http
POST /api/income
Authorization: Bearer <token>
Content-Type: application/json

{
  "personal_id": "uuid",
  "gross_income": 5000.00,
  "net_income": 3500.00,
  "tax_class": "1",
  "tax_id": "12345678901",
  "number_of_salaries": 12,
  "child_benefit": 200.00,
  "other_income": 500.00,
  "income_trade_business": 0.00,
  "income_self_employed_work": 1000.00,
  "income_side_job": 300.00
}
```

#### Get Income by Personal ID
```http
GET /api/income/personal/{personal_id}
Authorization: Bearer <token>
```

#### Get All Income Details
```http
GET /api/income
Authorization: Bearer <token>
```

#### Update Income Details
```http
PUT /api/income/{income_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "gross_income": 5500.00,
  "net_income": 3800.00
}
```

#### Delete Income Details
```http
DELETE /api/income/{income_id}
Authorization: Bearer <token>
```

### 4. Expenses Details
Base URL: `/api/expenses`

#### Create Expenses Details
```http
POST /api/expenses
Authorization: Bearer <token>
Content-Type: application/json

{
  "personal_id": "uuid",
  "cold_rent": 800.00,
  "electricity": 80.00,
  "living_expenses": 400.00,
  "gas": 60.00,
  "telecommunication": 50.00,
  "account_maintenance_fee": 15.00,
  "alimony": 0.00,
  "subscriptions": 30.00,
  "other_expenses": 200.00
}
```

#### Get Expenses by Personal ID
```http
GET /api/expenses/personal/{personal_id}
Authorization: Bearer <token>
```

#### Get All Expenses Details
```http
GET /api/expenses
Authorization: Bearer <token>
```

#### Update Expenses Details
```http
PUT /api/expenses/{expenses_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "cold_rent": 850.00,
  "electricity": 85.00
}
```

#### Delete Expenses Details
```http
DELETE /api/expenses/{expenses_id}
Authorization: Bearer <token>
```

### 5. Assets
Base URL: `/api/assets`

#### Create Asset
```http
POST /api/assets
Authorization: Bearer <token>
Content-Type: application/json

{
  "personal_id": "uuid",
  "real_estate": 250000.00,
  "securities": 50000.00,
  "bank_deposits": 25000.00,
  "building_savings": 15000.00,
  "insurance_values": 10000.00,
  "other_assets": 5000.00
}
```

#### Get Assets by Personal ID
```http
GET /api/assets/personal/{personal_id}
Authorization: Bearer <token>
```

#### Get All Assets
```http
GET /api/assets
Authorization: Bearer <token>
```

#### Update Asset
```http
PUT /api/assets/{asset_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "real_estate": 260000.00,
  "securities": 55000.00
}
```

#### Delete Asset
```http
DELETE /api/assets/{asset_id}
Authorization: Bearer <token>
```

### 6. Liabilities
Base URL: `/api/liabilities`

#### Create Liability
```http
POST /api/liabilities
Authorization: Bearer <token>
Content-Type: application/json

{
  "personal_id": "uuid",
  "loan_type": "HomeLoan",
  "loan_bank": "Deutsche Bank",
  "loan_amount": 200000.00,
  "loan_monthly_rate": 1200.00,
  "loan_interest": 2.5
}
```

#### Loan Types
- `PersonalLoan`
- `HomeLoan`
- `CarLoan`
- `BusinessLoan`
- `EducationLoan`
- `OtherLoan`

#### Get Liabilities by Personal ID
```http
GET /api/liabilities/personal/{personal_id}
Authorization: Bearer <token>
```

#### Get All Liabilities
```http
GET /api/liabilities
Authorization: Bearer <token>
```

#### Update Liability
```http
PUT /api/liabilities/{liability_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "loan_amount": 190000.00,
  "loan_monthly_rate": 1150.00
}
```

#### Delete Liability
```http
DELETE /api/liabilities/{liability_id}
Authorization: Bearer <token>
```

### 7. Person (Complete Profile)
Base URL: `/api/person`

#### Get Complete Person Profile
```http
GET /api/person/{personal_id}/complete
Authorization: Bearer <token>
```

**Response includes:**
- Personal details
- All employment records
- All income records
- All expense records
- All assets
- All liabilities
- Family details (if any)
- Children (if any)

#### Get Person Summary
```http
GET /api/person/{personal_id}/summary
Authorization: Bearer <token>
```

**Response includes:**
- Basic personal info
- Coach information
- Count of records for each category

#### Get Financial Summary
```http
GET /api/person/{personal_id}/financial-summary
Authorization: Bearer <token>
```

**Response includes:**
- `total_gross_income`: Sum of all gross income
- `total_net_income`: Sum of all net income
- `total_additional_income`: Sum of benefits and side income
- `total_expenses`: Sum of all expenses
- `total_assets`: Sum of all assets
- `total_loan_amount`: Sum of all loan amounts
- `total_monthly_payments`: Sum of all monthly loan payments
- `net_monthly_cash_flow`: Calculated monthly cash flow
- `net_worth`: Calculated net worth (assets - liabilities)

#### Get Persons by Coach ID
```http
GET /api/person/coach/{coach_id}
Authorization: Bearer <token>
```

Returns complete profiles for all persons managed by the specified coach.

## Complete Workflow Example

### 1. Login and Get Token
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "coach@ywc.com", "password": "coach123"}'
```

### 2. Create Personal Details
```bash
curl -X POST http://localhost:3000/api/personal-details \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "coach_id": "<coach_id>",
    "applicant_type": "PrimaryApplicant",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    ...
  }'
```

### 3. Create Financial Data
Use the `personal_id` from step 2 to create:
- Employment details
- Income details
- Expenses details
- Assets
- Liabilities

### 4. Get Complete Profile
```bash
curl -X GET http://localhost:3000/api/person/<personal_id>/complete \
  -H "Authorization: Bearer <token>"
```

### 5. Get Financial Summary
```bash
curl -X GET http://localhost:3000/api/person/<personal_id>/financial-summary \
  -H "Authorization: Bearer <token>"
```

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `404`: Not Found
- `500`: Internal Server Error

## Data Validation

- All UUIDs are validated
- Required fields are enforced
- Numeric fields accept decimal values
- Date fields expect ISO 8601 format (YYYY-MM-DD)
- Email fields are validated for proper format

## Testing

### Using Postman
Import the collection: `src/postman/YWC-Complete-API.postman_collection.json`

### Using Node.js Test Script
```bash
node test_complete_api.js
```

### Manual Testing Workflow
1. Run the "Complete Workflow Test" folder in Postman
2. This will create a complete person profile with all financial data
3. Verify the aggregated data in the final steps

## Database Schema

The API uses PostgreSQL with the following key relationships:
- `personal_details` → `employment_details` (1:N)
- `personal_details` → `income_details` (1:N)
- `personal_details` → `expenses_details` (1:N)
- `personal_details` → `assets` (1:N)
- `personal_details` → `liabilities` (1:N)
- `users` → `personal_details` (1:N via coach_id)

All foreign key relationships use CASCADE DELETE for data integrity.

## Performance Considerations

- The Person service uses parallel queries for optimal performance
- Database indexes are in place for all foreign keys
- Financial summary calculations are performed at the database level
- Pagination is available for large datasets (use `?page=1&limit=10`)

## Security Features

- JWT authentication with 24-hour expiration
- Role-based access control (ADMIN, COACH, CLIENT, GUEST)
- Input validation and sanitization
- SQL injection protection via parameterized queries
- CORS enabled for cross-origin requests 