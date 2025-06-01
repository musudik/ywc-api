import { pool } from '../config/db';
import { FormSubmissionData, FormSubmissionList, CreateFormSubmissionRequest, UpdateFormSubmissionRequest, FormSubmissionStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class FormSubmissionService {
  
  // Helper method to resolve config_id to UUID
  private async resolveFormConfigId(formConfigId: string): Promise<string> {
    // Check if it's already a UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (uuidRegex.test(formConfigId)) {
      return formConfigId; // It's already a UUID
    }
    
    // It's a config_id, resolve to UUID
    const configResult = await pool.query(
      'SELECT id FROM form_configurations WHERE config_id = $1 AND is_active = true',
      [formConfigId]
    );
    
    if (configResult.rows.length === 0) {
      throw new Error(`Form configuration not found with config_id: ${formConfigId}`);
    }
    
    return configResult.rows[0].id;
  }
  
  // Create new form submission
  async createFormSubmission(data: CreateFormSubmissionRequest, userId: string): Promise<FormSubmissionData> {
    const id = uuidv4();
    
    // Resolve form_config_id to actual UUID if it's a config_id string
    const actualFormConfigId = await this.resolveFormConfigId(data.form_config_id);
    
    const query = `
      INSERT INTO form_submissions (
        id, form_config_id, user_id, form_data, status
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [
      id,
      actualFormConfigId,
      userId,
      JSON.stringify(data.form_data || {}),
      data.status || 'draft'
    ];
    
    try {
      const result = await pool.query(query, values);
      return this.mapRowToFormSubmission(result.rows[0]);
    } catch (error: any) {
      if (error.code === '23503') { // Foreign key violation
        if (error.constraint === 'form_submissions_form_config_id_fkey') {
          throw new Error('Form configuration not found');
        }
        if (error.constraint === 'form_submissions_user_id_fkey') {
          throw new Error('User not found');
        }
      }
      throw new Error(`Failed to create form submission: ${error.message}`);
    }
  }
  
  // Update form submission by ID
  async updateFormSubmission(
    id: string, 
    data: UpdateFormSubmissionRequest, 
    userId?: string
  ): Promise<FormSubmissionData | null> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    
    // Build dynamic update query
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'form_data') {
          updateFields.push(`${key} = $${paramCount}`);
          values.push(JSON.stringify(value));
        } else {
          updateFields.push(`${key} = $${paramCount}`);
          values.push(value);
        }
        paramCount++;
      }
    });
    
    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }
    
    // Add user condition if userId is provided (for security)
    let whereClause = `WHERE id = $${paramCount}`;
    values.push(id);
    
    if (userId) {
      paramCount++;
      whereClause += ` AND user_id = $${paramCount}`;
      values.push(userId);
    }
    
    const query = `
      UPDATE form_submissions 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      ${whereClause}
      RETURNING *
    `;
    
    try {
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRowToFormSubmission(result.rows[0]);
    } catch (error: any) {
      throw new Error(`Failed to update form submission: ${error.message}`);
    }
  }
  
  // Get form submission by ID
  async getFormSubmissionById(id: string, userId?: string): Promise<FormSubmissionData | null> {
    let query = `
      SELECT * FROM form_submissions 
      WHERE id = $1
    `;
    let values = [id];
    
    // Add user condition if userId is provided (for security)
    if (userId) {
      query += ` AND user_id = $2`;
      values.push(userId);
    }
    
    try {
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRowToFormSubmission(result.rows[0]);
    } catch (error: any) {
      throw new Error(`Failed to fetch form submission: ${error.message}`);
    }
  }
  
  // Get user's form submissions with config info
  async getUserFormSubmissions(userId: string): Promise<FormSubmissionList[]> {
    const query = `
      SELECT 
        fs.id,
        fs.form_config_id,
        fc.name as config_name,
        fs.user_id,
        fs.status,
        fs.submitted_at,
        fs.created_at,
        fs.updated_at
      FROM form_submissions fs
      JOIN form_configurations fc ON fs.form_config_id = fc.id
      WHERE fs.user_id = $1
      ORDER BY fs.updated_at DESC
    `;
    
    try {
      const result = await pool.query(query, [userId]);
      return result.rows.map(row => ({
        id: row.id,
        form_config_id: row.form_config_id,
        config_name: row.config_name,
        user_id: row.user_id,
        status: row.status,
        submitted_at: row.submitted_at ? row.submitted_at.toISOString() : null,
        created_at: row.created_at.toISOString(),
        updated_at: row.updated_at.toISOString()
      }));
    } catch (error: any) {
      throw new Error(`Failed to fetch user form submissions: ${error.message}`);
    }
  }
  
  // Submit form (change status to submitted)
  async submitForm(id: string, userId?: string): Promise<FormSubmissionData | null> {
    let query = `
      UPDATE form_submissions 
      SET status = 'submitted', submitted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    let values = [id];
    
    // Add user condition if userId is provided (for security)
    if (userId) {
      query += ` AND user_id = $2`;
      values.push(userId);
    }
    
    query += ` RETURNING *`;
    
    try {
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRowToFormSubmission(result.rows[0]);
    } catch (error: any) {
      throw new Error(`Failed to submit form: ${error.message}`);
    }
  }
  
  // Delete form submission
  async deleteFormSubmission(id: string, userId?: string): Promise<boolean> {
    let query = `DELETE FROM form_submissions WHERE id = $1`;
    let values = [id];
    
    // Add user condition if userId is provided (for security)
    if (userId) {
      query += ` AND user_id = $2`;
      values.push(userId);
    }
    
    try {
      const result = await pool.query(query, values);
      return (result.rowCount ?? 0) > 0;
    } catch (error: any) {
      throw new Error(`Failed to delete form submission: ${error.message}`);
    }
  }
  
  // Get all form submissions (admin/coach use)
  async getAllFormSubmissions(filters?: any): Promise<FormSubmissionList[]> {
    let query = `
      SELECT 
        fs.id,
        fs.form_config_id,
        fc.name as config_name,
        fs.user_id,
        fs.status,
        fs.submitted_at,
        fs.created_at,
        fs.updated_at
      FROM form_submissions fs
      JOIN form_configurations fc ON fs.form_config_id = fc.id
    `;
    
    const conditions: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    
    // Apply filters
    if (filters?.status) {
      conditions.push(`fs.status = $${paramCount}`);
      values.push(filters.status);
      paramCount++;
    }
    
    if (filters?.form_config_id) {
      // Resolve config_id to UUID if necessary
      try {
        const actualFormConfigId = await this.resolveFormConfigId(filters.form_config_id);
        conditions.push(`fs.form_config_id = $${paramCount}`);
        values.push(actualFormConfigId);
        paramCount++;
      } catch (error) {
        // If config_id resolution fails, no results will match
        conditions.push('1 = 0'); // This will return no results
      }
    }
    
    if (filters?.user_id) {
      conditions.push(`fs.user_id = $${paramCount}`);
      values.push(filters.user_id);
      paramCount++;
    }
    
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    query += ` ORDER BY fs.updated_at DESC`;
    
    try {
      const result = await pool.query(query, values);
      return result.rows.map(row => ({
        id: row.id,
        form_config_id: row.form_config_id,
        config_name: row.config_name,
        user_id: row.user_id,
        status: row.status,
        submitted_at: row.submitted_at ? row.submitted_at.toISOString() : null,
        created_at: row.created_at.toISOString(),
        updated_at: row.updated_at.toISOString()
      }));
    } catch (error: any) {
      throw new Error(`Failed to fetch form submissions: ${error.message}`);
    }
  }
  
  // Helper method to map database row to FormSubmissionData interface
  private mapRowToFormSubmission(row: any): FormSubmissionData {
    return {
      id: row.id,
      form_config_id: row.form_config_id,
      user_id: row.user_id,
      form_data: typeof row.form_data === 'object' ? row.form_data : JSON.parse(row.form_data || '{}'),
      status: row.status as FormSubmissionStatus,
      submitted_at: row.submitted_at || undefined,
      reviewed_at: row.reviewed_at || undefined,
      reviewed_by: row.reviewed_by || undefined,
      review_notes: row.review_notes || undefined,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
} 