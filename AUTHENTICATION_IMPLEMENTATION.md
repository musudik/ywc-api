# YWC Financial Forms API - Authentication Implementation

## Overview

This document outlines the comprehensive JWT-based authentication and authorization system implemented for the YWC Financial Forms API. The system provides role-based access control (RBAC) that allows admins and coaches to manage client data while ensuring data security and proper access permissions.

## 🔐 Authentication Architecture

### JWT Token-Based Authentication
- **Token Type**: JSON Web Tokens (JWT)
- **Expiration**: 24 hours (configurable via `JWT_EXPIRES_IN`)
- **Algorithm**: HS256 (default)
- **Storage**: Client-side (Postman variables, frontend localStorage, etc.)

### Role-Based Access Control (RBAC)
- **ADMIN**: Full access to all resources and operations
- **COACH**: Can manage their own clients and fill forms on their behalf
- **CLIENT**: Can only access their own data
- **GUEST**: Limited read-only access (if any)

## 📂 File Structure

```
src/
├── services/
│   └── authService.ts          # JWT token management and user operations
├── middleware/
│   └── authMiddleware.ts       # Authentication and authorization middleware
├── controllers/
│   └── authController.ts       # Authentication endpoints controller
├── routes/
│   ├── authRoutes.ts          # Authentication routes
│   ├── personalDetailsRoutes.ts # Updated with auth middleware
│   └── employmentRoutes.ts     # Updated with auth middleware
└── postman/
    ├── YWC-Financial-Forms-API.postman_collection.json # Updated with auth
    └── README.md               # Updated documentation
```

## 🛡️ Security Features

### Authentication Middleware
- **Token Validation**: Verifies JWT token signature and expiration
- **User Context**: Adds user information to request object
- **Error Handling**: Proper 401/403 responses for auth failures

### Authorization Middleware
- **Role-Based Access**: Different middleware for different permission levels
- **Resource Ownership**: Checks if users can access specific resources
- **Coach-Client Relationship**: Validates coach can manage specific client data

### Password Security
- **Hashing**: bcrypt with 10 salt rounds
- **Validation**: Minimum 6 characters required
- **No Plain Text**: Passwords never stored or returned in plain text

## 🚀 Implementation Details

### Core Services

#### AuthService (`src/services/authService.ts`)
```typescript
class AuthService {
  // User authentication
  async login(credentials: LoginRequest): Promise<AuthResponse>
  async register(userData: RegisterRequest): Promise<AuthResponse>
  
  // Token management
  generateToken(payload: TokenPayload): string
  verifyToken(token: string): TokenPayload
  async refreshToken(token: string): Promise<AuthResponse>
  
  // Password management
  async hashPassword(password: string): Promise<string>
  async comparePassword(password: string, hashedPassword: string): Promise<boolean>
  
  // Authorization helpers
  async canAccessPersonalDetails(userId: string, role: UserRole, personalId: string): Promise<boolean>
  async canManagePersonalDetails(userId: string, role: UserRole, coachId?: string): Promise<boolean>
  async getCoachClients(coachId: string): Promise<any[]>
}
```

#### Authentication Middleware (`src/middleware/authMiddleware.ts`)
```typescript
// Basic authentication - verifies JWT token
export const authenticate = (req, res, next) => { ... }

// Role-based authorization
export const authorize = (allowedRoles: UserRole[]) => { ... }

// Convenience middleware
export const adminOnly = authorize([UserRole.ADMIN])
export const adminOrCoach = authorize([UserRole.ADMIN, UserRole.COACH])
export const authenticatedUser = authorize([UserRole.ADMIN, UserRole.COACH, UserRole.CLIENT])

// Resource-specific authorization
export const checkPersonalDetailsAccess = async (req, res, next) => { ... }
export const checkPersonalDetailsManagement = async (req, res, next) => { ... }
```

### API Endpoints

#### Authentication Routes (`/api/auth`)
```typescript
POST   /api/auth/login          # User login
POST   /api/auth/register       # User registration
POST   /api/auth/refresh        # Token refresh
GET    /api/auth/profile        # Get user profile
GET    /api/auth/me/clients     # Get coach's clients (coaches/admins only)
POST   /api/auth/logout         # Logout user
```

#### Protected Routes
All personal details and employment routes now require authentication:

```typescript
// Personal Details (with role-based access)
POST   /api/personal-details    # Create (admin/coach only)
GET    /api/personal-details    # List all (admin/coach only)
GET    /api/personal-details/:id # Get by ID (ownership-based)
PUT    /api/personal-details/:id # Update (ownership-based)
DELETE /api/personal-details/:id # Delete (admin/coach only)

// Employment Details (with role-based access)
POST   /api/employment          # Create (admin/coach only)
GET    /api/employment/:id      # Get by ID (authenticated users)
PUT    /api/employment/:id      # Update (admin/coach only)
DELETE /api/employment/:id      # Delete (admin/coach only)
```

## 🔑 Access Control Matrix

| Operation | Admin | Coach | Client | Guest |
|-----------|-------|-------|--------|-------|
| **Authentication** |
| Login/Register | ✅ | ✅ | ✅ | ✅ |
| Get Profile | ✅ | ✅ | ✅ | ❌ |
| **Personal Details** |
| Create | ✅ | ✅ (own clients) | ❌ | ❌ |
| View All | ✅ | ✅ (own clients) | ❌ | ❌ |
| View Specific | ✅ | ✅ (own clients) | ✅ (own data) | ❌ |
| Update | ✅ | ✅ (own clients) | ✅ (own data) | ❌ |
| Delete | ✅ | ✅ (own clients) | ❌ | ❌ |
| **Employment Details** |
| Create | ✅ | ✅ (for clients) | ❌ | ❌ |
| View | ✅ | ✅ (client data) | ✅ (own data) | ❌ |
| Update | ✅ | ✅ (client data) | ❌ | ❌ |
| Delete | ✅ | ✅ (client data) | ❌ | ❌ |

