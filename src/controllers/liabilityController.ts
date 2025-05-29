import { Request, Response } from 'express';
import { LiabilityService } from '../services/liabilityService';

const liabilityService = new LiabilityService();

export class LiabilityController {
  
  // Create new liability
  async createLiability(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      
      // Validate required fields
      if (!data.user_id) {
        res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
        return;
      }

      if (!data.loan_type) {
        res.status(400).json({
          success: false,
          message: 'Loan type is required'
        });
        return;
      }

      const liability = await liabilityService.createLiability(data);
      
      res.status(201).json({
        success: true,
        message: 'Liability created successfully',
        data: liability
      });
    } catch (error: any) {
      console.error('Error creating liability:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create liability',
        error: error.message
      });
    }
  }

  // Get liability by ID
  async getLiabilityById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const liability = await liabilityService.getLiabilityById(id);
      
      if (!liability) {
        res.status(404).json({
          success: false,
          message: 'Liability not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Liability retrieved successfully',
        data: liability
      });
    } catch (error: any) {
      console.error('Error fetching liability:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch liability',
        error: error.message
      });
    }
  }

  // Get liabilities by user ID
  async getLiabilitiesByUserId(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      const liabilities = await liabilityService.getLiabilitiesByUserId(userId);
      
      res.status(200).json({
        success: true,
        message: 'Liabilities retrieved successfully',
        data: liabilities
      });
    } catch (error: any) {
      console.error('Error fetching liabilities by user ID:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch liabilities',
        error: error.message
      });
    }
  }

  // Get all liabilities
  async getAllLiabilities(req: Request, res: Response): Promise<void> {
    try {
      const liabilities = await liabilityService.getAllLiabilities();
      
      res.status(200).json({
        success: true,
        message: 'All liabilities retrieved successfully',
        data: liabilities
      });
    } catch (error: any) {
      console.error('Error fetching all liabilities:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch liabilities',
        error: error.message
      });
    }
  }

  // Update liability
  async updateLiability(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body;
      
      const updatedLiability = await liabilityService.updateLiability(id, data);
      
      if (!updatedLiability) {
        res.status(404).json({
          success: false,
          message: 'Liability not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Liability updated successfully',
        data: updatedLiability
      });
    } catch (error: any) {
      console.error('Error updating liability:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update liability',
        error: error.message
      });
    }
  }

  // Delete liability
  async deleteLiability(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const deleted = await liabilityService.deleteLiability(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Liability not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Liability deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting liability:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete liability',
        error: error.message
      });
    }
  }
} 