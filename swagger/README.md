# YWC Financial Forms API Documentation

This folder contains comprehensive OpenAPI 3.0 documentation for the YWC Financial Forms API.

## 📁 Documentation Files

- **`ywc-api-swagger.yaml`** - Main OpenAPI 3.0 specification file
- **`endpoints-summary.md`** - Complete endpoints reference with examples
- **`README.md`** - This documentation guide

## 🚀 Quick Start

### Viewing the Documentation

#### Option 1: Swagger Editor (Recommended)
1. Go to [Swagger Editor](https://editor.swagger.io/)
2. Copy the contents of `ywc-api-swagger.yaml`
3. Paste into the editor to view interactive documentation

#### Option 2: Swagger UI
1. Install Swagger UI locally:
   ```bash
   npm install -g swagger-ui-serve
   swagger-ui-serve ywc-api-swagger.yaml
   ```
2. Open http://localhost:3000 in your browser

#### Option 3: VS Code Extension
1. Install the "OpenAPI (Swagger) Editor" extension
2. Open `ywc-api-swagger.yaml` in VS Code
3. Use Ctrl+Shift+P → "OpenAPI: Preview Documentation"

### Testing the API

#### Prerequisites
1. Ensure the YWC API server is running:
   ```bash
   npm start
   ```
2. Server should be available at `http://localhost:3000`

#### Authentication Flow
1. **Login** to get a JWT token:
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@ywc.com","password":"admin123"}'
   ```

2. **Extract the token** from the response:
   ```json
   {
     "success": true,
     "data": {
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       "user": {...}
     }
   }
   ```

3. **Use the token** in subsequent requests:
   ```bash
   curl -X GET http://localhost:3000/api/auth/profile \
     -H "Authorization: Bearer <your-token-here>"
   ```

## 🔐 Test Accounts

The API comes with pre-configured test accounts:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Admin | admin@ywc.com | admin123 | Full system access |
| Coach | coach@ywc.com | coach123 | Can manage assigned clients |
| Client | client@ywc.com | client123 | Can view/edit own data |

## 🏗️ API Architecture

### User-Centric Design
The API follows a user-centric architecture where:

1. **Users** are the primary entity (Admin, Coach, Client, Guest)
2. **All financial data** is linked directly to users via `user_id`
3. **Coach-Client relationships** are managed through the `coach_id` field
4. **Role-based access control** ensures data security

### Data Flow
```
User Registration → User Creation → Coach Assignment (for clients) → Financial Data Creation
```

### Database Relationships
```
users (Primary Table)
├── personal_details (1:1 with user_id)
├── employment_details (1:N with user_id)
├── income_details (1:N with user_id)
├── expenses_details (1:N with user_id)
├── assets (1:N with user_id)
├── liabilities (1:N with user_id)
├── family_details (1:N with user_id)
└── children (1:N with user_id)
```

## 📊 Endpoint Categories

### 1. Authentication (6 endpoints)
- User login/logout
- Registration with role assignment
- Profile management
- Coach-client relationship queries

### 2. Personal Details (6 endpoints)
- CRUD operations for personal information
- Coach assignment and filtering
- Personal ID-based data access

### 3. Employment (5 endpoints)
- Primary and secondary employment tracking
- Employment history management
- Personal ID-based employment data

### 4. Income (6 endpoints)
- Income tracking with German tax system integration
- Personal ID-based income data
- CRUD operations for income records

### 5. Expenses (6 endpoints)
- Comprehensive expense tracking
- Personal ID-based expense data
- Expense categorization and management

### 6. Assets (6 endpoints)
- Portfolio management (real estate, securities, deposits)
- Personal ID-based asset tracking
- Asset valuation and management

### 7. Liabilities (6 endpoints)
- Debt management (Personal, Home, Car, Business, Education loans)
- Personal ID-based liability tracking
- Loan tracking with interest rates

### 8. Person Aggregation (4 endpoints)
- Complete profile compilation
- Financial summaries across all categories
- Comprehensive person data views

## 🛠️ Developer Tools

### Code Generation
The OpenAPI specification can be used to generate client SDKs:

```bash
# Generate JavaScript client
npx @openapitools/openapi-generator-cli generate \
  -i ywc-api-swagger.yaml \
  -g javascript \
  -o ./generated-client

# Generate Python client
npx @openapitools/openapi-generator-cli generate \
  -i ywc-api-swagger.yaml \
  -g python \
  -o ./generated-client-python
```

### Postman Integration
1. Import the OpenAPI spec into Postman
2. Postman will automatically create a collection with all endpoints
3. Set up environment variables for base URL and authentication token

### API Testing Tools
- **Insomnia**: Import the OpenAPI spec directly
- **Thunder Client** (VS Code): Use the spec for endpoint discovery
- **curl**: Use the examples provided in the documentation

## 🔍 Common Use Cases

### 1. Creating a New Client
```bash
# 1. Admin/Coach creates a new client user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newclient@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe",
    "role": "CLIENT",
    "coach_id": "<coach-user-id>"
  }'

# 2. Client logs in and creates personal details
curl -X POST http://localhost:3000/api/personal-details \
  -H "Authorization: Bearer <client-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "applicant_type": "PrimaryApplicant",
    "first_name": "John",
    "last_name": "Doe",
    ...
  }'
```

### 2. Coach Managing Clients
```bash
# Get all assigned clients
curl -X GET http://localhost:3000/api/auth/me/clients \
  -H "Authorization: Bearer <coach-token>"

# Get specific client's complete profile
curl -X GET http://localhost:3000/api/person/{personalId}/complete \
  -H "Authorization: Bearer <coach-token>"
```

### 3. Financial Data Management
```bash
# Add income information
curl -X POST http://localhost:3000/api/income \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "gross_income": 5000,
    "net_income": 3500,
    "tax_class": "1"
  }'

# Get financial summary
curl -X GET http://localhost:3000/api/person/{personalId}/financial-summary \
  -H "Authorization: Bearer <token>"
```

## ❗ Error Handling

### Common HTTP Status Codes
- **400 Bad Request**: Validation errors, malformed JSON
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: Insufficient permissions for the operation
- **404 Not Found**: Resource doesn't exist
- **500 Internal Server Error**: Server-side errors

### Error Response Format
```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": "Detailed technical error information"
}
```

### Troubleshooting Tips

1. **401 Unauthorized**
   - Check if JWT token is included in Authorization header
   - Verify token format: `Bearer <token>`
   - Ensure token hasn't expired (24h default)

2. **403 Forbidden**
   - Verify user role has permission for the endpoint
   - Check if trying to access another user's data without proper authorization

3. **400 Bad Request**
   - Validate request body against the schema
   - Check required fields are present
   - Ensure data types match specification

## 📝 Contributing

When updating the API:

1. **Update the OpenAPI spec** (`ywc-api-swagger.yaml`)
2. **Update the endpoints summary** (`endpoints-summary.md`)
3. **Test all endpoints** with the new changes
4. **Validate the OpenAPI spec** using Swagger Editor
5. **Update this README** if new features are added

## 🔗 Related Resources

- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger Editor](https://editor.swagger.io/)
- [Postman OpenAPI Import](https://learning.postman.com/docs/integrations/available-integrations/working-with-openAPI/)
- [JWT.io](https://jwt.io/) - JWT token decoder for debugging

## 📞 Support

For API support or questions:
- **Development Team**: dev@yourwealthcoach.com
- **Documentation Issues**: Create an issue in the project repository
- **API Testing**: Use the provided test accounts and examples