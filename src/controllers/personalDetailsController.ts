import { Request, Response } from 'express';
import PersonalDetailsService from '../services/personalDetailsService';
import OnlineRegistrationService from '../services/onlineRegistrationService';
import { ApiResponse } from '../types';
import { body, param, validationResult, ValidationError } from 'express-validator';

const personalDetailsService = new PersonalDetailsService();
const onlineRegistrationService = new OnlineRegistrationService();

export class PersonalDetailsController {
  
  // Validation rules for creating personal details
  static createValidationRules = [
    body('applicant_type').isIn(['PrimaryApplicant', 'SecondaryApplicant']).withMessage('Applicant type must be PrimaryApplicant or SecondaryApplicant'),
    body('salutation').notEmpty().isLength({ max: 10 }).withMessage('Salutation is required'),
    body('first_name').notEmpty().isLength({ min: 1, max: 100 }).withMessage('First name is required and must be 1-100 characters'),
    body('last_name').notEmpty().isLength({ min: 1, max: 100 }).withMessage('Last name is required and must be 1-100 characters'),
    body('street').notEmpty().isLength({ max: 255 }).withMessage('Street address is required'),
    body('house_number').notEmpty().isLength({ max: 20 }).withMessage('House number is required'),
    body('postal_code').notEmpty().isLength({ max: 20 }).withMessage('Postal code is required'),
    body('city').notEmpty().isLength({ max: 100 }).withMessage('City is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().isLength({ max: 20 }).withMessage('Phone number is required'),
    body('marital_status').notEmpty().isLength({ max: 50 }).withMessage('Marital status is required'),
    body('birth_date').isISO8601().withMessage('Birth date must be a valid date'),
    body('birth_place').notEmpty().isLength({ max: 100 }).withMessage('Birth place is required'),
    body('nationality').notEmpty().isLength({ max: 100 }).withMessage('Nationality is required'),
    body('eu_citizen').isBoolean().withMessage('EU citizen must be true or false')
  ];

  // Validation rules for updating personal details
  static updateValidationRules = [
    param('userId').isUUID().withMessage('Valid user ID is required'),
    body('applicant_type').optional().isIn(['PrimaryApplicant', 'SecondaryApplicant']).withMessage('Applicant type must be PrimaryApplicant or SecondaryApplicant'),
    body('salutation').optional().isLength({ max: 10 }).withMessage('Salutation must be valid'),
    body('first_name').optional().isLength({ min: 1, max: 100 }).withMessage('First name must be 1-100 characters'),
    body('last_name').optional().isLength({ min: 1, max: 100 }).withMessage('Last name must be 1-100 characters'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('phone').optional().isLength({ max: 20 }).withMessage('Phone number must be valid')
  ];

  static getValidationRules = [
    param('userId').isUUID().withMessage('Valid user ID is required')
  ];

  // Validation rules for direct personal details (unprotected endpoint)
  static directPersonalDetailsValidationRules = [
    body('applicant_type').isIn(['PrimaryApplicant', 'SecondaryApplicant']).withMessage('Applicant type must be PrimaryApplicant or SecondaryApplicant'),
    body('salutation').optional().isLength({ max: 10 }).withMessage('Salutation must be valid'),
    body('first_name').notEmpty().isLength({ min: 1, max: 100 }).withMessage('First name is required and must be 1-100 characters'),
    body('last_name').notEmpty().isLength({ min: 1, max: 100 }).withMessage('Last name is required and must be 1-100 characters'),
    body('street').optional().isLength({ max: 255 }).withMessage('Street address must be valid'),
    body('house_number').optional().isLength({ max: 20 }).withMessage('House number must be valid'),
    body('postal_code').optional().isLength({ max: 20 }).withMessage('Postal code must be valid'),
    body('city').optional().isLength({ max: 100 }).withMessage('City must be valid'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').optional().isLength({ max: 20 }).withMessage('Phone number must be valid'),
    body('whatsapp').optional().isLength({ max: 20 }).withMessage('WhatsApp number must be valid'),
    body('marital_status').optional().isLength({ max: 50 }).withMessage('Marital status must be valid'),
    body('birth_date').optional().isISO8601().withMessage('Birth date must be a valid date'),
    body('birth_place').optional().isLength({ max: 100 }).withMessage('Birth place must be valid'),
    body('nationality').optional().isLength({ max: 100 }).withMessage('Nationality must be valid'),
    body('residence_permit').optional().isLength({ max: 100 }).withMessage('Residence permit must be valid'),
    body('eu_citizen').optional().isBoolean().withMessage('EU citizen must be true or false'),
    body('tax_id').optional().isLength({ max: 50 }).withMessage('Tax ID must be valid'),
    body('iban').optional().isLength({ max: 34 }).withMessage('IBAN must be valid'),
    body('housing').optional().isLength({ max: 100 }).withMessage('Housing must be valid')
  ];

  // POST /api/direct/personal-details - Create personal details without authentication
  static async createDirectPersonalDetails(req: Request, res: Response): Promise<void> {
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

      // Create online registration instead of personal details
      const registration = await onlineRegistrationService.createRegistration(req.body);
      
      const response: ApiResponse = {
        success: true,
        message: 'Registration submitted successfully',
        data: {
          registration_id: registration.id,
          status: registration.status,
          created_at: registration.created_at
        }
      };
      
      res.status(201).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to submit registration',
        error: error.message
      };
      res.status(500).json(response);
    }
  }

  // POST /api/personal-details
  static async createPersonalDetails(req: Request, res: Response): Promise<void> {
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

      // Use the authenticated user's ID as the user_id
      const userId = req.user?.userId;
      if (!userId) {
        const response: ApiResponse = {
          success: false,
          message: 'Authentication required',
          error: 'User not authenticated'
        };
        res.status(401).json(response);
        return;
      }

      console.log("req.user", req.user);
      // Add user_id and coach_id to the request body
      const personalDetailsData = {
        ...req.body,
        user_id: userId,
        coach_id: req.body.coach_id || req.user?.coach_id || null
      };

      const personalDetails = await personalDetailsService.createPersonalDetails(personalDetailsData);
      
      const response: ApiResponse = {
        success: true,
        message: 'Personal details created successfully',
        data: personalDetails
      };
      
      res.status(201).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to create personal details',
        error: error.message
      };
      res.status(500).json(response);
    }
  }

  // GET /api/personal-details/:userId
  static async getPersonalDetails(req: Request, res: Response): Promise<void> {
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

      const { userId } = req.params;
      const personalDetails = await personalDetailsService.getPersonalDetailsByUserId(userId);
      
      if (!personalDetails) {
        const response: ApiResponse = {
          success: false,
          message: 'Personal details not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Personal details retrieved successfully',
        data: personalDetails
      };
      
      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to get personal details',
        error: error.message
      };
      res.status(500).json(response);
    }
  }

  // GET /api/personal-details/coach/:coachId
  static async getPersonalDetailsByCoachId(req: Request, res: Response): Promise<void> {
    try {
      const { coachId } = req.params;
      const personalDetails = await personalDetailsService.getPersonalDetailsByCoachId(coachId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Personal details retrieved successfully',
        data: personalDetails
      };
      
      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to get personal details',
        error: error.message
      };
      res.status(500).json(response);
    }
  }

  // PUT /api/personal-details/:userId
  static async updatePersonalDetails(req: Request, res: Response): Promise<void> {
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

      const { userId } = req.params;
      const personalDetails = await personalDetailsService.updatePersonalDetailsByUserId(userId, req.body);
      
      if (!personalDetails) {
        const response: ApiResponse = {
          success: false,
          message: 'Personal details not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Personal details updated successfully',
        data: personalDetails
      };
      
      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to update personal details',
        error: error.message
      };
      res.status(500).json(response);
    }
  }

  // DELETE /api/personal-details/:userId
  static async deletePersonalDetails(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const deleted = await personalDetailsService.deletePersonalDetailsByUserId(userId);
      
      if (!deleted) {
        const response: ApiResponse = {
          success: false,
          message: 'Personal details not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Personal details deleted successfully'
      };
      
      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to delete personal details',
        error: error.message
      };
      res.status(500).json(response);
    }
  }

  // GET /api/personal-details
  static async getAllPersonalDetails(req: Request, res: Response): Promise<void> {
    try {
      const { applicant_type, marital_status } = req.query;
      
      const filters: any = {};
      if (applicant_type) filters.applicant_type = applicant_type;
      if (marital_status) filters.marital_status = marital_status;

      const personalDetails = await personalDetailsService.getAllPersonalDetails(filters);
      
      const response: ApiResponse = {
        success: true,
        message: 'Personal details retrieved successfully',
        data: personalDetails
      };
      
      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to get personal details',
        error: error.message
      };
      res.status(500).json(response);
    }
  }

  // GET /api/personal-details/my
  static async getMyPersonalDetails(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        const response: ApiResponse = {
          success: false,
          message: 'Authentication required',
          error: 'User not authenticated'
        };
        res.status(401).json(response);
        return;
      }

      const personalDetails = await personalDetailsService.getPersonalDetailsByUserId(userId);
      
      if (!personalDetails) {
        const response: ApiResponse = {
          success: false,
          message: 'Personal details not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Personal details retrieved successfully',
        data: personalDetails
      };
      
      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to get personal details',
        error: error.message
      };
      res.status(500).json(response);
    }
  }
} 