## 🧪 Testing Setup

### Postman Collection Updates
- **Authentication Folder**: Complete auth endpoints
- **Auto Token Management**: Login automatically saves JWT token
- **Bearer Token Auth**: All protected endpoints use saved token
- **Dynamic Variables**: User ID and role auto-populated

### Test Credentials (from seeded data)
```
Admin:  admin@ywc.com  / admin123
Coach:  coach@ywc.com  / coach123
Client: client@ywc.com / client123
```

### Testing Workflow
1. **Login**: Use coach credentials to get JWT token
2. **Create Data**: Create personal details as coach
3. **Test Access**: Verify role-based permissions
4. **Test Forms**: Coach creates employment details for client
5. **Test Restrictions**: Verify unauthorized access is blocked

## 🌐 Usage Examples

### Login and Get Token
```bash
POST /api/auth/login
{
  "email": "coach@ywc.com",
  "password": "coach123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": "uuid", "email": "coach@ywc.com", "role": "COACH" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

### Create Personal Details (Coach for Client)
```bash
POST /api/personal-details
Authorization: Bearer {jwt_token}
{
  "coach_id": "{coach_user_id}",
  "applicant_type": "PrimaryApplicant",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  ...
}
```

### Access Control Example
```bash
# ✅ Coach accessing their own client's data
GET /api/personal-details/{client_personal_id}
Authorization: Bearer {coach_token}

# ❌ Coach trying to access another coach's client
GET /api/personal-details/{other_coach_client_id}
Authorization: Bearer {coach_token}
# Returns 403 Forbidden
```

## 🔧 Configuration

### Environment Variables
```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-minimum-32-characters
JWT_EXPIRES_IN=24h

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ywc
DB_USER=ywc
DB_PASSWORD=yourwealthcoach
```

### Security Considerations
- **JWT Secret**: Use a strong, unique secret in production
- **Token Expiration**: Configure based on security requirements
- **Password Policy**: Consider implementing stronger password requirements
- **Rate Limiting**: Consider adding rate limiting for auth endpoints
- **HTTPS**: Always use HTTPS in production

## 🚨 Error Handling

### Authentication Errors
```json
// 401 Unauthorized - Missing/Invalid Token
{
  "success": false,
  "message": "Access denied. No token provided or invalid format.",
  "error": "Authentication required"
}

// 401 Unauthorized - Token Expired
{
  "success": false,
  "message": "Invalid or expired token",
  "error": "Authentication failed"
}
```

### Authorization Errors
```json
// 403 Forbidden - Insufficient Permissions
{
  "success": false,
  "message": "Access denied. Insufficient permissions.",
  "error": "Required roles: ADMIN, COACH"
}

// 403 Forbidden - Resource Access Denied
{
  "success": false,
  "message": "Access denied. You do not have permission to access this resource.",
  "error": "Insufficient permissions for this personal details record"
}
```

## 📋 Key Features Implemented

### ✅ Core Authentication
- [x] JWT token generation and validation
- [x] User login and registration
- [x] Password hashing with bcrypt
- [x] Token refresh functionality
- [x] User profile management

### ✅ Role-Based Access Control
- [x] Four-tier role system (Admin, Coach, Client, Guest)
- [x] Route-level authorization middleware
- [x] Resource-level access control
- [x] Coach-client relationship validation

### ✅ API Protection
- [x] All CRUD operations require authentication
- [x] Personal details protected by ownership
- [x] Employment details linked to personal details access
- [x] Admin override for all operations

### ✅ Form Management by Proxy
- [x] Coaches can create personal details for clients
- [x] Coaches can manage employment details for their clients
- [x] Proper attribution (coach_id field tracks who created what)
- [x] Access validation based on coach-client relationships

### ✅ Testing & Documentation
- [x] Complete Postman collection with auth
- [x] Automated token management in Postman
- [x] Comprehensive API documentation
- [x] Newman test runner integration

## 🔄 Migration Impact

### Database Schema
- **No changes required**: Existing FormModels schema supports authentication
- **Users table**: Already includes role and authentication fields
- **Personal details**: `coach_id` field links to users table

### Existing Data
- **Backwards compatible**: Existing data remains accessible
- **Role assignment**: Existing users can be assigned appropriate roles
- **Coach relationships**: Existing personal details maintain coach associations

## 🚀 Next Steps

### Potential Enhancements
1. **Session Management**: Implement token blacklisting for logout
2. **Password Reset**: Add forgot password functionality
3. **2FA**: Implement two-factor authentication
4. **Audit Logs**: Track all data access and modifications
5. **Rate Limiting**: Add request rate limiting for security
6. **Email Verification**: Verify email addresses during registration

### Production Deployment
1. **Environment Variables**: Set strong JWT secret
2. **HTTPS**: Enable SSL/TLS
3. **Database Security**: Secure PostgreSQL instance
4. **Monitoring**: Add authentication metrics and alerts
5. **Backup Strategy**: Ensure user data is properly backed up

## 📞 Support

For authentication-related issues:
1. Check JWT token format and expiration
2. Verify user role permissions
3. Confirm coach-client relationships in database
4. Review middleware execution order
5. Check environment variable configuration

The authentication system is now fully operational and ready for production use with proper security measures in place. 