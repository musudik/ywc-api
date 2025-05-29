import { pool } from '../config/db';
import { Asset } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class AssetService {
  
  // Create new asset
  async createAsset(data: Omit<Asset, 'asset_id' | 'created_at' | 'updated_at'>): Promise<Asset> {
    const assetId = uuidv4();
    
    const query = `
      INSERT INTO assets (
        asset_id, user_id, real_estate, securities, bank_deposits,
        building_savings, insurance_values, other_assets
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      assetId,
      data.user_id,
      data.real_estate || 0,
      data.securities || 0,
      data.bank_deposits || 0,
      data.building_savings || 0,
      data.insurance_values || 0,
      data.other_assets || 0
    ];

    try {
      const result = await pool.query(query, values);
      return this.mapRowToAsset(result.rows[0]);
    } catch (error: any) {
      console.error('Error creating asset:', error);
      throw new Error(`Failed to create asset: ${error.message}`);
    }
  }
  
  // Get asset by ID
  async getAssetById(assetId: string): Promise<Asset | null> {
    const query = 'SELECT * FROM assets WHERE asset_id = $1';
    
    try {
      const result = await pool.query(query, [assetId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRowToAsset(result.rows[0]);
    } catch (error: any) {
      console.error('Error fetching asset:', error);
      throw new Error('Failed to fetch asset');
    }
  }
  
  // Get assets by user ID
  async getAssetsByUserId(userId: string): Promise<Asset[]> {
    const query = 'SELECT * FROM assets WHERE user_id = $1 ORDER BY created_at DESC';
    
    try {
      const result = await pool.query(query, [userId]);
      return result.rows.map(row => this.mapRowToAsset(row));
    } catch (error: any) {
      console.error('Error fetching assets by user ID:', error);
      throw new Error('Failed to fetch assets');
    }
  }
  
  // Get all assets
  async getAllAssets(): Promise<Asset[]> {
    const query = 'SELECT * FROM assets ORDER BY created_at DESC';
    
    try {
      const result = await pool.query(query);
      return result.rows.map(row => this.mapRowToAsset(row));
    } catch (error: any) {
      console.error('Error fetching all assets:', error);
      throw new Error('Failed to fetch assets');
    }
  }
  
  // Update asset by asset ID
  async updateAsset(
    assetId: string, 
    data: Partial<Omit<Asset, 'asset_id' | 'created_at' | 'updated_at'>>
  ): Promise<Asset | null> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    
    // Build dynamic update query
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });
    
    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }
    
    const query = `
      UPDATE assets 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE asset_id = $${paramCount}
      RETURNING *
    `;
    
    values.push(assetId);
    
    try {
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRowToAsset(result.rows[0]);
    } catch (error: any) {
      console.error('Error updating asset:', error);
      throw new Error(`Failed to update asset: ${error.message}`);
    }
  }

  // Update asset by user ID
  async updateAssetByUserId(
    userId: string, 
    data: Partial<Omit<Asset, 'asset_id' | 'created_at' | 'updated_at'>>
  ): Promise<Asset | null> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    
    // Build dynamic update query
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });
    
    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }
    
    const query = `
      UPDATE assets 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $${paramCount}
      RETURNING *
    `;
    
    values.push(userId);
    
    try {
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRowToAsset(result.rows[0]);
    } catch (error: any) {
      console.error('Error updating asset by user ID:', error);
      throw new Error(`Failed to update asset: ${error.message}`);
    }
  }
  
  // Delete asset by asset ID
  async deleteAsset(assetId: string): Promise<boolean> {
    const query = 'DELETE FROM assets WHERE asset_id = $1';
    
    try {
      const result = await pool.query(query, [assetId]);
      return (result.rowCount ?? 0) > 0;
    } catch (error: any) {
      console.error('Error deleting asset:', error);
      throw new Error('Failed to delete asset');
    }
  }

  // Delete asset by user ID
  async deleteAssetByUserId(userId: string): Promise<boolean> {
    const query = 'DELETE FROM assets WHERE user_id = $1';
    
    try {
      const result = await pool.query(query, [userId]);
      return (result.rowCount ?? 0) > 0;
    } catch (error: any) {
      console.error('Error deleting asset by user ID:', error);
      throw new Error('Failed to delete asset');
    }
  }
  
  // Helper method to map database row to Asset interface
  private mapRowToAsset(row: any): Asset {
    return {
      asset_id: row.asset_id,
      user_id: row.user_id,
      real_estate: parseFloat(row.real_estate) || 0,
      securities: parseFloat(row.securities) || 0,
      bank_deposits: parseFloat(row.bank_deposits) || 0,
      building_savings: parseFloat(row.building_savings) || 0,
      insurance_values: parseFloat(row.insurance_values) || 0,
      other_assets: parseFloat(row.other_assets) || 0,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
} 