import { Request, Response } from 'express';
import { FormConfigurationService } from '../services/formConfigurationService';
import { CreateFormConfigurationRequest, UpdateFormConfigurationRequest } from '../types';

const formConfigurationService = new FormConfigurationService();

export class FormConfigurationController {
  
  // Create new form configuration
  async createFormConfiguration(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateFormConfigurationRequest = req.body;
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
        return;
      }
      
      // Validate required fields
      if (!data.name || !data.form_type || !data.sections) {
        res.status(400).json({
          success: false,
          message: 'Name, form type, and sections are required'
        });
        return;
      }

      // Validate sections structure
      if (!Array.isArray(data.sections) || data.sections.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Sections must be a non-empty array'
        });
        return;
      }

      // Validate each section
      for (const section of data.sections) {
        if (!section.id || !section.title || !Array.isArray(section.fields)) {
          res.status(400).json({
            success: false,
            message: 'Each section must have id, title, and fields array'
          });
          return;
        }

        // Validate fields in each section
        for (const field of section.fields) {
          if (!field.id || !field.name || !field.label || !field.type) {
            res.status(400).json({
              success: false,
              message: 'Each field must have id, name, label, and type'
            });
            return;
          }
        }
      }

      const formConfiguration = await formConfigurationService.createFormConfiguration(data, userId);
      
      res.status(201).json({
        success: true,
        message: 'Form configuration created successfully',
        data: formConfiguration
      });
    } catch (error: any) {
      console.error('Error creating form configuration:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create form configuration',
        error: error.message
      });
    }
  }

  // Get form configuration by ID
  async getFormConfigurationById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const formConfiguration = await formConfigurationService.getFormConfigurationById(id);
      
      if (!formConfiguration) {
        res.status(404).json({
          success: false,
          message: 'Form configuration not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Form configuration retrieved successfully',
        data: formConfiguration
      });
    } catch (error: any) {
      console.error('Error fetching form configuration:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch form configuration',
        error: error.message
      });
    }
  }

  // Get form configuration by config ID
  async getFormConfigurationByConfigId(req: Request, res: Response): Promise<void> {
    try {
      const { configId } = req.params;
      
      const formConfiguration = await formConfigurationService.getFormConfigurationByConfigId(configId);
      
      if (!formConfiguration) {
        res.status(404).json({
          success: false,
          message: 'Form configuration not found'
        });
        return;
      }

      // Increment usage count when configuration is accessed
      await formConfigurationService.incrementUsageCount(configId);

      res.status(200).json({
        success: true,
        message: 'Form configuration retrieved successfully',
        data: formConfiguration
      });
    } catch (error: any) {
      console.error('Error fetching form configuration by config ID:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch form configuration',
        error: error.message
      });
    }
  }

  // Get form configurations by user ID
  async getFormConfigurationsByUserId(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      const formConfigurations = await formConfigurationService.getFormConfigurationsByUserId(userId);
      
      res.status(200).json({
        success: true,
        message: 'Form configurations retrieved successfully',
        data: formConfigurations
      });
    } catch (error: any) {
      console.error('Error fetching form configurations by user ID:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch form configurations',
        error: error.message
      });
    }
  }

  // Get form configurations by type
  async getFormConfigurationsByType(req: Request, res: Response): Promise<void> {
    try {
      const { formType } = req.params;
      
      const formConfigurations = await formConfigurationService.getFormConfigurationsByType(formType);
      
      res.status(200).json({
        success: true,
        message: `Form configurations for type '${formType}' retrieved successfully`,
        data: formConfigurations
      });
    } catch (error: any) {
      console.error('Error fetching form configurations by type:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch form configurations',
        error: error.message
      });
    }
  }

  // Get all form configurations
  async getAllFormConfigurations(req: Request, res: Response): Promise<void> {
    try {
      const filters = req.query;
      
      const formConfigurations = await formConfigurationService.getAllFormConfigurations(filters);
      
      res.status(200).json({
        success: true,
        message: 'All form configurations retrieved successfully',
        data: formConfigurations
      });
    } catch (error: any) {
      console.error('Error fetching all form configurations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch form configurations',
        error: error.message
      });
    }
  }

  // Update form configuration
  async updateFormConfiguration(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateFormConfigurationRequest = req.body;
      
      // Validate sections structure if provided
      if (data.sections) {
        if (!Array.isArray(data.sections) || data.sections.length === 0) {
          res.status(400).json({
            success: false,
            message: 'Sections must be a non-empty array'
          });
          return;
        }

        // Validate each section
        for (const section of data.sections) {
          if (!section.id || !section.title || !Array.isArray(section.fields)) {
            res.status(400).json({
              success: false,
              message: 'Each section must have id, title, and fields array'
            });
            return;
          }

          // Validate fields in each section
          for (const field of section.fields) {
            if (!field.id || !field.name || !field.label || !field.type) {
              res.status(400).json({
                success: false,
                message: 'Each field must have id, name, label, and type'
              });
              return;
            }
          }
        }
      }
      
      const updatedFormConfiguration = await formConfigurationService.updateFormConfiguration(id, data);
      
      if (!updatedFormConfiguration) {
        res.status(404).json({
          success: false,
          message: 'Form configuration not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Form configuration updated successfully',
        data: updatedFormConfiguration
      });
    } catch (error: any) {
      console.error('Error updating form configuration:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update form configuration',
        error: error.message
      });
    }
  }

  // Delete form configuration
  async deleteFormConfiguration(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const deleted = await formConfigurationService.deleteFormConfiguration(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Form configuration not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Form configuration deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting form configuration:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete form configuration',
        error: error.message
      });
    }
  }

  // Toggle form configuration status (activate/deactivate)
  async toggleFormConfigurationStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { is_active } = req.body;
      
      if (typeof is_active !== 'boolean') {
        res.status(400).json({
          success: false,
          message: 'is_active must be a boolean value'
        });
        return;
      }
      
      const updatedFormConfiguration = await formConfigurationService.toggleFormConfigurationStatus(id, is_active);
      
      if (!updatedFormConfiguration) {
        res.status(404).json({
          success: false,
          message: 'Form configuration not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: `Form configuration ${is_active ? 'activated' : 'deactivated'} successfully`,
        data: updatedFormConfiguration
      });
    } catch (error: any) {
      console.error('Error toggling form configuration status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle form configuration status',
        error: error.message
      });
    }
  }

  // Get usage statistics
  async getUsageStatistics(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.query;
      
      const statistics = await formConfigurationService.getUsageStatistics(userId as string);
      
      res.status(200).json({
        success: true,
        message: 'Usage statistics retrieved successfully',
        data: statistics
      });
    } catch (error: any) {
      console.error('Error fetching usage statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch usage statistics',
        error: error.message
      });
    }
  }

  // Clone form configuration
  async cloneFormConfiguration(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
        return;
      }

      if (!name) {
        res.status(400).json({
          success: false,
          message: 'Name is required for the cloned configuration'
        });
        return;
      }
      
      const clonedFormConfiguration = await formConfigurationService.cloneFormConfiguration(id, name, userId);
      
      res.status(201).json({
        success: true,
        message: 'Form configuration cloned successfully',
        data: clonedFormConfiguration
      });
    } catch (error: any) {
      console.error('Error cloning form configuration:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clone form configuration',
        error: error.message
      });
    }
  }
} 