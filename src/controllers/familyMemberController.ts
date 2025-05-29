import { Request, Response } from 'express';
import { FamilyMemberService } from '../services/familyMemberService';

const familyMemberService = new FamilyMemberService();

export class FamilyMemberController {
  
  // Create new family member
  async createFamilyMember(req: Request, res: Response): Promise<void> {
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

      if (!data.first_name || !data.last_name) {
        res.status(400).json({
          success: false,
          message: 'First name and last name are required'
        });
        return;
      }

      if (!data.relation) {
        res.status(400).json({
          success: false,
          message: 'Relation is required'
        });
        return;
      }

      if (!['Spouse', 'Child', 'Parent', 'Other'].includes(data.relation)) {
        res.status(400).json({
          success: false,
          message: 'Relation must be one of: Spouse, Child, Parent, Other'
        });
        return;
      }

      if (!data.birth_date) {
        res.status(400).json({
          success: false,
          message: 'Birth date is required'
        });
        return;
      }

      if (!data.nationality) {
        res.status(400).json({
          success: false,
          message: 'Nationality is required'
        });
        return;
      }

      const familyMember = await familyMemberService.createFamilyMember(data);
      
      res.status(201).json({
        success: true,
        message: 'Family member created successfully',
        data: familyMember
      });
    } catch (error: any) {
      console.error('Error creating family member:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create family member',
        error: error.message
      });
    }
  }

  // Get family member by ID
  async getFamilyMemberById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const familyMember = await familyMemberService.getFamilyMemberById(id);
      
      if (!familyMember) {
        res.status(404).json({
          success: false,
          message: 'Family member not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Family member retrieved successfully',
        data: familyMember
      });
    } catch (error: any) {
      console.error('Error fetching family member:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch family member',
        error: error.message
      });
    }
  }

  // Get family members by user ID
  async getFamilyMembersByUserId(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      const familyMembers = await familyMemberService.getFamilyMembersByUserId(userId);
      
      res.status(200).json({
        success: true,
        message: 'Family members retrieved successfully',
        data: familyMembers
      });
    } catch (error: any) {
      console.error('Error fetching family members by user ID:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch family members',
        error: error.message
      });
    }
  }

  // Get family members by relation
  async getFamilyMembersByRelation(req: Request, res: Response): Promise<void> {
    try {
      const { userId, relation } = req.params;
      
      if (!['Spouse', 'Child', 'Parent', 'Other'].includes(relation)) {
        res.status(400).json({
          success: false,
          message: 'Invalid relation type. Must be one of: Spouse, Child, Parent, Other'
        });
        return;
      }
      
      const familyMembers = await familyMemberService.getFamilyMembersByRelation(userId, relation);
      
      res.status(200).json({
        success: true,
        message: `Family members with relation '${relation}' retrieved successfully`,
        data: familyMembers
      });
    } catch (error: any) {
      console.error('Error fetching family members by relation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch family members',
        error: error.message
      });
    }
  }

  // Get all family members
  async getAllFamilyMembers(req: Request, res: Response): Promise<void> {
    try {
      const filters = req.query;
      
      const familyMembers = await familyMemberService.getAllFamilyMembers(filters);
      
      res.status(200).json({
        success: true,
        message: 'All family members retrieved successfully',
        data: familyMembers
      });
    } catch (error: any) {
      console.error('Error fetching all family members:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch family members',
        error: error.message
      });
    }
  }

  // Update family member
  async updateFamilyMember(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body;
      
      // Validate relation if provided
      if (data.relation && !['Spouse', 'Child', 'Parent', 'Other'].includes(data.relation)) {
        res.status(400).json({
          success: false,
          message: 'Relation must be one of: Spouse, Child, Parent, Other'
        });
        return;
      }
      
      const updatedFamilyMember = await familyMemberService.updateFamilyMember(id, data);
      
      if (!updatedFamilyMember) {
        res.status(404).json({
          success: false,
          message: 'Family member not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Family member updated successfully',
        data: updatedFamilyMember
      });
    } catch (error: any) {
      console.error('Error updating family member:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update family member',
        error: error.message
      });
    }
  }

  // Delete family member
  async deleteFamilyMember(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const deleted = await familyMemberService.deleteFamilyMember(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Family member not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Family member deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting family member:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete family member',
        error: error.message
      });
    }
  }

  // Delete all family members for a user
  async deleteFamilyMembersByUserId(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      const deleted = await familyMemberService.deleteFamilyMembersByUserId(userId);
      
      res.status(200).json({
        success: true,
        message: deleted ? 'Family members deleted successfully' : 'No family members found to delete'
      });
    } catch (error: any) {
      console.error('Error deleting family members:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete family members',
        error: error.message
      });
    }
  }
} 