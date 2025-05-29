import { Request, Response } from 'express';
import { PersonService } from '../services/personService';

const personService = new PersonService();

export class PersonController {
  
  // Get complete person profile by user ID
  async getCompletePersonProfile(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      const person = await personService.getCompletePersonProfile(userId);
      
      if (!person) {
        res.status(404).json({
          success: false,
          message: 'Person not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Complete person profile retrieved successfully',
        data: person
      });
    } catch (error: any) {
      console.error('Error fetching complete person profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch complete person profile',
        error: error.message
      });
    }
  }

  // Get complete person profile by personal ID (for backward compatibility)
  async getCompletePersonProfileByPersonalId(req: Request, res: Response): Promise<void> {
    try {
      const { personalId } = req.params;
      
      const person = await personService.getCompletePersonProfileByPersonalId(personalId);
      
      if (!person) {
        res.status(404).json({
          success: false,
          message: 'Person not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Complete person profile retrieved successfully',
        data: person
      });
    } catch (error: any) {
      console.error('Error fetching complete person profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch complete person profile',
        error: error.message
      });
    }
  }

  // Get all persons summary (for coach dashboard)
  async getAllPersonsSummary(req: Request, res: Response): Promise<void> {
    try {
      const { coachId } = req.query;
      
      const persons = await personService.getAllPersonsSummary(coachId as string);
      
      res.status(200).json({
        success: true,
        message: 'Persons retrieved successfully',
        data: persons
      });
    } catch (error: any) {
      console.error('Error fetching persons summary:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch persons',
        error: error.message
      });
    }
  }

  // Get person summary by user ID (basic info for listings)
  async getPersonSummary(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      const summary = await personService.getPersonSummary(userId);
      
      if (!summary) {
        res.status(404).json({
          success: false,
          message: 'Person not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Person summary retrieved successfully',
        data: summary
      });
    } catch (error: any) {
      console.error('Error fetching person summary:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch person summary',
        error: error.message
      });
    }
  }

  // Get financial summary for a person by user ID
  async getFinancialSummary(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      const financialSummary = await personService.getFinancialSummary(userId);
      
      res.status(200).json({
        success: true,
        message: 'Financial summary retrieved successfully',
        data: financialSummary
      });
    } catch (error: any) {
      console.error('Error fetching financial summary:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch financial summary',
        error: error.message
      });
    }
  }
} 