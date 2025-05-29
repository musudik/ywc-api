# YWC Financial Forms API

A robust Node.js TypeScript API built with Express.js and PostgreSQL for financial forms management.

## 📋 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Development](#development)
- [Contributing](#contributing)

## ✨ Features

- **TypeScript** - Type-safe development with strict configuration
- **Express.js** - Fast, unopinionated web framework
- **PostgreSQL** - Robust relational database with `pg` package (no ORM)
- **UUID Primary Keys** - Using UUIDs for `personalId`, `employmentId`, etc.
- **Input Validation** - Express-validator for request validation
- **Environment Configuration** - Secure configuration management
- **CORS** - Cross-origin resource sharing enabled
- **Health Check** - Built-in health monitoring endpoint
- **Database Seeding** - Initial data population with roles and users
- **Role-Based Access** - ADMIN, COACH, CLIENT, GUEST roles with permissions
- **Complete Financial Management** - Income, Expenses, Assets, Liabilities tracking
- **Person Aggregation Service** - Complete financial profiles with calculations

## 📁 Project Structure

```
├── src/
│   ├── config/
│   │   └── db.ts              # PostgreSQL connection configuration
│   ├── controllers/           # Route controllers with validation
│   │   ├── personalDetailsController.ts
│   │   ├── employmentController.ts
│   │   ├── incomeController.ts
│   │   ├── expensesController.ts
│   │   ├── assetController.ts
│   │   ├── liabilityController.ts
│   │   └── personController.ts
│   ├── middleware/            # Custom middleware
│   ├── models/
│   │   ├── master.sql         # Complete database schema with seed data
│   │   ├── database.sql       # Legacy schema file
│   │   └── README.md          # Database setup guide
│   ├── routes/               # API routes
│   │   ├── personalDetailsRoutes.ts
│   │   ├── employmentRoutes.ts
│   │   ├── incomeRoutes.ts
│   │   ├── expensesRoutes.ts
│   │   ├── assetRoutes.ts
│   │   ├── liabilityRoutes.ts
│   │   └── personRoutes.ts
│   ├── seed/
│   │   └── seeder.ts         # PostgreSQL database seeder
│   ├── services/             # Business logic with SQL queries
│   │   ├── personalDetailsService.ts
│   │   ├── employmentService.ts
│   │   ├── incomeService.ts
│   │   ├── expensesService.ts
│   │   ├── assetService.ts
│   │   ├── liabilityService.ts
│   │   └── personService.ts
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces
│   ├── postman/              # Postman collections for testing
│   │   ├── YWC-Complete-API.postman_collection.json
│   │   └── README.md
│   └── index.ts              # Application entry point
├── setup-database.js         # Automated database setup script
├── test_complete_api.js      # Complete API test suite
├── API_DOCUMENTATION.md      # Complete API documentation
├── .env                      # Environment variables
├── .gitignore               # Git ignore rules
├── package.json             # Project dependencies
├── tsconfig.json            # TypeScript configuration
└── README.md               # Project documentation
```

## 🔧 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL (v12 or higher)

## 🚀 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ywc-api
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your PostgreSQL configuration:
```env
DATABASE_URL="postgresql://yourwealthcoach:yourwealthcoach@localhost:5432/yourwealthcoach"
DB_HOST=localhost
DB_PORT=5432
DB_NAME=yourwealthcoach
DB_USER=yourwealthcoach
DB_PASSWORD=yourwealthcoach
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
```

## ⚙️ Configuration

The application uses environment variables for configuration. Key variables include:

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `DATABASE_URL` - PostgreSQL connection string
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - Database connection details
- `JWT_SECRET` - JWT signing secret
- `CORS_ORIGIN` - Allowed CORS origins

## 🗄️ Database Setup

### Quick Setup (Recommended)

For a fresh environment, use the automated setup script:

```bash
# Automated setup with master.sql
node setup-database.js
```

This script will:
- ✅ Check prerequisites (PostgreSQL, psql)
- ✅ Verify environment variables
- ✅ Test database connection
- ✅ Execute complete schema with seed data
- ✅ Create default users (admin, coach, client)
- ✅ Verify setup completion

### Manual Setup

1. **Create PostgreSQL Database:**
```sql
CREATE DATABASE yourwealthcoach;
CREATE USER yourwealthcoach WITH PASSWORD 'yourwealthcoach';
GRANT ALL PRIVILEGES ON DATABASE yourwealthcoach TO yourwealthcoach;
```

2. **Run Master Schema:**
```bash
# Using DATABASE_URL
psql $DATABASE_URL -f src/models/master.sql

# Or using individual connection parameters
psql -U yourwealthcoach -d yourwealthcoach -f src/models/master.sql
```

### What Gets Created

The database setup includes:
- **Complete schema** for all financial data types
- **Performance indexes** for optimal queries
- **Auto-update triggers** for timestamps
- **Default roles** (ADMIN, COACH, CLIENT, GUEST)
- **Default users** with hashed passwords
- **Sample data** for testing

### Default Login Credentials

| Email | Password | Role | Description |
|-------|----------|------|-------------|
| admin@ywc.com | admin123 | ADMIN | System administrator |
| coach@ywc.com | coach123 | COACH | Financial coach |
| client@ywc.com | client123 | CLIENT | Test client |

### Database Schema Details

For detailed information about the database schema, constraints, and setup procedures, see:
- `src/models/README.md` - Complete database setup guide
- `API_DOCUMENTATION.md` - API documentation with data validation rules

## 🏃‍♂️ Usage

### Development
```bash
# Start development server with hot reload
npm run dev

# Build the project
npm run build

# Start production server
npm start

# Run complete API tests
node test_complete_api.js
```

### Production
```bash
# Build and start
npm run build
npm start
```

## 🛠 API Endpoints

### Health & Info
- `GET /` - Welcome message and server status
- `GET /health` - Server health check

### Authentication
- `POST /api/auth/login` - User login with JWT

### Personal Details
- `POST /api/personal-details` - Create personal details
- `GET /api/personal-details/:personalId` - Get personal details by ID
- `GET /api/personal-details/user/:userId` - Get personal details by user ID
- `PUT /api/personal-details/:personalId` - Update personal details
- `DELETE /api/personal-details/:personalId` - Delete personal details

### Employment Details
- `POST /api/employment` - Create employment details
- `GET /api/employment/:id` - Get employment details by ID
- `GET /api/employment/personal/:personalId` - Get employment by personal ID
- `PUT /api/employment/:id` - Update employment details
- `DELETE /api/employment/:id` - Delete employment details

### Financial Data
- `POST|GET|PUT|DELETE /api/income` - Income management
- `POST|GET|PUT|DELETE /api/expenses` - Expense management
- `POST|GET|PUT|DELETE /api/assets` - Asset management
- `POST|GET|PUT|DELETE /api/liabilities` - Liability management

### Person Aggregation
- `GET /api/person/:personalId/complete` - Complete financial profile
- `GET /api/person/:personalId/summary` - Person summary with counts
- `GET /api/person/:personalId/financial-summary` - Financial calculations
- `GET /api/person/coach/:coachId` - All persons by coach

For complete API documentation, see `API_DOCUMENTATION.md`.

## 🧪 Testing

### Postman Collections
Import the collections from `src/postman/`:
- `YWC-Complete-API.postman_collection.json` - Complete API testing
- Environment files for development/staging

### Automated Testing
```bash
# Run complete API test suite
node test_complete_api.js

# Test specific endpoints
npm run test:auth
npm run test:personal-details
npm run test:financial-data
```

## 🔨 Development

### Adding New Features

1. **Models**: Update `src/models/master.sql` with new tables
2. **Types**: Add TypeScript interfaces in `src/types/index.ts`
3. **Services**: Implement SQL queries in `src/services/`
4. **Controllers**: Add validation and business logic in `src/controllers/`
5. **Routes**: Define API endpoints in `src/routes/`
6. **Mount Routes**: Add to `src/index.ts`
7. **Tests**: Add to test suite and Postman collection

### Database Operations

The project uses raw SQL queries with the `pg` package:

```typescript
// Example service method
async getById(id: string): Promise<Entity | null> {
  const query = 'SELECT * FROM table_name WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows.length > 0 ? this.mapRowToEntity(result.rows[0]) : null;
}
```

### Important Constraints

**Marital Status**: Accepts both capitalized and lowercase values:
- `'Single'` or `'single'`
- `'Married'` or `'married'` 
- `'Divorced'` or `'divorced'`
- `'Widowed'` or `'widowed'`

**Applicant Types**: `'PrimaryApplicant'`, `'SecondaryApplicant'`
**Employment Types**: `'PrimaryEmployment'`, `'SecondaryEmployment'`
**Loan Types**: `'PersonalLoan'`, `'HomeLoan'`, `'CarLoan'`, `'BusinessLoan'`, `'EducationLoan'`, `'OtherLoan'`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

---

**Happy Coding! 🚀**

CREATE USER ywc WITH ENCRYPTED PASSWORD 'yourwealthcoach';
ALTER USER ywc WITH SUPERUSER;
GRANT ALL PRIVILEGES ON DATABASE ywc TO ywc;
SELECT * FROM pg_user WHERE usename = 'ywc';