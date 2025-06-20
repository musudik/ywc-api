# Enhanced Client Management API Documentation

## Overview

The YWC API now provides enhanced client management capabilities with proper role-based access control. This document explains how to use the new client-related endpoints.

## Authentication

All endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Get All Coaches (Admin Only)

**Endpoint:** `GET /api/auth/coaches`

**Access:** Admin only

**Description:** Retrieves a list of all coaches in the system with their client counts.

**Request:**
```bash
curl -X GET "http://localhost:3000/api/auth/coaches" \
  -H "Authorization: Bearer <admin_token>"
```

**Response:**
```json
{
  "success": true,
  "message": "Coaches retrieved successfully",
  "data": {
    "coaches": [
      {
        "id": "22222222-2222-2222-2222-222222222222",
        "first_name": "Default",
        "last_name": "Coach",
        "email": "coach@ywc.com",
        "role": "COACH",
        "is_active": true,
        "created_at": "2025-06-09T20:24:43.973Z",
        "client_count": "5"
      }
    ],
    "total_coaches": 1
  }
}
```

### 2. Get Coach's Own Clients (Coach)

**Endpoint:** `GET /api/auth/me/clients`

**Access:** Coach, Admin

**Description:** Allows a coach to see their own assigned clients.

**Request:**
```bash
curl -X GET "http://localhost:3000/api/auth/me/clients" \
  -H "Authorization: Bearer <coach_token>"
```

**Response:**
```json
{
  "success": true,
  "message": "Clients retrieved successfully",
  "data": {
    "coach": {
      "id": "22222222-2222-2222-2222-222222222222",
      "first_name": "Default",
      "last_name": "Coach",
      "email": "coach@ywc.com",
      "role": "COACH"
    },
    "clients": [
      {
        "user_id": "33333333-3333-3333-3333-333333333333",
        "first_name": "Test",
        "last_name": "Client",
        "email": "client@ywc.com",
        "role": "CLIENT",
        "is_active": true,
        "created_at": "2025-06-09T20:24:43.973Z",
        "personal_id": "9e5fef30-4128-4520-aa43-26e237d6b640",
        "applicant_type": "PrimaryApplicant",
        "phone": "017644417602",
        "city": "München",
        "marital_status": "married"
      }
    ],
    "total_clients": 1
  }
}
```

### 3. Get Specific Coach's Clients (Admin Only)

**Endpoint:** `GET /api/auth/clients/:coachId`

**Access:** Admin only

**Description:** Allows admins to view clients assigned to any specific coach.

**Parameters:**
- `coachId` (path parameter): UUID of the coach

**Request:**
```bash
curl -X GET "http://localhost:3000/api/auth/clients/22222222-2222-2222-2222-222222222222" \
  -H "Authorization: Bearer <admin_token>"
```

**Response:**
```json
{
  "success": true,
  "message": "Clients retrieved successfully",
  "data": {
    "coach": {
      "id": "22222222-2222-2222-2222-222222222222",
      "first_name": "Default",
      "last_name": "Coach",
      "email": "coach@ywc.com",
      "role": "COACH"
    },
    "clients": [
      {
        "user_id": "33333333-3333-3333-3333-333333333333",
        "first_name": "Test",
        "last_name": "Client",
        "email": "client@ywc.com",
        "role": "CLIENT",
        "is_active": true,
        "created_at": "2025-06-09T20:24:43.973Z",
        "personal_id": "9e5fef30-4128-4520-aa43-26e237d6b640",
        "applicant_type": "PrimaryApplicant",
        "phone": "017644417602",
        "city": "München",
        "marital_status": "married"
      }
    ],
    "total_clients": 1
  }
}
```

## Client Data Structure

Each client object in the response contains:

### User Information (Always Present)
- `user_id`: Unique client identifier
- `first_name`: Client's first name
- `last_name`: Client's last name
- `email`: Client's email address
- `role`: Always "CLIENT"
- `is_active`: Whether the client account is active
- `created_at`: When the client account was created

