import { pool } from '../config/db';
import { IncomeDetails } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class IncomeService {
  
  // Create new income details
  async createIncomeDetails(data: Omit<IncomeDetails, 'income_id' | 'created_at' | 'updated_at'>): Promise<IncomeDetails> {
    const incomeId = uuidv4();
    
    const query = `
      INSERT INTO income_details (
        income_id, user_id, gross_income, net_income, tax_class, tax_id,
        number_of_salaries, child_benefit, other_income, income_trade_business,
        income_self_employed_work, income_side_job
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const values = [
      incomeId,
      data.user_id,
      data.gross_income || 0,
      data.net_income || 0,
      data.tax_class,
      data.tax_id || null,
      data.number_of_salaries || 12,
      data.child_benefit || 0,
      data.other_income || 0,
      data.income_trade_business || 0,
      data.income_self_employed_work || 0,
      data.income_side_job || 0
    ];

    try {
      const result = await pool.query(query, values);
      return this.mapRowToIncomeDetails(result.rows[0]);
    } catch (error: any) {
      console.error('Error creating income details:', error);
      throw new Error(`Failed to create income details: ${error.message}`);
    }
  }
  
  // Get income details by ID
  async getIncomeDetailsById(incomeId: string): Promise<IncomeDetails | null> {
    const query = 'SELECT * FROM income_details WHERE user_id = $1';  
    
    try {
      const result = await pool.query(query, [incomeId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRowToIncomeDetails(result.rows[0]);
    } catch (error: any) {
      console.error('Error fetching income details:', error);
      throw new Error('Failed to fetch income details');
    }
  }
  
  // Get income details by user ID
  async getIncomeDetailsByUserId(userId: string): Promise<IncomeDetails[]> {
    const query = 'SELECT * FROM income_details WHERE user_id = $1 ORDER BY created_at DESC';
    
    try {
      const result = await pool.query(query, [userId]);
      return result.rows.map(row => this.mapRowToIncomeDetails(row));
    } catch (error: any) {
      console.error('Error fetching income details by user ID:', error);
      throw new Error('Failed to fetch income details');
    }
  }
  
  // Get all income details
  async getAllIncomeDetails(): Promise<IncomeDetails[]> {
    const query = 'SELECT * FROM income_details ORDER BY created_at DESC';
    
    try {
      const result = await pool.query(query);
      return result.rows.map(row => this.mapRowToIncomeDetails(row));
    } catch (error: any) {
      console.error('Error fetching all income details:', error);
      throw new Error('Failed to fetch income details');
    }
  }
  
  // Update income details by income ID
  async updateIncomeDetails(
    incomeId: string, 
    data: Partial<Omit<IncomeDetails, 'income_id' | 'created_at' | 'updated_at'>>
  ): Promise<IncomeDetails | null> {
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
      UPDATE income_details 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE income_id = $${paramCount}
      RETURNING *
    `;
    
    values.push(incomeId);
    
    try {
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRowToIncomeDetails(result.rows[0]);
    } catch (error: any) {
      console.error('Error updating income details:', error);
      throw new Error(`Failed to update income details: ${error.message}`);
    }
  }

  // Update income details by user ID
  async updateIncomeDetailsByUserId(
    userId: string, 
    data: Partial<Omit<IncomeDetails, 'income_id' | 'created_at' | 'updated_at'>>
  ): Promise<IncomeDetails | null> {
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
      UPDATE income_details 
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
      
      return this.mapRowToIncomeDetails(result.rows[0]);
    } catch (error: any) {
      console.error('Error updating income details by user ID:', error);
      throw new Error(`Failed to update income details: ${error.message}`);
    }
  }
  
  // Delete income details by income ID
  async deleteIncomeDetails(incomeId: string): Promise<boolean> {
    const query = 'DELETE FROM income_details WHERE income_id = $1';
    
    try {
      const result = await pool.query(query, [incomeId]);
      return (result.rowCount ?? 0) > 0;
    } catch (error: any) {
      console.error('Error deleting income details:', error);
      throw new Error('Failed to delete income details');
    }
  }

  // Delete income details by user ID
  async deleteIncomeDetailsByUserId(userId: string): Promise<boolean> {
    const query = 'DELETE FROM income_details WHERE user_id = $1';
    
    try {
      const result = await pool.query(query, [userId]);
      return (result.rowCount ?? 0) > 0;
    } catch (error: any) {
      console.error('Error deleting income details by user ID:', error);
      throw new Error('Failed to delete income details');
    }
  }
  
  // Helper method to map database row to IncomeDetails interface
  private mapRowToIncomeDetails(row: any): IncomeDetails {
    return {
      income_id: row.income_id,
      user_id: row.user_id,
      gross_income: parseFloat(row.gross_income) || 0,
      net_income: parseFloat(row.net_income) || 0,
      tax_class: row.tax_class,
      tax_id: row.tax_id,
      number_of_salaries: row.number_of_salaries || 12,
      child_benefit: parseFloat(row.child_benefit) || 0,
      other_income: parseFloat(row.other_income) || 0,
      income_trade_business: parseFloat(row.income_trade_business) || 0,
      income_self_employed_work: parseFloat(row.income_self_employed_work) || 0,
      income_side_job: parseFloat(row.income_side_job) || 0,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
} 