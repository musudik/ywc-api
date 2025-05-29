import { pool } from '../config/db';
import { EmploymentDetails } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class EmploymentService {
  
  // Create new employment details
  async createEmploymentDetails(data: Omit<EmploymentDetails, 'employment_id' | 'created_at' | 'updated_at'>): Promise<EmploymentDetails> {
    const employmentId = uuidv4();
    
    const query = `
      INSERT INTO employment_details (
        employment_id, user_id, employment_type, occupation,
        contract_type, contract_duration, employer_name, employed_since
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      employmentId,
      data.user_id,
      data.employment_type,
      data.occupation,
      data.contract_type || null,
      data.contract_duration || null,
      data.employer_name || null,
      data.employed_since || null
    ];

    try {
      const result = await pool.query(query, values);
      return this.mapRowToEmploymentDetails(result.rows[0]);
    } catch (error: any) {
      console.error('Error creating employment details:', error);
      throw new Error(`Failed to create employment details: ${error.message}`);
    }
  }
  
  // Get employment details by employment ID
  async getEmploymentDetailsById(employmentId: string): Promise<EmploymentDetails | null> {
    const query = 'SELECT * FROM employment_details WHERE user_id = $1';
    
    try {
      const result = await pool.query(query, [employmentId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRowToEmploymentDetails(result.rows[0]);
    } catch (error) {
      console.error('Error fetching employment details by ID:', error);
      throw new Error('Failed to fetch employment details');
    }
  }
  
  // Get employment details by user ID
  async getEmploymentDetailsByUserId(userId: string): Promise<EmploymentDetails[]> {
    const query = 'SELECT * FROM employment_details WHERE user_id = $1 ORDER BY created_at DESC';
    
    try {
      const result = await pool.query(query, [userId]);
      return result.rows.map(row => this.mapRowToEmploymentDetails(row));
    } catch (error) {
      console.error('Error fetching employment details by user ID:', error);
      throw new Error('Failed to fetch employment details');
    }
  }
  
  // Get all employment details
  async getAllEmploymentDetails(): Promise<EmploymentDetails[]> {
    const query = 'SELECT * FROM employment_details ORDER BY created_at DESC';
    
    try {
      const result = await pool.query(query);
      return result.rows.map(row => this.mapRowToEmploymentDetails(row));
    } catch (error) {
      console.error('Error fetching all employment details:', error);
      throw new Error('Failed to fetch employment details');
    }
  }
  
  // Update employment details by employment ID
  async updateEmploymentDetails(
    employmentId: string, 
    data: Partial<Omit<EmploymentDetails, 'employment_id' | 'created_at' | 'updated_at'>>
  ): Promise<EmploymentDetails | null> {
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
      UPDATE employment_details 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE employment_id = $${paramCount}
      RETURNING *
    `;
    
    values.push(employmentId);
    
    try {
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRowToEmploymentDetails(result.rows[0]);
    } catch (error: any) {
      console.error('Error updating employment details:', error);
      throw new Error(`Failed to update employment details: ${error.message}`);
    }
  }

  // Update employment details by user ID
  async updateEmploymentDetailsByUserId(
    userId: string, 
    data: Partial<Omit<EmploymentDetails, 'employment_id' | 'created_at' | 'updated_at'>>
  ): Promise<EmploymentDetails | null> {
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
      UPDATE employment_details 
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
      
      return this.mapRowToEmploymentDetails(result.rows[0]);
    } catch (error: any) {
      console.error('Error updating employment details by user ID:', error);
      throw new Error(`Failed to update employment details: ${error.message}`);
    }
  }
  
  // Delete employment details by employment ID
  async deleteEmploymentDetails(employmentId: string): Promise<boolean> {
    const query = 'DELETE FROM employment_details WHERE employment_id = $1';
    
    try {
      const result = await pool.query(query, [employmentId]);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error deleting employment details:', error);
      throw new Error('Failed to delete employment details');
    }
  }

  // Delete employment details by user ID
  async deleteEmploymentDetailsByUserId(userId: string): Promise<boolean> {
    const query = 'DELETE FROM employment_details WHERE user_id = $1';
    
    try {
      const result = await pool.query(query, [userId]);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error deleting employment details by user ID:', error);
      throw new Error('Failed to delete employment details');
    }
  }
  
  // Helper method to map database row to EmploymentDetails interface
  private mapRowToEmploymentDetails(row: any): EmploymentDetails {
    return {
      employment_id: row.employment_id,
      user_id: row.user_id,
      employment_type: row.employment_type,
      occupation: row.occupation,
      contract_type: row.contract_type,
      contract_duration: row.contract_duration,
      employer_name: row.employer_name,
      employed_since: row.employed_since,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
} 