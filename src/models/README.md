# YWC Financial Forms Database Setup

This directory contains the database schema and setup files for the YWC Financial Forms API.

## Files Overview

- `master.sql` - Complete database schema with seed data for fresh environment setup
- `database.sql` - Legacy schema file (superseded by master.sql)
- `README.md` - This setup guide

## Quick Setup for New Environment

### Prerequisites

1. **PostgreSQL 12+** installed and running
2. **Database created** for the YWC application
3. **Database user** with full permissions
4. **psql command-line tool** available

### Environment Variables

Before running the setup, ensure you have these environment variables configured:

```bash
# Database connection
DATABASE_URL="postgresql://username:password@localhost:5432/ywc_financial_forms"

# Or individual components
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ywc_financial_forms
DB_USER=your_username
DB_PASSWORD=your_password

# Application settings
NODE_ENV=development
PORT=3000
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h
```

### Setup Steps

#### 1. Create Database

```bash
# Connect to PostgreSQL as admin
psql -U postgres

# Create database and user
CREATE DATABASE ywc_financial_forms;
CREATE USER ywc_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ywc_financial_forms TO ywc_user;

# Exit psql
\q
```

#### 2. Run Master Schema

Execute the master.sql file to create all tables, indexes, triggers, and seed data:

```bash
# Method 1: Using psql command line
psql -U ywc_user -d ywc_financial_forms -f src/models/master.sql

# Method 2: Using environment variable
psql $DATABASE_URL -f src/models/master.sql

# Method 3: Interactive psql session
psql -U ywc_user -d ywc_financial_forms
\i src/models/master.sql
```

#### 3. Verify Setup

After running the schema, verify the setup:

```sql
-- Check tables were created
\dt

-- Verify seed data
SELECT email, role FROM users;

-- Check sample personal details
SELECT first_name, last_name, email FROM personal_details;

-- View complete profile example
SELECT * FROM person_complete_profile LIMIT 1;
```

#### 4. Test API Connection

Start your API server and test the connection:

```bash
# Install dependencies
npm install

# Start the server
npm start

# Test the connection
curl http://localhost:3000/health

# Test authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "coach@ywc.com", "password": "coach123"}'
```

## Default Users Created

The master.sql script creates these default users:

| Email | Password | Role | Description |
|-------|----------|------|-------------|
| admin@ywc.com | admin123 | ADMIN | System administrator |
| coach@ywc.com | coach123 | COACH | Financial coach |
| client@ywc.com | client123 | CLIENT | Test client |

## Database Schema Overview

### Core Tables

1. **users** - User management with role-based access
2. **personal_details** - Main personal information
3. **employment_details** - Employment history and details
4. **income_details** - Income breakdown and sources
5. **expenses_details** - Monthly expenses categorization
6. **assets** - Asset portfolio tracking
7. **liabilities** - Loans and debt management
8. **forms** - Form submission tracking
9. **family_details** - Family member information
10. **children** - Children information

### Key Features

- **UUID primary keys** for all entities
- **Cascade deletes** for data integrity
- **Check constraints** for data validation
- **Indexes** for performance optimization
- **Triggers** for automatic timestamp updates
- **Views** for complex queries
- **Seed data** for immediate testing

### Important Constraints

#### Marital Status Values
The system accepts both capitalized and lowercase values:
- `'Single'` or `'single'`
- `'Married'` or `'married'`
- `'Divorced'` or `'divorced'`
- `'Widowed'` or `'widowed'`

#### Applicant Types
- `'PrimaryApplicant'`
- `'SecondaryApplicant'`

#### Employment Types
- `'PrimaryEmployment'`
- `'SecondaryEmployment'`

#### Loan Types
- `'PersonalLoan'`
- `'HomeLoan'`
- `'CarLoan'`
- `'BusinessLoan'`
- `'EducationLoan'`
- `'OtherLoan'`

## Development Workflow

### Adding New Tables

1. **Update master.sql** with new table definition
2. **Add indexes** for performance
3. **Add constraints** for data validation
4. **Update triggers** if needed
5. **Add seed data** if applicable
6. **Update TypeScript types** in `../types/`
7. **Create service layer** in `../services/`
8. **Create controller** in `../controllers/`
9. **Add routes** in `../routes/`

### Schema Migrations

For existing databases, create migration files in `../migrations/`:

```sql
-- Example migration: add_new_column.sql
ALTER TABLE personal_details 
ADD COLUMN new_field VARCHAR(100);

UPDATE personal_details 
SET new_field = 'default_value' 
WHERE new_field IS NULL;
```

### Data Backup

Before major changes, backup your data:

```bash
# Full database backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Schema only
pg_dump --schema-only $DATABASE_URL > schema_backup.sql

# Data only
pg_dump --data-only $DATABASE_URL > data_backup.sql
```

## Troubleshooting

### Common Issues

1. **Connection refused**
   - Check if PostgreSQL is running
   - Verify connection string
   - Check firewall settings

2. **Permission denied**
   - Ensure user has correct permissions
   - Check database ownership
   - Verify authentication method in pg_hba.conf

3. **Table already exists**
   - Use `DROP DATABASE` and recreate
   - Or run `DROP TABLE IF EXISTS` statements first

4. **Constraint violations**
   - Check data format matches constraints
   - Verify enum values are correct
   - Ensure required fields are provided

### Reset Database

To completely reset the database:

```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS ywc_financial_forms;"
psql -U postgres -c "CREATE DATABASE ywc_financial_forms;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE ywc_financial_forms TO ywc_user;"

# Re-run master schema
psql $DATABASE_URL -f src/models/master.sql
```

### Performance Monitoring

Monitor database performance:

```sql
-- Check table sizes
SELECT schemaname,tablename,attname,n_distinct,correlation FROM pg_stats;

-- Check index usage
SELECT * FROM pg_stat_user_indexes;

-- Check slow queries
SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC;
```

## Production Considerations

1. **Environment Variables**
   - Use strong passwords
   - Set appropriate JWT_SECRET
   - Configure SSL connections

2. **Database Configuration**
   - Enable connection pooling
   - Set appropriate timeouts
   - Configure backup schedules

3. **Security**
   - Restrict database access
   - Use SSL certificates
   - Regular security updates

4. **Monitoring**
   - Set up database monitoring
   - Configure alerting
   - Log slow queries

## Support

For issues with database setup:

1. Check the API logs: `npm run logs`
2. Verify database connection: `npm run test:db`
3. Review environment variables
4. Check PostgreSQL logs
5. Refer to API documentation in `../../API_DOCUMENTATION.md` 