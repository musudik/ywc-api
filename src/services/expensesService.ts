import { pool } from '../config/db';
import { ExpensesDetails } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class ExpensesService {
  
  // Create new expenses details
  async createExpensesDetails(data: Omit<ExpensesDetails, 'expenses_id' | 'created_at' | 'updated_at'>): Promise<ExpensesDetails> {
    const expensesId = uuidv4();
    
    const query = `
      INSERT INTO expenses_details (
        expenses_id, user_id, cold_rent, electricity, living_expenses, gas,
        telecommunication, account_maintenance_fee, alimony, subscriptions, other_expenses
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      expensesId,
      data.user_id,
      data.cold_rent || 0,
      data.electricity || 0,
      data.living_expenses || 0,
      data.gas || 0,
      data.telecommunication || 0,
      data.account_maintenance_fee || 0,
      data.alimony || 0,
      data.subscriptions || 0,
      data.other_expenses || 0
    ];

    try {
      const result = await pool.query(query, values);
      return this.mapRowToExpensesDetails(result.rows[0]);
    } catch (error: any) {
      console.error('Error creating expenses details:', error);
      throw new Error(`Failed to create expenses details: ${error.message}`);
    }
  }
  
  // Get expenses details by ID
  async getExpensesDetailsById(expensesId: string): Promise<ExpensesDetails | null> {
    const query = 'SELECT * FROM expenses_details WHERE user_id = $1';
    
    try {
      const result = await pool.query(query, [expensesId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRowToExpensesDetails(result.rows[0]);
    } catch (error: any) {
      console.error('Error fetching expenses details:', error);
      throw new Error('Failed to fetch expenses details');
    }
  }
  
  // Get expenses details by user ID
  async getExpensesDetailsByUserId(userId: string): Promise<ExpensesDetails[]> {
    const query = 'SELECT * FROM expenses_details WHERE user_id = $1 ORDER BY created_at DESC';
    
    try {
      const result = await pool.query(query, [userId]);
      return result.rows.map(row => this.mapRowToExpensesDetails(row));
    } catch (error: any) {
      console.error('Error fetching expenses details by user ID:', error);
      throw new Error('Failed to fetch expenses details');
    }
  }
  
  // Get all expenses details
  async getAllExpensesDetails(): Promise<ExpensesDetails[]> {
    const query = 'SELECT * FROM expenses_details ORDER BY created_at DESC';
    
    try {
      const result = await pool.query(query);
      return result.rows.map(row => this.mapRowToExpensesDetails(row));
    } catch (error: any) {
      console.error('Error fetching all expenses details:', error);
      throw new Error('Failed to fetch expenses details');
    }
  }
  
  // Update expenses details by expenses ID
  async updateExpensesDetails(
    expensesId: string, 
    data: Partial<Omit<ExpensesDetails, 'expenses_id' | 'created_at' | 'updated_at'>>
  ): Promise<ExpensesDetails | null> {
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
      UPDATE expenses_details 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE expenses_id = $${paramCount}
      RETURNING *
    `;
    
    values.push(expensesId);
    
    try {
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRowToExpensesDetails(result.rows[0]);
    } catch (error: any) {
      console.error('Error updating expenses details:', error);
      throw new Error(`Failed to update expenses details: ${error.message}`);
    }
  }

  // Update expenses details by user ID
  async updateExpensesDetailsByUserId(
    userId: string, 
    data: Partial<Omit<ExpensesDetails, 'expenses_id' | 'created_at' | 'updated_at'>>
  ): Promise<ExpensesDetails | null> {
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
      UPDATE expenses_details 
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
      
      return this.mapRowToExpensesDetails(result.rows[0]);
    } catch (error: any) {
      console.error('Error updating expenses details by user ID:', error);
      throw new Error(`Failed to update expenses details: ${error.message}`);
    }
  }
  
  // Delete expenses details by expenses ID
  async deleteExpensesDetails(expensesId: string): Promise<boolean> {
    const query = 'DELETE FROM expenses_details WHERE expenses_id = $1';
    
    try {
      const result = await pool.query(query, [expensesId]);
      return (result.rowCount ?? 0) > 0;
    } catch (error: any) {
      console.error('Error deleting expenses details:', error);
      throw new Error('Failed to delete expenses details');
    }
  }

  // Delete expenses details by user ID
  async deleteExpensesDetailsByUserId(userId: string): Promise<boolean> {
    const query = 'DELETE FROM expenses_details WHERE user_id = $1';
    
    try {
      const result = await pool.query(query, [userId]);
      return (result.rowCount ?? 0) > 0;
    } catch (error: any) {
      console.error('Error deleting expenses details by user ID:', error);
      throw new Error('Failed to delete expenses details');
    }
  }
  
  // Helper method to map database row to ExpensesDetails interface
  private mapRowToExpensesDetails(row: any): ExpensesDetails {
    return {
      expenses_id: row.expenses_id,
      user_id: row.user_id,
      cold_rent: parseFloat(row.cold_rent) || 0,
      electricity: parseFloat(row.electricity) || 0,
      living_expenses: parseFloat(row.living_expenses) || 0,
      gas: parseFloat(row.gas) || 0,
      telecommunication: parseFloat(row.telecommunication) || 0,
      account_maintenance_fee: parseFloat(row.account_maintenance_fee) || 0,
      alimony: parseFloat(row.alimony) || 0,
      subscriptions: parseFloat(row.subscriptions) || 0,
      other_expenses: parseFloat(row.other_expenses) || 0,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
} 