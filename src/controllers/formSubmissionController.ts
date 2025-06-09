import { Request, Response } from 'express';
import { FormSubmissionService } from '../services/formSubmissionService';
import { CreateFormSubmissionRequest, UpdateFormSubmissionRequest } from '../types';

const formSubmissionService = new FormSubmissionService();

export class FormSubmissionController {
  
  // Create new form submission
  async createFormSubmission(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateFormSubmissionRequest = req.body;
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
        return;
      }
      
      // Validate required fields
      if (!data.form_config_id) {
        res.status(400).json({
          success: false,
          message: 'Form configuration ID is required'
        });
        return;
      }

      if (!data.form_data || typeof data.form_data !== 'object') {
        res.status(400).json({
          success: false,
          message: 'Form data is required and must be an object'
        });
        return;
      }

      const formSubmission = await formSubmissionService.createFormSubmission(data, userId);
      
      res.status(201).json({
        success: true,
        message: 'Form submission created successfully',
        data: formSubmission
      });
    } catch (error: any) {
      console.error('Error creating form submission:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create form submission',
        error: error.message
      });
    }
  }

  // Update form submission
  async updateFormSubmission(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const rawData = req.body;
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
        return;
      }

      // Filter out form_config_id from update data as it's not allowed to be updated
      const { form_config_id, ...data } = rawData;
      
      // Warn if form_config_id was provided (for debugging)
      if (form_config_id) {
        console.log(`Warning: form_config_id (${form_config_id}) was provided in update request but will be ignored. Form configuration cannot be changed after creation.`);
      }

      // For regular users, only allow updating their own submissions
      // For admin/coach, allow updating any submission
      const restrictToUser = !['ADMIN', 'COACH'].includes(userRole);
      
      const updatedFormSubmission = await formSubmissionService.updateFormSubmission(
        id, 
        data as UpdateFormSubmissionRequest, 
        restrictToUser ? userId : undefined
      );
      
      if (!updatedFormSubmission) {
        res.status(404).json({
          success: false,
          message: 'Form submission not found or access denied'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Form submission updated successfully',
        data: updatedFormSubmission
      });
    } catch (error: any) {
      console.error('Error updating form submission:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update form submission',
        error: error.message
      });
    }
  }

  // Get form submission by ID
  async getFormSubmission(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
        return;
      }

      // For regular users, only allow viewing their own submissions
      // For admin/coach, allow viewing any submission
      const restrictToUser = !['ADMIN', 'COACH'].includes(userRole);
      
      const formSubmission = await formSubmissionService.getFormSubmissionById(
        id, 
        restrictToUser ? userId : undefined
      );
      
      if (!formSubmission) {
        res.status(404).json({
          success: false,
          message: 'Form submission not found or access denied'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Form submission retrieved successfully',
        data: formSubmission
      });
    } catch (error: any) {
      console.error('Error fetching form submission:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch form submission',
        error: error.message
      });
    }
  }

  // Get user's form submissions
  async getUserFormSubmissions(req: Request, res: Response): Promise<void> {
    try {
      const { userId: paramUserId } = req.params;
      const requestUserId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;
      
      if (!requestUserId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
        return;
      }

      // Determine which user's submissions to fetch
      let targetUserId = paramUserId;
      
      // For regular users, only allow viewing their own submissions
      if (!['ADMIN', 'COACH'].includes(userRole)) {
        targetUserId = requestUserId;
      }
      
      const formSubmissions = await formSubmissionService.getUserFormSubmissions(targetUserId);
      
      res.status(200).json({
        success: true,
        message: 'Form submissions retrieved successfully',
        data: formSubmissions
      });
    } catch (error: any) {
      console.error('Error fetching user form submissions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch form submissions',
        error: error.message
      });
    }
  }

  // Submit form (change status from draft to submitted)
  async submitForm(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
        return;
      }

      // For regular users, only allow submitting their own forms
      // For admin/coach, allow submitting any form
      const restrictToUser = !['ADMIN', 'COACH'].includes(userRole);
      
      const submittedForm = await formSubmissionService.submitForm(
        id, 
        restrictToUser ? userId : undefined
      );
      
      if (!submittedForm) {
        res.status(404).json({
          success: false,
          message: 'Form submission not found or access denied'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Form submitted successfully',
        data: submittedForm
      });
    } catch (error: any) {
      console.error('Error submitting form:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit form',
        error: error.message
      });
    }
  }

  // Delete form submission
  async deleteFormSubmission(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
        return;
      }

      // For regular users, only allow deleting their own submissions
      // For admin/coach, allow deleting any submission
      const restrictToUser = !['ADMIN', 'COACH'].includes(userRole);
      
      const deleted = await formSubmissionService.deleteFormSubmission(
        id, 
        restrictToUser ? userId : undefined
      );
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Form submission not found or access denied'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Form submission deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting form submission:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete form submission',
        error: error.message
      });
    }
  }

  // Get all form submissions (admin/coach only)
  async getAllFormSubmissions(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
        return;
      }

      // Only admin and coach can view all submissions
      if (!['ADMIN', 'COACH'].includes(userRole)) {
        res.status(403).json({
          success: false,
          message: 'Access denied. Admin or Coach role required.'
        });
        return;
      }
      
      const filters = req.query;
      const formSubmissions = await formSubmissionService.getAllFormSubmissions(filters);
      
      res.status(200).json({
        success: true,
        message: 'All form submissions retrieved successfully',
        data: formSubmissions
      });
    } catch (error: any) {
      console.error('Error fetching all form submissions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch form submissions',
        error: error.message
      });
    }
  }
} 