### Personal Details (When Available)
- `personal_id`: Personal details record ID
- `applicant_type`: "PrimaryApplicant" or "SecondaryApplicant"
- `phone`: Client's phone number
- `city`: Client's city
- `marital_status`: Client's marital status

**Note:** Clients who haven't completed their personal details will have `null` values for the personal details fields.

## Access Control

### Role-Based Permissions

| Role | Get All Coaches | Get Own Clients | Get Any Coach's Clients |
|------|----------------|-----------------|------------------------|
| **Admin** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Coach** | ❌ No | ✅ Yes | ❌ No |
| **Client** | ❌ No | ❌ No | ❌ No |

### Security Features

1. **Authentication Required**: All endpoints require valid JWT token
2. **Role Validation**: Each endpoint validates user role
3. **Resource Ownership**: Coaches can only access their own clients
4. **Admin Override**: Admins can access any coach's clients
5. **Coach Validation**: System validates that the specified coach ID exists and has COACH role

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required",
  "error": "No user information available"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Only admins can view other coaches' clients.",
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Coach not found or invalid role",
  "error": "The specified coach ID does not exist or is not a coach"
}
```

## Usage Examples

### JavaScript/Node.js Example

```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Get all coaches (Admin)
async function getAllCoaches(adminToken) {
  try {
    const response = await axios.get(`${BASE_URL}/api/auth/coaches`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    return response.data.data.coaches;
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}

// Get my clients (Coach)
async function getMyClients(coachToken) {
  try {
    const response = await axios.get(`${BASE_URL}/api/auth/me/clients`, {
      headers: { 'Authorization': `Bearer ${coachToken}` }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}

// Get specific coach's clients (Admin)
async function getCoachClients(adminToken, coachId) {
  try {
    const response = await axios.get(`${BASE_URL}/api/auth/clients/${coachId}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}
```

### Python Example

```python
import requests

BASE_URL = 'http://localhost:3000'

def get_all_coaches(admin_token):
    headers = {'Authorization': f'Bearer {admin_token}'}
    response = requests.get(f'{BASE_URL}/api/auth/coaches', headers=headers)
    return response.json()

def get_my_clients(coach_token):
    headers = {'Authorization': f'Bearer {coach_token}'}
    response = requests.get(f'{BASE_URL}/api/auth/me/clients', headers=headers)
    return response.json()

def get_coach_clients(admin_token, coach_id):
    headers = {'Authorization': f'Bearer {admin_token}'}
    response = requests.get(f'{BASE_URL}/api/auth/clients/{coach_id}', headers=headers)
    return response.json()
```

## Workflow Examples

### Admin Workflow: Managing Multiple Coaches

1. **Login as Admin**
   ```bash
   POST /api/auth/login
   ```

2. **Get All Coaches**
   ```bash
   GET /api/auth/coaches
   ```

3. **Select a Coach and View Their Clients**
   ```bash
   GET /api/auth/clients/{coach_id}
   ```

### Coach Workflow: Managing Own Clients

1. **Login as Coach**
   ```bash
   POST /api/auth/login
   ```

2. **View My Clients**
   ```bash
   GET /api/auth/me/clients
   ```

## Key Improvements

1. **Enhanced Data Structure**: Now includes both user and personal details information
2. **Role-Based Access**: Proper security controls based on user roles
3. **Coach Information**: API responses include coach details for context
4. **Flexible Access**: Admins can view any coach's clients, coaches can view their own
5. **Client Count**: Coaches list includes client counts for easy overview
6. **Comprehensive Validation**: Validates coach existence and role before processing

## Migration Notes

If you were previously using the `/api/auth/me/clients` endpoint, the response structure has changed:

**Old Response:**
```json
{
  "success": true,
  "message": "Clients retrieved successfully",
  "data": [/* client array */]
}
```

**New Response:**
```json
{
  "success": true,
  "message": "Clients retrieved successfully",
  "data": {
    "coach": {/* coach info */},
    "clients": [/* client array */],
    "total_clients": 5
  }
}
```

Update your client code to access `response.data.data.clients` instead of `response.data.data`. 