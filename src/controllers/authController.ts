import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { ApiResponse, UserRole } from '../types';
import { body, validationResult, ValidationError } from 'express-validator';

const authService = new AuthService();

export class AuthController {
  
  // Validation rules for login
  static loginValidationRules = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
  ];

  // Validation rules for registration
  static registerValidationRules = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('first_name').notEmpty().isLength({ min: 1, max: 100 }).withMessage('First name is required and must be 1-100 characters'),
    body('last_name').notEmpty().isLength({ min: 1, max: 100 }).withMessage('Last name is required and must be 1-100 characters'),
    body('role').optional().isIn(['ADMIN', 'COACH', 'CLIENT', 'GUEST']).withMessage('Invalid role'),
    body('coach_id').optional().isUUID().withMessage('Valid coach ID is required when creating clients')
  ];

  // POST /api/auth/login
  static async login(req: Request, res: Response): Promise<void> {
    console.log('🔐 AuthController: Login attempt started');
    console.log('🔐 AuthController: Request body:', { email: req.body.email, passwordLength: req.body.password?.length });
    console.log('🔐 AuthController: Request headers:', req.headers);
    
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('❌ AuthController: Validation failed:', errors.array());
        const response: ApiResponse = {
          success: false,
          message: 'Validation failed',
          error: errors.array().map((err: ValidationError) => err.msg).join(', ')
        };
        res.status(400).json(response);
        return;
      }

      console.log('✅ AuthController: Validation passed, calling authService.login');
      const { email, password } = req.body;
      const authResponse = await authService.login({ email, password });
      
      console.log('✅ AuthController: Login successful, user:', { 
        id: authResponse.user.id, 
        email: authResponse.user.email, 
        role: authResponse.user.role 
      });
      console.log('✅ AuthController: Token generated, length:', authResponse.token.length);
      
      const response: ApiResponse = {
        success: true,
        message: 'Login successful',
        data: authResponse
      };
      
      res.status(200).json(response);
    } catch (error: any) {
      console.log('❌ AuthController: Login failed with error:', error.message);
      console.log('❌ AuthController: Error stack:', error.stack);
      
      const response: ApiResponse = {
        success: false,
        message: 'Login failed',
        error: error.message
      };
      res.status(401).json(response);
    }
  }

  // POST /api/auth/register
  static async register(req: Request, res: Response): Promise<void> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const response: ApiResponse = {
          success: false,
          message: 'Validation failed',
          error: errors.array().map((err: ValidationError) => err.msg).join(', ')
        };
        res.status(400).json(response);
        return;
      }

      const { email, password, first_name, last_name, role = UserRole.CLIENT, coach_id } = req.body;
      
      // Only admins can create other admins or coaches
      if (req.user && req.user.role !== UserRole.ADMIN && (role === UserRole.ADMIN || role === UserRole.COACH)) {
        const response: ApiResponse = {
          success: false,
          message: 'Access denied. Only admins can create admin or coach accounts.',
          error: 'Insufficient permissions'
        };
        res.status(403).json(response);
        return;
      }

      // If creating a client, validate coach assignment
      if (role === UserRole.CLIENT && coach_id) {
        // Verify coach exists and has COACH role
        const coach = await authService.getUserById(coach_id);
        if (!coach || coach.role !== UserRole.COACH) {
          const response: ApiResponse = {
            success: false,
            message: 'Invalid coach ID provided',
            error: 'Coach not found or invalid role'
          };
          res.status(400).json(response);
          return;
        }
      }

      const authResponse = await authService.register({
        email,
        password,
        first_name,
        last_name,
        role,
        coach_id
      });
      
      const response: ApiResponse = {
        success: true,
        message: `${role.toLowerCase()} registered successfully`,
        data: authResponse
      };
      
      res.status(201).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: 'Registration failed',
        error: error.message
      };
      res.status(400).json(response);
    }
  }

  // POST /api/auth/refresh
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;
      
      if (!token) {
        const response: ApiResponse = {
          success: false,
          message: 'Token is required',
          error: 'No token provided'
        };
        res.status(400).json(response);
        return;
      }

      const authResponse = await authService.refreshToken(token);
      
      const response: ApiResponse = {
        success: true,
        message: 'Token refreshed successfully',
        data: authResponse
      };
      
      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: 'Token refresh failed',
        error: error.message
      };
      res.status(401).json(response);
    }
  }

  // GET /api/auth/profile
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          message: 'User not found',
          error: 'No user information available'
        };
        res.status(401).json(response);
        return;
      }

      const user = await authService.getUserById(req.user.userId);
      
      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: 'User not found',
          error: 'User does not exist'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Profile retrieved successfully',
        data: user
      };
      
      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to get profile',
        error: error.message
      };
      res.status(500).json(response);
    }
  }

  // GET /api/auth/me/clients (for coaches to see their clients)
  // GET /api/auth/clients/:coachId (for admins to see any coach's clients)
  static async getMyClients(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          message: 'Authentication required',
          error: 'No user information available'
        };
        res.status(401).json(response);
        return;
      }

      // Only coaches and admins can access this endpoint
      if (req.user.role !== UserRole.COACH && req.user.role !== UserRole.ADMIN) {
        const response: ApiResponse = {
          success: false,
          message: 'Access denied. Only coaches and admins can view client lists.',
          error: 'Insufficient permissions'
        };
        res.status(403).json(response);
        return;
      }

      // Determine which coach's clients to fetch
      const targetCoachId = req.params.coachId || req.user.userId;

      // If requesting another coach's clients, only admins can do this
      if (targetCoachId !== req.user.userId && req.user.role !== UserRole.ADMIN) {
        const response: ApiResponse = {
          success: false,
          message: 'Access denied. Only admins can view other coaches\' clients.',
          error: 'Insufficient permissions'
        };
        res.status(403).json(response);
        return;
      }

      // Verify the target coach exists and has COACH role
      const targetCoach = await authService.getUserById(targetCoachId);
      if (!targetCoach || targetCoach.role !== UserRole.COACH) {
        const response: ApiResponse = {
          success: false,
          message: 'Coach not found or invalid role',
          error: 'The specified coach ID does not exist or is not a coach'
        };
        res.status(404).json(response);
        return;
      }

      const clientsData = await authService.getCoachClients(targetCoachId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Clients retrieved successfully',
        data: {
          coach: {
            id: targetCoach.id,
            first_name: targetCoach.first_name,
            last_name: targetCoach.last_name,
            email: targetCoach.email,
            role: targetCoach.role
          },
          clients: clientsData,
          total_clients: clientsData.length
        }
      };
      
      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to get clients',
        error: error.message
      };
      res.status(500).json(response);
    }
  }

  // GET /api/auth/coaches (for admins to see all coaches)
  static async getAllCoaches(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          message: 'Authentication required',
          error: 'No user information available'
        };
        res.status(401).json(response);
        return;
      }

      // Only admins can access this endpoint
      if (req.user.role !== UserRole.ADMIN) {
        const response: ApiResponse = {
          success: false,
          message: 'Access denied. Only admins can view coach lists.',
          error: 'Insufficient permissions'
        };
        res.status(403).json(response);
        return;
      }

      const coaches = await authService.getAllCoaches();
      
      const response: ApiResponse = {
        success: true,
        message: 'Coaches retrieved successfully',
        data: {
          coaches,
          total_coaches: coaches.length
        }
      };
      
      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to get coaches',
        error: error.message
      };
      res.status(500).json(response);
    }
  }

  // POST /api/auth/logout
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      // In a stateless JWT system, logout is typically handled client-side
      // by simply removing the token. However, we can provide this endpoint
      // for completeness and potential future token blacklisting
      
      const response: ApiResponse = {
        success: true,
        message: 'Logged out successfully',
        data: {
          message: 'Please remove the token from your client storage'
        }
      };
      
      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: 'Logout failed',
        error: error.message
      };
      res.status(500).json(response);
    }
  }
}