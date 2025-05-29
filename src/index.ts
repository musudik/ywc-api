import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';

// Import routes
import authRoutes from './routes/authRoutes';
import personalDetailsRoutes from './routes/personalDetailsRoutes';
import employmentRoutes from './routes/employmentRoutes';
import incomeRoutes from './routes/incomeRoutes';
import expensesRoutes from './routes/expensesRoutes';
import assetRoutes from './routes/assetRoutes';
import liabilityRoutes from './routes/liabilityRoutes';
import familyMemberRoutes from './routes/familyMemberRoutes';
import personRoutes from './routes/personRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database
connectDB();

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to YWC Financial Forms API',
    status: 'Server is running successfully',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || 'v1',
    endpoints: {
      auth: '/api/auth',
      personalDetails: '/api/personal-details',
      employment: '/api/employment',
      income: '/api/income',
      expenses: '/api/expenses',
      assets: '/api/assets',
      liabilities: '/api/liabilities',
      familyMembers: '/api/family-members',
      person: '/api/person',
      user: '/api/user',
      health: '/health'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: 'PostgreSQL',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/personal-details', personalDetailsRoutes);
app.use('/api/employment', employmentRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/liabilities', liabilityRoutes);
app.use('/api/family-members', familyMemberRoutes);
app.use('/api/person', personRoutes);
app.use('/api/user', personRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 YWC Financial Forms API is running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: PostgreSQL`);
  console.log(`🔐 Authentication: JWT enabled`);
  console.log(`📋 API Documentation: http://localhost:${PORT}/`);
});

export default app; 