import { Request, Response } from 'express';
import { AssetService } from '../services/assetService';

const assetService = new AssetService();

export class AssetController {
  
  // Create new asset
  async createAsset(req: Request, res: Response): Promise<void> {
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

      const asset = await assetService.createAsset(data);
      
      res.status(201).json({
        success: true,
        message: 'Asset created successfully',
        data: asset
      });
    } catch (error: any) {
      console.error('Error creating asset:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create asset',
        error: error.message
      });
    }
  }

  // Get asset by ID
  async getAssetById(req: Request, res: Response): Promise<void> {
    try {
      const { assetId } = req.params;
      
      const asset = await assetService.getAssetById(assetId);
      
      if (!asset) {
        res.status(404).json({
          success: false,
          message: 'Asset not found'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Asset retrieved successfully',
        data: asset
      });
    } catch (error: any) {
      console.error('Error fetching asset:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch asset',
        error: error.message
      });
    }
  }

  // Get assets by user ID
  async getAssetsByUserId(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      const assets = await assetService.getAssetsByUserId(userId);
      
      res.status(200).json({
        success: true,
        message: 'Assets retrieved successfully',
        data: assets
      });
    } catch (error: any) {
      console.error('Error fetching assets by user ID:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch assets',
        error: error.message
      });
    }
  }

  // Get all assets
  async getAllAssets(req: Request, res: Response): Promise<void> {
    try {
      const assets = await assetService.getAllAssets();
      
      res.status(200).json({
        success: true,
        message: 'All assets retrieved successfully',
        data: assets
      });
    } catch (error: any) {
      console.error('Error fetching all assets:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch assets',
        error: error.message
      });
    }
  }

  // Update asset by asset ID
  async updateAsset(req: Request, res: Response): Promise<void> {
    try {
      const { assetId } = req.params;
      const data = req.body;
      
      const asset = await assetService.updateAsset(assetId, data);
      
      if (!asset) {
        res.status(404).json({
          success: false,
          message: 'Asset not found'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Asset updated successfully',
        data: asset
      });
    } catch (error: any) {
      console.error('Error updating asset:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update asset',
        error: error.message
      });
    }
  }

  // Update asset by user ID
  async updateAssetByUserId(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const data = req.body;
      
      const asset = await assetService.updateAssetByUserId(userId, data);
      
      if (!asset) {
        res.status(404).json({
          success: false,
          message: 'Asset not found for this user'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Asset updated successfully',
        data: asset
      });
    } catch (error: any) {
      console.error('Error updating asset by user ID:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update asset',
        error: error.message
      });
    }
  }

  // Delete asset by asset ID
  async deleteAsset(req: Request, res: Response): Promise<void> {
    try {
      const { assetId } = req.params;
      
      const deleted = await assetService.deleteAsset(assetId);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Asset not found'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Asset deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting asset:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete asset',
        error: error.message
      });
    }
  }

  // Delete asset by user ID
  async deleteAssetByUserId(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      const deleted = await assetService.deleteAssetByUserId(userId);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'No assets found for this user'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Assets deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting assets by user ID:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete assets',
        error: error.message
      });
    }
  }
} 