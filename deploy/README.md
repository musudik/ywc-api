# 🚀 YWC API Deployment Guide

This guide provides comprehensive instructions for deploying the YWC API application in various environments.

## 📋 Prerequisites

- **Node.js 18+**
- **PostgreSQL 12+**
- **Docker** (for containerized deployment)
- **Kubernetes** (for cloud deployment)

## 🛠️ Deployment Options

### 1. 🖥️ Local Deployment (Development)

#### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd ywc-api

# Make setup script executable
chmod +x deploy/setup.sh

# Run automated setup
./deploy/setup.sh
```

#### Manual Setup
```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Setup database
node deploy/db-setup.js

# Start application
npm start
```

### 2. 🐳 Docker Deployment

#### Using Docker Compose (Recommended)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Using Docker Only
```bash
# Build image
docker build -t ywc-api .

# Run PostgreSQL
docker run -d --name ywc-postgres \
  -e POSTGRES_DB=ywc \
  -e POSTGRES_USER=ywc \
  -e POSTGRES_PASSWORD=yourwealthcoach \
  -p 5432:5432 \
  postgres:15-alpine

# Run application
docker run -d --name ywc-api \
  --link ywc-postgres:postgres \
  -e DB_HOST=postgres \
  -e DB_PASSWORD=yourwealthcoach \
  -p 3000:3000 \
  ywc-api
```

### 3. ☁️ Cloud Deployment (Kubernetes)

#### Prerequisites
```bash
# Install kubectl
curl -LO https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl
chmod +x kubectl
sudo mv kubectl /usr/local/bin/

# Verify cluster access
kubectl cluster-info
```

#### Deploy to Kubernetes
```bash
# Build and push Docker image
docker build -t your-registry/ywc-api:latest .
docker push your-registry/ywc-api:latest

# Update image in cloud-deploy.yml
sed -i 's/ywc-api:latest/your-registry\/ywc-api:latest/g' deploy/cloud-deploy.yml

# Deploy to cluster
kubectl apply -f deploy/cloud-deploy.yml

# Check status
kubectl get pods -n ywc-api
kubectl get services -n ywc-api
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DB_HOST` | Database host | localhost | ✅ |
| `DB_PORT` | Database port | 5432 | ✅ |
| `DB_NAME` | Database name | ywc | ✅ |
| `DB_USER` | Database user | ywc | ✅ |
| `DB_PASSWORD` | Database password | - | ✅ |
| `NODE_ENV` | Environment | development | ❌ |
| `PORT` | Application port | 3000 | ❌ |
| `JWT_SECRET` | JWT secret key | - | ✅ |
| `CORS_ORIGIN` | CORS origin | * | ❌ |

### Database Configuration

The application automatically creates all required tables and constraints. The database schema includes:

- **Users management** (authentication, roles)
- **Personal details** (user profiles)
- **Financial data** (income, expenses, assets, liabilities)
- **Form configurations** (dynamic forms)
- **Form submissions** (user submissions)

## 📊 Health Checks

### Application Health
```bash
# Check application health
curl http://localhost:3000/health

# Expected response
{
  "status": "ok",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "uptime": 120.45,
  "database": "connected"
}
```

### Database Health
```bash
# PostgreSQL health check
pg_isready -h localhost -p 5432 -U ywc -d ywc
```

## 🔍 Monitoring & Logs

### Application Logs
```bash
# Local deployment
tail -f logs/app.log

# Docker deployment
docker-compose logs -f ywc-api

# Kubernetes deployment
kubectl logs -f deployment/ywc-api -n ywc-api
```

### Database Monitoring
```bash
# Connect to database
psql -h localhost -p 5432 -U ywc -d ywc

# Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 🏗️ CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy YWC API

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Build Docker image
      run: docker build -t ywc-api:${{ github.sha }} .
      
    - name: Deploy to production
      run: |
        # Add your deployment commands here
        kubectl set image deployment/ywc-api ywc-api=ywc-api:${{ github.sha }} -n ywc-api
```

## 🛡️ Security Considerations

### Production Checklist
- [ ] Change default database passwords
- [ ] Set strong JWT secret
- [ ] Configure CORS properly
- [ ] Enable HTTPS/TLS
- [ ] Set up firewall rules
- [ ] Configure rate limiting
- [ ] Enable logging and monitoring
- [ ] Regular security updates

### Secrets Management
```bash
# Kubernetes secrets
kubectl create secret generic ywc-api-secrets \
  --from-literal=DB_PASSWORD=your-secure-password \
  --from-literal=JWT_SECRET=your-jwt-secret \
  -n ywc-api
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check database status
   systemctl status postgresql
   
   # Check connection
   pg_isready -h localhost -p 5432
   
   # Check logs
   tail -f /var/log/postgresql/postgresql-*.log
   ```

2. **Application Not Starting**
   ```bash
   # Check Node.js version
   node --version
   
   # Check dependencies
   npm install
   
   # Check environment variables
   cat .env
   ```

3. **Docker Issues**
   ```bash
   # Check Docker status
   docker ps -a
   
   # Check logs
   docker logs ywc-api
   
   # Rebuild containers
   docker-compose down && docker-compose up --build
   ```

### Performance Tuning

1. **Database Optimization**
   ```sql
   -- Analyze table statistics
   ANALYZE;
   
   -- Check slow queries
   SELECT query, mean_time, calls 
   FROM pg_stat_statements 
   ORDER BY mean_time DESC 
   LIMIT 10;
   ```

2. **Application Optimization**
   ```bash
   # Monitor Node.js performance
   npm install -g clinic
   clinic doctor -- node src/index.js
   ```

## 📞 Support

For deployment issues or questions:
- Check the application logs
- Review this documentation
- Create an issue in the repository
- Contact the development team

## 🔄 Updates & Maintenance

### Regular Maintenance
```bash
# Update dependencies
npm update

# Run database maintenance
node deploy/db-maintenance.js

# Backup database
pg_dump -h localhost -U ywc ywc > backup_$(date +%Y%m%d).sql
```

### Rolling Updates (Kubernetes)
```bash
# Update application
kubectl set image deployment/ywc-api ywc-api=ywc-api:new-version -n ywc-api

# Check rollout status
kubectl rollout status deployment/ywc-api -n ywc-api

# Rollback if needed
kubectl rollout undo deployment/ywc-api -n ywc-api
``` 