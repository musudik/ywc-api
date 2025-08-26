import { pool } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

export interface OnlineRegistration {
  id: string;
  applicant_type: string;
  salutation?: string;
  first_name: string;
  last_name: string;
  street?: string;
  house_number?: string;
  postal_code?: string;
  city?: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  marital_status?: string;
  birth_date?: string;
  birth_place?: string;
  nationality?: string;
  residence_permit?: string;
  eu_citizen?: boolean;
  tax_id?: string;
  iban?: string;
  housing?: string;
  coach?: string;
  registration_data?: any;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export class OnlineRegistrationService {
  
  // Create new online registration
  async createRegistration(data: any): Promise<OnlineRegistration> {
    const registrationId = uuidv4();
    
    const query = `
      INSERT INTO online_registrations (
        id, applicant_type, salutation, first_name, last_name, 
        street, house_number, postal_code, city, email, phone, whatsapp, 
        marital_status, birth_date, birth_place, nationality, residence_permit, 
        eu_citizen, tax_id, iban, housing, coach, registration_data, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
      RETURNING *
    `;
    
    const values = [
      registrationId,
      data.applicant_type || 'PrimaryApplicant',
      data.salutation || null,
      data.first_name,
      data.last_name,
      data.street || null,
      data.house_number || null,
      data.postal_code || null,
      data.city || null,
      data.email,
      data.phone || null,
      data.whatsapp || null,
      data.marital_status || null,
      data.birth_date || null,
      data.birth_place || null,
      data.nationality || null,
      data.residence_permit || null,
      data.eu_citizen || false,
      data.tax_id || null,
      data.iban || null,
      data.housing || null,
      data.coach || null,
      JSON.stringify(data), // Store complete form data as JSON
      'pending'
    ];
    
    try {
      const result = await pool.query(query, values);
      return this.mapRowToRegistration(result.rows[0]);
    } catch (error: any) {
      throw new Error(`Failed to create online registration: ${error.message}`);
    }
  }
  
  // Get registration by ID
  async getRegistrationById(id: string): Promise<OnlineRegistration | null> {
    const query = 'SELECT * FROM online_registrations WHERE id = $1';
    
    try {
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRowToRegistration(result.rows[0]);
    } catch (error: any) {
      throw new Error(`Failed to get online registration: ${error.message}`);
    }
  }
  
  // Get all registrations with optional filters
  async getAllRegistrations(filters?: any): Promise<OnlineRegistration[]> {
    let query = 'SELECT * FROM online_registrations';
    const values: any[] = [];
    const conditions: string[] = [];
    
    if (filters) {
      if (filters.status) {
        conditions.push(`status = $${conditions.length + 1}`);
        values.push(filters.status);
      }
      if (filters.coach) {
        conditions.push(`coach = $${conditions.length + 1}`);
        values.push(filters.coach);
      }
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY created_at DESC';
    
    try {
      const result = await pool.query(query, values);
      return result.rows.map(row => this.mapRowToRegistration(row));
    } catch (error: any) {
      throw new Error(`Failed to get online registrations: ${error.message}`);
    }
  }
  
  // Update registration status
  async updateRegistrationStatus(id: string, status: string): Promise<OnlineRegistration | null> {
    const query = `
      UPDATE online_registrations 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING *
    `;
    
    try {
      const result = await pool.query(query, [status, id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRowToRegistration(result.rows[0]);
    } catch (error: any) {
      throw new Error(`Failed to update registration status: ${error.message}`);
    }
  }
  
  private mapRowToRegistration(row: any): OnlineRegistration {
    return {
      id: row.id,
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
      coach: row.coach,
      registration_data: row.registration_data,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
}

export default OnlineRegistrationService;