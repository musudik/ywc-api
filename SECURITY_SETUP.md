# Security Setup Guide

## Environment Variables

⚠️ **IMPORTANT**: This application requires environment variables to be set and **does not use fallback values** for security reasons.

### Required Environment Variables

The following environment variables **MUST** be set before starting the application:

```bash
DB_HOST=your_database_host
DB_NAME=your_database_name  
DB_USER=your_database_user
DB_PASSWORD=your_database_password
```

### Optional Environment Variables

```bash
DB_PORT=5432                    # Defaults to 5432 if not set
PORT=3000                       # Application port (defaults to 3000)
NODE_ENV=development           # Environment mode
JWT_SECRET=your_jwt_secret     # Required for JWT authentication
JWT_EXPIRES_IN=24h            # JWT token expiration
API_VERSION=v1                # API version
```

### Setting Environment Variables

#### Option 1: Create a .env file (Recommended for Development)

1. Copy `env.example` to `.env`:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` with your actual values:
   ```bash
   # Database Configuration
   DB_HOST=your_actual_host
   DB_NAME=your_actual_database
   DB_USER=your_actual_username
   DB_PASSWORD=your_actual_password
   ```

#### Option 2: Set Environment Variables Directly

**Windows PowerShell:**
```powershell
$env:DB_HOST="your_host"
$env:DB_NAME="your_database"
$env:DB_USER="your_user"
$env:DB_PASSWORD="your_password"
npm start
```

**Windows Command Prompt:**
```cmd
set DB_HOST=your_host
set DB_NAME=your_database
set DB_USER=your_user
set DB_PASSWORD=your_password
npm start
```

**Linux/Mac:**
```bash
export DB_HOST=your_host
export DB_NAME=your_database  
export DB_USER=your_user
export DB_PASSWORD=your_password
npm start
```

#### Option 3: Inline Environment Variables

```bash
DB_HOST=your_host DB_NAME=your_db DB_USER=your_user DB_PASSWORD=your_pass npm start
```

### Security Features

✅ **No Hardcoded Credentials**: All database credentials must be provided via environment variables  
✅ **Required Variable Validation**: Application will not start if required variables are missing  
✅ **Clear Error Messages**: Informative error messages guide you to set missing variables  
✅ **Example Configuration**: `env.example` provides a template for all needed variables  

### Error Handling

If required environment variables are missing, you'll see:

```
❌ Missing required environment variables: DB_HOST, DB_NAME, DB_USER, DB_PASSWORD
💡 Please set these environment variables before starting the application
```

### Production Deployment

For production deployments:

1. **Never commit .env files** to version control
2. Use your hosting platform's environment variable settings:
   - **Heroku**: `heroku config:set DB_HOST=your_host`
   - **Vercel**: Project Settings → Environment Variables  
   - **Railway**: Variables tab in your project
   - **Docker**: Use `--env-file` or `-e` flags
   - **AWS/Azure**: Use their respective secret management services

3. Use strong, unique passwords
4. Rotate credentials regularly
5. Use separate credentials for different environments (dev/staging/prod)

### Database Providers

This setup works with any PostgreSQL provider:

- **Local PostgreSQL**
- **Neon** (Cloud PostgreSQL)
- **Supabase**
- **AWS RDS**
- **Google Cloud SQL**
- **Azure Database for PostgreSQL**
- **Heroku Postgres**

### Troubleshooting

**Issue**: Application won't start  
**Solution**: Check that all required environment variables are set

**Issue**: Database connection fails  
**Solution**: Verify your database credentials and that the database server is accessible

**Issue**: "Missing environment variables" error  
**Solution**: Set the specific variables mentioned in the error message

### Seeding Users

The user seeding script also requires the same environment variables:

```bash
# Set your environment variables first, then run:
node seed-users.js
```

Or inline:
```bash
DB_HOST=your_host DB_NAME=your_db DB_USER=your_user DB_PASSWORD=your_pass node seed-users.js
``` 