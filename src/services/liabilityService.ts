import { pool } from '../config/db';
import { Liability } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class LiabilityService {
  
  // Create new liability
  async createLiability(data: Omit<Liability, 'liability_id' | 'created_at' | 'updated_at'>): Promise<Liability> {
    const liabilityId = uuidv4();
    
    const query = `
      INSERT INTO liabilities (
        liability_id, user_id, loan_type, loan_bank, loan_amount,
        loan_monthly_rate, loan_interest
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      liabilityId,
      data.user_id,
      data.loan_type || null,
      data.loan_bank || null,
      data.loan_amount || null,
      data.loan_monthly_rate || null,
      data.loan_interest || null
    ];

    try {
      const result = await pool.query(query, values);
      return this.mapRowToLiability(result.rows[0]);
    } catch (error: any) {
      console.error('Error creating liability:', error);
      throw new Error(`Failed to create liability: ${error.message}`);
    }
  }
  
  // Get liability by ID
  async getLiabilityById(userId: string): Promise<Liability[] | null> {
    const query = 'SELECT * FROM liabilities WHERE user_id = $1';
   
    try {
      const result = await pool.query(query, [userId]);
      console.log("getLiabilityById", result.rows);
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows.map(row => this.mapRowToLiability(row));
    } catch (error: any) {
      console.error('Error fetching liability:', error);
      throw new Error('Failed to fetch liability');
    }
  }
  
  // Get liabilities by user ID
  async getLiabilitiesByUserId(userId: string): Promise<Liability[]> {
    const query = 'SELECT * FROM liabilities WHERE user_id = $1 ORDER BY created_at DESC';
    
    try {
      const result = await pool.query(query, [userId]);
      console.log("getLiabilitiesByUserId", result.rows);
      return result.rows.map(row => this.mapRowToLiability(row));
    } catch (error: any) {
      console.error('Error fetching liabilities by user ID:', error);
      throw new Error('Failed to fetch liabilities');
    }
  }
  
  // Get all liabilities
  async getAllLiabilities(): Promise<Liability[]> {
    const query = 'SELECT * FROM liabilities ORDER BY created_at DESC';
    
    try {
      const result = await pool.query(query);
      return result.rows.map(row => this.mapRowToLiability(row));
    } catch (error: any) {
      console.error('Error fetching all liabilities:', error);
      throw new Error('Failed to fetch liabilities');
    }
  }
  
  // Update liability by liability ID
  async updateLiability(
    liabilityId: string, 
    data: Partial<Omit<Liability, 'liability_id' | 'created_at' | 'updated_at'>>
  ): Promise<Liability | null> {
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
      UPDATE liabilities 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE liability_id = $${paramCount}
      RETURNING *
    `;
    
    values.push(liabilityId);
    
    try {
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRowToLiability(result.rows[0]);
    } catch (error: any) {
      console.error('Error updating liability:', error);
      throw new Error(`Failed to update liability: ${error.message}`);
    }
  }

  // Update liability by user ID
  async updateLiabilityByUserId(
    userId: string, 
    data: Partial<Omit<Liability, 'liability_id' | 'created_at' | 'updated_at'>>
  ): Promise<Liability | null> {
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
      UPDATE liabilities 
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
      
      return this.mapRowToLiability(result.rows[0]);
    } catch (error: any) {
      console.error('Error updating liability by user ID:', error);
      throw new Error(`Failed to update liability: ${error.message}`);
    }
  }
  
  // Delete liability by liability ID
  async deleteLiability(liabilityId: string): Promise<boolean> {
    const query = 'DELETE FROM liabilities WHERE liability_id = $1';
    
    try {
      const result = await pool.query(query, [liabilityId]);
      return (result.rowCount ?? 0) > 0;
    } catch (error: any) {
      console.error('Error deleting liability:', error);
      throw new Error('Failed to delete liability');
    }
  }

  // Delete liability by user ID
  async deleteLiabilityByUserId(userId: string): Promise<boolean> {
    const query = 'DELETE FROM liabilities WHERE user_id = $1';
    
    try {
      const result = await pool.query(query, [userId]);
      return (result.rowCount ?? 0) > 0;
    } catch (error: any) {
      console.error('Error deleting liability by user ID:', error);
      throw new Error('Failed to delete liability');
    }
  }
  
  // Helper method to map database row to Liability interface
  private mapRowToLiability(row: any): Liability {
    return {
      liability_id: row.liability_id,
      user_id: row.user_id,
      loan_type: row.loan_type,
      loan_bank: row.loan_bank,
      loan_amount: row.loan_amount ? parseFloat(row.loan_amount) : undefined,
      loan_monthly_rate: row.loan_monthly_rate ? parseFloat(row.loan_monthly_rate) : undefined,
      loan_interest: row.loan_interest ? parseFloat(row.loan_interest) : undefined,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
} 