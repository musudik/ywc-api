import { Request, Response } from 'express';
import { IncomeService } from '../services/incomeService';

const incomeService = new IncomeService();

export class IncomeController {
  
  // Create new income details
  async createIncomeDetails(req: Request, res: Response): Promise<void> {
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

      const incomeDetails = await incomeService.createIncomeDetails(data);
      
      res.status(201).json({
        success: true,
        message: 'Income details created successfully',
        data: incomeDetails
      });
    } catch (error: any) {
      console.error('Error creating income details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create income details',
        error: error.message
      });
    }
  }

  // Get income details by ID
  async getIncomeDetailsById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const incomeDetails = await incomeService.getIncomeDetailsById(id);
      
      if (!incomeDetails) {
        res.status(404).json({
          success: false,
          message: 'Income details not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Income details retrieved successfully',
        data: incomeDetails
      });
    } catch (error: any) {
      console.error('Error fetching income details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch income details',
        error: error.message
      });
    }
  }

  // Get income details by user ID
  async getIncomeDetailsByUserId(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      const incomeDetails = await incomeService.getIncomeDetailsByUserId(userId);
      
      res.status(200).json({
        success: true,
        message: 'Income details retrieved successfully',
        data: incomeDetails
      });
    } catch (error: any) {
      console.error('Error fetching income details by user ID:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch income details',
        error: error.message
      });
    }
  }

  // Get all income details
  async getAllIncomeDetails(req: Request, res: Response): Promise<void> {
    try {
      const incomeDetails = await incomeService.getAllIncomeDetails();
      
      res.status(200).json({
        success: true,
        message: 'All income details retrieved successfully',
        data: incomeDetails
      });
    } catch (error: any) {
      console.error('Error fetching all income details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch income details',
        error: error.message
      });
    }
  }

  // Update income details
  async updateIncomeDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body;
      
      const updatedIncomeDetails = await incomeService.updateIncomeDetails(id, data);
      
      if (!updatedIncomeDetails) {
        res.status(404).json({
          success: false,
          message: 'Income details not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Income details updated successfully',
        data: updatedIncomeDetails
      });
    } catch (error: any) {
      console.error('Error updating income details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update income details',
        error: error.message
      });
    }
  }

  // Delete income details
  async deleteIncomeDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const deleted = await incomeService.deleteIncomeDetails(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Income details not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Income details deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting income details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete income details',
        error: error.message
      });
    }
  }
} 