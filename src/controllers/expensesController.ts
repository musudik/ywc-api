import { Request, Response } from 'express';
import { ExpensesService } from '../services/expensesService';

const expensesService = new ExpensesService();

export class ExpensesController {
  
  // Create new expenses details
  async createExpensesDetails(req: Request, res: Response): Promise<void> {
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

      const expensesDetails = await expensesService.createExpensesDetails(data);
      
      res.status(201).json({
        success: true,
        message: 'Expenses details created successfully',
        data: expensesDetails
      });
    } catch (error: any) {
      console.error('Error creating expenses details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create expenses details',
        error: error.message
      });
    }
  }

  // Get expenses details by ID
  async getExpensesDetailsById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const expensesDetails = await expensesService.getExpensesDetailsById(id);
      
      if (!expensesDetails) {
        res.status(404).json({
          success: false,
          message: 'Expenses details not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Expenses details retrieved successfully',
        data: expensesDetails
      });
    } catch (error: any) {
      console.error('Error fetching expenses details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch expenses details',
        error: error.message
      });
    }
  }

  // Get expenses details by user ID
  async getExpensesDetailsByUserId(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      const expensesDetails = await expensesService.getExpensesDetailsByUserId(userId);
      
      res.status(200).json({
        success: true,
        message: 'Expenses details retrieved successfully',
        data: expensesDetails
      });
    } catch (error: any) {
      console.error('Error fetching expenses details by user ID:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch expenses details',
        error: error.message
      });
    }
  }

  // Get all expenses details
  async getAllExpensesDetails(req: Request, res: Response): Promise<void> {
    try {
      const expensesDetails = await expensesService.getAllExpensesDetails();
      
      res.status(200).json({
        success: true,
        message: 'All expenses details retrieved successfully',
        data: expensesDetails
      });
    } catch (error: any) {
      console.error('Error fetching all expenses details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch expenses details',
        error: error.message
      });
    }
  }

  // Update expenses details
  async updateExpensesDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body;
      
      const updatedExpensesDetails = await expensesService.updateExpensesDetails(id, data);
      
      if (!updatedExpensesDetails) {
        res.status(404).json({
          success: false,
          message: 'Expenses details not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Expenses details updated successfully',
        data: updatedExpensesDetails
      });
    } catch (error: any) {
      console.error('Error updating expenses details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update expenses details',
        error: error.message
      });
    }
  }

  // Delete expenses details
  async deleteExpensesDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const deleted = await expensesService.deleteExpensesDetails(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Expenses details not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Expenses details deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting expenses details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete expenses details',
        error: error.message
      });
    }
  }
} 