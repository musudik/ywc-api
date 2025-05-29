import { pool } from '../config/db';
import { PersonalDetails } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class PersonalDetailsService {
  
  // Create new personal details
  async createPersonalDetails(data: any): Promise<PersonalDetails> {
    const personalId = uuidv4();
    
    const query = `
      INSERT INTO personal_details (
        personal_id, user_id, coach_id, applicant_type, salutation, first_name, last_name, 
        street, house_number, postal_code, city, email, phone, whatsapp, marital_status, 
        birth_date, birth_place, nationality, residence_permit, eu_citizen, tax_id, iban, housing
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
      RETURNING *
    `;
    
    const values = [
      personalId,
      data.user_id,
      data.coach_id || data.coach_user_id, // Support both field names for backward compatibility
      data.applicant_type,
      data.salutation,
      data.first_name,
      data.last_name,
      data.street,
      data.house_number,
      data.postal_code,
      data.city,
      data.email,
      data.phone,
      data.whatsapp || null,
      data.marital_status,
      data.birth_date,
      data.birth_place,
      data.nationality,
      data.residence_permit || null,
      data.eu_citizen,
      data.tax_id || null,
      data.iban || null,
      data.housing || null
    ];
    
    try {
      const result = await pool.query(query, values);
      return this.mapRowToPersonalDetails(result.rows[0]);
    } catch (error: any) {
      throw new Error(`Failed to create personal details: ${error.message}`);
    }
  }
  
  // Get personal details by ID
  async getPersonalDetailsById(personalId: string): Promise<PersonalDetails | null> {
    const query = 'SELECT * FROM personal_details WHERE user_id = $1';
    
    try {
      const result = await pool.query(query, [personalId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRowToPersonalDetails(result.rows[0]);
    } catch (error: any) {
      throw new Error(`Failed to get personal details: ${error.message}`);
    }
  }

  // Get personal details by user ID
  async getPersonalDetailsByUserId(userId: string): Promise<PersonalDetails | null> {
    const query = 'SELECT * FROM personal_details WHERE user_id = $1';
    
    try {
      const result = await pool.query(query, [userId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRowToPersonalDetails(result.rows[0]);
    } catch (error: any) {
      throw new Error(`Failed to get personal details by user ID: ${error.message}`);
    }
  }
  
  // Get all personal details with optional filters
  async getAllPersonalDetails(filters?: any): Promise<PersonalDetails[]> {
    let query = 'SELECT * FROM personal_details';
    const values: any[] = [];
    const conditions: string[] = [];
    
    if (filters) {
      if (filters.applicant_type) {
        conditions.push(`applicant_type = $${conditions.length + 1}`);
        values.push(filters.applicant_type);
      }
      if (filters.marital_status) {
        conditions.push(`marital_status = $${conditions.length + 1}`);
        values.push(filters.marital_status);
      }
    }
    
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    query += ' ORDER BY created_at DESC';
    
    try {
      const result = await pool.query(query, values);
      return result.rows.map(row => this.mapRowToPersonalDetails(row));
    } catch (error: any) {
      throw new Error(`Failed to get all personal details: ${error.message}`);
    }
  }
  
  // Get personal details by coach ID
  async getPersonalDetailsByCoachId(coachId: string): Promise<PersonalDetails[]> {
    const query = 'SELECT * FROM personal_details WHERE coach_id = $1 ORDER BY created_at DESC';
    
    try {
      const result = await pool.query(query, [coachId]);
      return result.rows.map(row => this.mapRowToPersonalDetails(row));
    } catch (error: any) {
      throw new Error(`Failed to get personal details by coach: ${error.message}`);
    }
  }
  
  // Update personal details by personal ID
  async updatePersonalDetails(
    personalId: string, 
    data: Partial<Omit<PersonalDetails, 'personal_id' | 'created_at' | 'updated_at'>>
  ): Promise<PersonalDetails | null> {
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
      UPDATE personal_details 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE personal_id = $${paramCount}
      RETURNING *
    `;
    
    values.push(personalId);
    
    try {
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRowToPersonalDetails(result.rows[0]);
    } catch (error: any) {
      throw new Error(`Failed to update personal details: ${error.message}`);
    }
  }

  // Update personal details by user ID
  async updatePersonalDetailsByUserId(
    userId: string, 
    data: any
  ): Promise<PersonalDetails | null> {
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
      UPDATE personal_details 
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
      
      return this.mapRowToPersonalDetails(result.rows[0]);
    } catch (error: any) {
      throw new Error(`Failed to update personal details: ${error.message}`);
    }
  }
  
  // Delete personal details by personal ID
  async deletePersonalDetails(personalId: string): Promise<boolean> {
    const query = 'DELETE FROM personal_details WHERE personal_id = $1';
    
    try {
      const result = await pool.query(query, [personalId]);
      return (result.rowCount ?? 0) > 0;
    } catch (error: any) {
      console.error('Error deleting personal details:', error);
      throw new Error('Failed to delete personal details');
    }
  }

  // Delete personal details by user ID
  async deletePersonalDetailsByUserId(userId: string): Promise<boolean> {
    const query = 'DELETE FROM personal_details WHERE user_id = $1';
    
    try {
      const result = await pool.query(query, [userId]);
      return (result.rowCount ?? 0) > 0;
    } catch (error: any) {
      console.error('Error deleting personal details:', error);
      throw new Error('Failed to delete personal details');
    }
  }
  
  // Helper method to map database row to PersonalDetails interface
  private mapRowToPersonalDetails(row: any): PersonalDetails {
    return {
      personal_id: row.personal_id,
      user_id: row.user_id,
      coach_id: row.coach_id || row.coach_user_id, // Support both old and new column names
      applicant_type: row.applicant_type,
      salutation: row.salutation,
      first_name: row.first_name,
      last_name: row.last_name,
      street: row.street,
      house_number: row.house_number,
      postal_code: row.postal_code,
      city: row.city,
      email: row.email,
      phone: row.phone,
      whatsapp: row.whatsapp,
      marital_status: row.marital_status,
      birth_date: row.birth_date,
      birth_place: row.birth_place,
      nationality: row.nationality,
      residence_permit: row.residence_permit,
      eu_citizen: row.eu_citizen,
      tax_id: row.tax_id,
      iban: row.iban,
      housing: row.housing,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
}

// Default export
export default PersonalDetailsService;