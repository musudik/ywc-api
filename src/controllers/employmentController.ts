import { Request, Response } from 'express';
import { EmploymentService } from '../services/employmentService';
import { ApiResponse } from '../types';
import { body, param, validationResult, ValidationError } from 'express-validator';

const employmentService = new EmploymentService();

export class EmploymentController {
  
  // Validation rules for creating employment details
  static createValidationRules = [
    body('user_id').isUUID().withMessage('Valid user ID is required'),
    body('employment_type').notEmpty().withMessage('Employment type is required'),
    body('occupation').notEmpty().isLength({ max: 200 }).withMessage('Occupation is required'),
    body('contract_type').optional().isLength({ max: 100 }).withMessage('Contract type must be less than 100 characters'),
    body('employer_name').optional().isLength({ max: 200 }).withMessage('Employer name must be less than 200 characters'),
    body('employed_since').optional().isISO8601().withMessage('Employed since must be a valid date')
  ];

  static getValidationRules = [
    param('id').isUUID().withMessage('Valid employment ID is required')
  ];

  // POST /api/employment - Create employment details
  static async createEmploymentDetails(req: Request, res: Response): Promise<void> {
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

      const employmentDetails = await employmentService.createEmploymentDetails(req.body);
      
      const response: ApiResponse = {
        success: true,
        message: 'Employment details created successfully',
        data: employmentDetails
      };
      
      res.status(201).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to create employment details',
        error: error.message
      };
      res.status(500).json(response);
    }
  }

  // GET /api/employment/:id - Get employment details by ID
  static async getEmploymentDetails(req: Request, res: Response): Promise<void> {
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

      const { id } = req.params;
      const employmentDetails = await employmentService.getEmploymentDetailsById(id);
      
      if (!employmentDetails) {
        const response: ApiResponse = {
          success: false,
          message: 'Employment details not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Employment details retrieved successfully',
        data: employmentDetails
      };
      
      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to get employment details',
        error: error.message
      };
      res.status(500).json(response);
    }
  }

  // GET /api/employment/user/:userId - Get employment details by user ID
  static async getEmploymentDetailsByUserId(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const employmentDetails = await employmentService.getEmploymentDetailsByUserId(userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Employment details retrieved successfully',
        data: employmentDetails
      };
      
      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to get employment details',
        error: error.message
      };
      res.status(500).json(response);
    }
  }

  // GET /api/employment - Get all employment details
  static async getAllEmploymentDetails(req: Request, res: Response): Promise<void> {
    try {
      const employmentDetails = await employmentService.getAllEmploymentDetails();
      
      const response: ApiResponse = {
        success: true,
        message: 'All employment details retrieved successfully',
        data: employmentDetails
      };
      
      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to get employment details',
        error: error.message
      };
      res.status(500).json(response);
    }
  }

  // PUT /api/employment/:id - Update employment details
  static async updateEmploymentDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const employmentDetails = await employmentService.updateEmploymentDetails(id, req.body);
      
      if (!employmentDetails) {
        const response: ApiResponse = {
          success: false,
          message: 'Employment details not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Employment details updated successfully',
        data: employmentDetails
      };
      
      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to update employment details',
        error: error.message
      };
      res.status(500).json(response);
    }
  }

  // PUT /api/employment/user/:userId - Update employment details by user ID
  static async updateEmploymentDetailsByUserId(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const employmentDetails = await employmentService.updateEmploymentDetailsByUserId(userId, req.body);
      
      if (!employmentDetails) {
        const response: ApiResponse = {
          success: false,
          message: 'Employment details not found for this user'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Employment details updated successfully',
        data: employmentDetails
      };
      
      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to update employment details',
        error: error.message
      };
      res.status(500).json(response);
    }
  }

  // DELETE /api/employment/:id - Delete employment details
  static async deleteEmploymentDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await employmentService.deleteEmploymentDetails(id);
      
      if (!deleted) {
        const response: ApiResponse = {
          success: false,
          message: 'Employment details not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Employment details deleted successfully'
      };
      
      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to delete employment details',
        error: error.message
      };
      res.status(500).json(response);
    }
  }

  // DELETE /api/employment/user/:userId - Delete employment details by user ID
  static async deleteEmploymentDetailsByUserId(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const deleted = await employmentService.deleteEmploymentDetailsByUserId(userId);
      
      if (!deleted) {
        const response: ApiResponse = {
          success: false,
          message: 'No employment details found for this user'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Employment details deleted successfully'
      };
      
      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to delete employment details',
        error: error.message
      };
      res.status(500).json(response);
    }
  }
} 