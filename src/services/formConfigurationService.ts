import { pool } from '../config/db';
import { FormConfiguration, CreateFormConfigurationRequest, UpdateFormConfigurationRequest } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class FormConfigurationService {
  
  // Create new form configuration
  async createFormConfiguration(data: CreateFormConfigurationRequest, createdById: string): Promise<FormConfiguration> {
    const id = uuidv4();
    const configId = `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const query = `
      INSERT INTO form_configurations (
        id, config_id, created_by_id, name, form_type, version,
        description, is_active, sections, custom_fields, consent_form, documents
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    
    const values = [
      id,
      configId,
      createdById,
      data.name,
      data.form_type,
      data.version || '1.0',
      data.description || null,
      data.is_active ?? true,
      JSON.stringify(data.sections || []),
      JSON.stringify(data.custom_fields || {}),
      JSON.stringify(data.consent_form || { enabled: false }),
      JSON.stringify(data.documents || [])
    ];
    
    try {
      const result = await pool.query(query, values);
      return this.mapRowToFormConfiguration(result.rows[0]);
    } catch (error: any) {
      if (error.code === '23505') { // Unique violation
        if (error.constraint === 'unique_name_form_type') {
          throw new Error(`A form configuration with name "${data.name}" and type "${data.form_type}" already exists`);
        }
        throw new Error('Configuration ID already exists');
      }
      throw new Error(`Failed to create form configuration: ${error.message}`);
    }
  }
  
  // Get form configuration by ID
  async getFormConfigurationById(id: string): Promise<FormConfiguration | null> {
    const query = 'SELECT * FROM form_configurations WHERE id = $1';
    
    try {
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRowToFormConfiguration(result.rows[0]);
    } catch (error: any) {
      throw new Error(`Failed to get form configuration: ${error.message}`);
    }
  }

  // Get form configuration by config_id
  async getFormConfigurationByConfigId(configId: string): Promise<FormConfiguration | null> {
    const query = 'SELECT * FROM form_configurations WHERE config_id = $1';
    
    try {
      const result = await pool.query(query, [configId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRowToFormConfiguration(result.rows[0]);
    } catch (error: any) {
      throw new Error(`Failed to get form configuration by config ID: ${error.message}`);
    }
  }

  // Get form configurations by user (created by)
  async getFormConfigurationsByUserId(userId: string): Promise<FormConfiguration[]> {
    const query = 'SELECT * FROM form_configurations WHERE created_by_id = $1 ORDER BY created_at DESC';
    
    try {
      const result = await pool.query(query, [userId]);
      return result.rows.map(row => this.mapRowToFormConfiguration(row));
    } catch (error: any) {
      throw new Error(`Failed to get form configurations by user ID: ${error.message}`);
    }
  }

  // Get form configurations by type
  async getFormConfigurationsByType(formType: string): Promise<FormConfiguration[]> {
    const query = 'SELECT * FROM form_configurations WHERE form_type = $1 AND is_active = true ORDER BY created_at DESC';
    
    try {
      const result = await pool.query(query, [formType]);
      return result.rows.map(row => this.mapRowToFormConfiguration(row));
    } catch (error: any) {
      throw new Error(`Failed to get form configurations by type: ${error.message}`);
    }
  }
  
  // Get all form configurations with optional filters
  async getAllFormConfigurations(filters?: any): Promise<FormConfiguration[]> {
    let query = 'SELECT * FROM form_configurations';
    const values: any[] = [];
    const conditions: string[] = [];
    
    if (filters) {
      if (filters.form_type) {
        conditions.push(`form_type = $${conditions.length + 1}`);
        values.push(filters.form_type);
      }
      if (filters.is_active !== undefined) {
        conditions.push(`is_active = $${conditions.length + 1}`);
        values.push(filters.is_active);
      }
      if (filters.created_by_id) {
        conditions.push(`created_by_id = $${conditions.length + 1}`);
        values.push(filters.created_by_id);
      }
      if (filters.version) {
        conditions.push(`version = $${conditions.length + 1}`);
        values.push(filters.version);
      }
    }
    
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    query += ' ORDER BY created_at DESC';
    
    try {
      const result = await pool.query(query, values);
      return result.rows.map(row => this.mapRowToFormConfiguration(row));
    } catch (error: any) {
      throw new Error(`Failed to get all form configurations: ${error.message}`);
    }
  }
  
  // Update form configuration by ID
  async updateFormConfiguration(
    id: string, 
    data: UpdateFormConfigurationRequest
  ): Promise<FormConfiguration | null> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    
    // Build dynamic update query
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        // Handle consent_forms vs consent_form naming inconsistency
        let actualKey = key;
        if (key === 'consent_forms') {
          actualKey = 'consent_form';
        }
        
        if (['sections', 'custom_fields', 'consent_form', 'documents'].includes(actualKey)) {
          updateFields.push(`${actualKey} = $${paramCount}`);
          values.push(JSON.stringify(value));
        } else {
          updateFields.push(`${actualKey} = $${paramCount}`);
          values.push(value);
        }
        paramCount++;
      }
    });
    
    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }
    
    const query = `
      UPDATE form_configurations 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    values.push(id);
    
    try {
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRowToFormConfiguration(result.rows[0]);
    } catch (error: any) {
      if (error.code === '23505') { // Unique violation
        if (error.constraint === 'unique_name_form_type') {
          throw new Error(`A form configuration with this name and type combination already exists`);
        }
      }
      throw new Error(`Failed to update form configuration: ${error.message}`);
    }
  }
  
  // Delete form configuration by ID
  async deleteFormConfiguration(id: string): Promise<boolean> {
    const query = 'DELETE FROM form_configurations WHERE id = $1';
    
    try {
      const result = await pool.query(query, [id]);
      return (result.rowCount ?? 0) > 0;
    } catch (error: any) {
      console.error('Error deleting form configuration:', error);
      throw new Error('Failed to delete form configuration');
    }
  }

  // Activate/Deactivate form configuration
  async toggleFormConfigurationStatus(id: string, isActive: boolean): Promise<FormConfiguration | null> {
    const query = `
      UPDATE form_configurations 
      SET is_active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    
    try {
      const result = await pool.query(query, [isActive, id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRowToFormConfiguration(result.rows[0]);
    } catch (error: any) {
      throw new Error(`Failed to toggle form configuration status: ${error.message}`);
    }
  }

  // Increment usage count when form is used
  async incrementUsageCount(configId: string): Promise<void> {
    const query = `
      UPDATE form_configurations 
      SET usage_count = usage_count + 1, 
          last_used_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE config_id = $1
    `;
    
    try {
      await pool.query(query, [configId]);
    } catch (error: any) {
      console.error('Error incrementing usage count:', error);
      // Don't throw error as this is not critical
    }
  }

  // Get usage statistics for form configurations
  async getUsageStatistics(createdById?: string): Promise<any[]> {
    let query = `
      SELECT 
        id,
        config_id,
        name,
        form_type,
        version,
        usage_count,
        last_used_at,
        is_active,
        created_at
      FROM form_configurations
    `;
    
    const values: any[] = [];
    
    if (createdById) {
      query += ' WHERE created_by_id = $1';
      values.push(createdById);
    }
    
    query += ' ORDER BY usage_count DESC, last_used_at DESC NULLS LAST';
    
    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error: any) {
      throw new Error(`Failed to get usage statistics: ${error.message}`);
    }
  }

  // Clone form configuration
  async cloneFormConfiguration(id: string, newName: string, createdById: string): Promise<FormConfiguration> {
    try {
      // Get original configuration
      const original = await this.getFormConfigurationById(id);
      if (!original) {
        throw new Error('Original form configuration not found');
      }

      // Create new configuration with cloned data
      const cloneData: CreateFormConfigurationRequest = {
        name: newName,
        form_type: original.form_type,
        version: original.version,
        description: `Clone of ${original.name}`,
        is_active: false, // Start as inactive
        sections: original.sections,
        custom_fields: original.custom_fields,
        consent_form: original.consent_form,
        documents: original.documents
      };

      return await this.createFormConfiguration(cloneData, createdById);
    } catch (error: any) {
      throw new Error(`Failed to clone form configuration: ${error.message}`);
    }
  }
  
  // Helper method to map database row to FormConfiguration interface
  private mapRowToFormConfiguration(row: any): FormConfiguration {
    return {
      id: row.id,
      config_id: row.config_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      created_by_id: row.created_by_id,
      name: row.name,
      form_type: row.form_type,
      version: row.version,
      description: row.description,
      is_active: row.is_active,
      sections: Array.isArray(row.sections) ? row.sections : JSON.parse(row.sections || '[]'),
      custom_fields: typeof row.custom_fields === 'object' ? row.custom_fields : JSON.parse(row.custom_fields || '{}'),
      consent_form: typeof row.consent_form === 'object' ? row.consent_form : JSON.parse(row.consent_form || '{"enabled": false}'),
      documents: Array.isArray(row.documents) ? row.documents : JSON.parse(row.documents || '[]'),
      usage_count: row.usage_count,
      last_used_at: row.last_used_at
    };
  }
}

// Default export
export default FormConfigurationService; 