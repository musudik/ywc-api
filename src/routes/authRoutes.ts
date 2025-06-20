import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate, optionalAuth } from '../middleware/authMiddleware';

const router = Router();

// POST /api/auth/login - User login
router.post(
  '/login',
  AuthController.loginValidationRules,
  AuthController.login
);

// POST /api/auth/register - User registration
router.post(
  '/register',
  optionalAuth, // Optional auth to check if user is admin for creating coach/admin accounts
  AuthController.registerValidationRules,
  AuthController.register
);

// POST /api/auth/refresh - Refresh JWT token
router.post(
  '/refresh',
  AuthController.refreshToken
);

// GET /api/auth/profile - Get current user profile
router.get(
  '/profile',
  authenticate,
  AuthController.getProfile
);

// GET /api/auth/me/clients - Get coach's clients
router.get(
  '/me/clients',
  authenticate,
  AuthController.getMyClients
);

// GET /api/auth/clients/:coachId - Get specific coach's clients (admin only)
router.get(
  '/clients/:coachId',
  authenticate,
  AuthController.getMyClients
);

// GET /api/auth/coaches - Get all coaches (admin only)
router.get(
  '/coaches',
  authenticate,
  AuthController.getAllCoaches
);

// POST /api/auth/logout - Logout user
router.post(
  '/logout',
  authenticate,
  AuthController.logout
);

export default router; 