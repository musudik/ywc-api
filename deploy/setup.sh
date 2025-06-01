#!/bin/bash

# =====================================
# YWC API Deployment Setup Script
# =====================================

set -e  # Exit on any error

echo "🚀 YWC API Deployment Setup"
echo "================================="

# Configuration
APP_NAME="ywc-api"
NODE_VERSION="18"
DB_NAME="${DB_NAME:-ywc}"
DB_USER="${DB_USER:-ywc}"
DB_PASSWORD="${DB_PASSWORD:-yourwealthcoach}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_warning "Running as root. This is not recommended for production."
    fi
}

# Install system dependencies
install_system_deps() {
    log_info "Installing system dependencies..."
    
    if command -v apt-get &> /dev/null; then
        # Ubuntu/Debian
        sudo apt-get update
        sudo apt-get install -y curl wget gnupg2 software-properties-common
        
        # Install Node.js
        curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
        sudo apt-get install -y nodejs
        
        # Install PostgreSQL
        sudo apt-get install -y postgresql postgresql-contrib
        
    elif command -v yum &> /dev/null; then
        # RHEL/CentOS
        sudo yum update -y
        sudo yum install -y curl wget
        
        # Install Node.js
        curl -fsSL https://rpm.nodesource.com/setup_${NODE_VERSION}.x | sudo bash -
        sudo yum install -y nodejs
        
        # Install PostgreSQL
        sudo yum install -y postgresql-server postgresql-contrib
        sudo postgresql-setup initdb
        
    elif command -v brew &> /dev/null; then
        # macOS
        brew install node@${NODE_VERSION} postgresql
        
    else
        log_error "Unsupported package manager. Please install Node.js ${NODE_VERSION} and PostgreSQL manually."
        exit 1
    fi
    
    log_success "System dependencies installed"
}

# Setup PostgreSQL
setup_postgresql() {
    log_info "Setting up PostgreSQL..."
    
    # Start PostgreSQL service
    if command -v systemctl &> /dev/null; then
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
    elif command -v service &> /dev/null; then
        sudo service postgresql start
    elif command -v brew &> /dev/null; then
        brew services start postgresql
    fi
    
    # Create database and user
    sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME};" || log_warning "Database ${DB_NAME} may already exist"
    sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';" || log_warning "User ${DB_USER} may already exist"
    sudo -u postgres psql -c "ALTER DATABASE ${DB_NAME} OWNER TO ${DB_USER};"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"
    
    log_success "PostgreSQL setup completed"
}

# Install application dependencies
install_app_deps() {
    log_info "Installing application dependencies..."
    
    if [ ! -f package.json ]; then
        log_error "package.json not found. Please run this script from the application root directory."
        exit 1
    fi
    
    npm install
    log_success "Application dependencies installed"
}

# Setup environment file
setup_environment() {
    log_info "Setting up environment configuration..."
    
    if [ ! -f .env ]; then
        cat > .env << EOF
# Database Configuration
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}

# Application Configuration
NODE_ENV=production
PORT=3000
API_BASE_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log
EOF
        log_success "Environment file created (.env)"
    else
        log_warning "Environment file already exists (.env)"
    fi
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    # Run the main schema setup
    node deploy/db-setup.js
    
    log_success "Database migrations completed"
}

# Create systemd service (for Linux)
create_systemd_service() {
    if command -v systemctl &> /dev/null && [[ "$OSTYPE" == "linux-gnu"* ]]; then
        log_info "Creating systemd service..."
        
        sudo tee /etc/systemd/system/${APP_NAME}.service > /dev/null << EOF
[Unit]
Description=YWC API Application
After=network.target postgresql.service

[Service]
Type=simple
User=\$(whoami)
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/node src/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=$(pwd)/.env

# Logging
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=${APP_NAME}

[Install]
WantedBy=multi-user.target
EOF
        
        sudo systemctl daemon-reload
        sudo systemctl enable ${APP_NAME}
        
        log_success "Systemd service created"
    fi
}

# Setup log directory
setup_logging() {
    log_info "Setting up logging..."
    
    mkdir -p logs
    touch logs/app.log
    
    log_success "Logging setup completed"
}

# Health check
health_check() {
    log_info "Performing health check..."
    
    # Start the application in background
    npm start &
    APP_PID=$!
    
    # Wait for application to start
    sleep 10
    
    # Check if application is responding
    if curl -f http://localhost:3000/health &> /dev/null; then
        log_success "Application is healthy"
        kill $APP_PID
    else
        log_error "Application health check failed"
        kill $APP_PID
        exit 1
    fi
}

# Main deployment function
main() {
    log_info "Starting YWC API deployment..."
    
    check_root
    install_system_deps
    setup_postgresql
    install_app_deps
    setup_environment
    run_migrations
    setup_logging
    create_systemd_service
    health_check
    
    log_success "🎉 YWC API deployment completed successfully!"
    echo ""
    log_info "Next steps:"
    echo "  1. Review the .env file and update configurations as needed"
    echo "  2. Start the application: npm start"
    echo "  3. Or use systemd: sudo systemctl start ${APP_NAME}"
    echo "  4. Check logs: tail -f logs/app.log"
    echo "  5. API will be available at: http://localhost:3000"
}

# Run main function
main "$@" 