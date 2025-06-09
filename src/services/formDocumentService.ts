import { Pool } from 'pg';
import { pool } from '../config/db';
import { 
  FormDocument, 
  CreateFormDocumentData, 
  UpdateFormDocumentData, 
  DocumentStatusResponse,
  DocumentUploadStatus 
} from '../types/FormModels';

export class FormDocumentService {
  private db: Pool;

  constructor() {
    this.db = pool;
  }

  /**
   * Create a new form document record
   */
  async createFormDocument(data: CreateFormDocumentData): Promise<FormDocument> {
    const query = `
      INSERT INTO form_documents (
        form_submission_id, client_id, form_config_id, file_name,
        applicant_type, document_id, firebase_path, upload_status, uploaded_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      data.form_submission_id,
      data.client_id,
      data.form_config_id,
      data.file_name,
      data.applicant_type,
      data.document_id,
      data.firebase_path,
      data.upload_status || 'pending',
      data.uploaded_at || new Date().toISOString()
    ];

    try {
      const result = await this.db.query(query, values);
      return this.mapRowToFormDocument(result.rows[0]);
    } catch (error) {
      console.error('Error creating form document:', error);
      throw new Error('Failed to create form document');
    }
  }

  /**
   * Get document status for a form submission
   */
  async getDocumentStatus(formSubmissionId: string): Promise<DocumentStatusResponse> {
    const query = `
      SELECT * FROM form_documents 
      WHERE form_submission_id = $1
      ORDER BY created_at DESC
    `;

    try {
      const result = await this.db.query(query, [formSubmissionId]);
      const documents = result.rows.map(row => this.mapRowToFormDocument(row));
      
      const uploadedCount = documents.filter(doc => doc.upload_status === 'uploaded').length;
      const pendingCount = documents.filter(doc => doc.upload_status === 'pending' || doc.upload_status === 'uploading').length;
      const failedCount = documents.filter(doc => doc.upload_status === 'failed').length;

      return {
        form_submission_id: formSubmissionId,
        documents,
        total_documents: documents.length,
        uploaded_count: uploadedCount,
        pending_count: pendingCount,
        failed_count: failedCount
      };
    } catch (error) {
      console.error('Error getting document status:', error);
      throw new Error('Failed to get document status');
    }
  }

  /**
   * Update a form document
   */
  async updateFormDocument(id: string, data: UpdateFormDocumentData): Promise<FormDocument | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    // Build dynamic update query
    if (data.file_name !== undefined) {
      fields.push(`file_name = $${paramCount++}`);
      values.push(data.file_name);
    }
    if (data.upload_status !== undefined) {
      fields.push(`upload_status = $${paramCount++}`);
      values.push(data.upload_status);
    }
    if (data.firebase_path !== undefined) {
      fields.push(`firebase_path = $${paramCount++}`);
      values.push(data.firebase_path);
    }
    if (data.uploaded_at !== undefined) {
      fields.push(`uploaded_at = $${paramCount++}`);
      values.push(data.uploaded_at);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    const query = `
      UPDATE form_documents 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    values.push(id);

    try {
      const result = await this.db.query(query, values);
      return result.rows.length > 0 ? this.mapRowToFormDocument(result.rows[0]) : null;
    } catch (error) {
      console.error('Error updating form document:', error);
      throw new Error('Failed to update form document');
    }
  }

  /**
   * Update document status
   */
  async updateDocumentStatus(id: string, status: DocumentUploadStatus, uploadedAt?: string): Promise<FormDocument | null> {
    const query = `
      UPDATE form_documents 
      SET upload_status = $1, uploaded_at = $2
      WHERE id = $3
      RETURNING *
    `;

    const values = [
      status,
      uploadedAt || new Date().toISOString(),
      id
    ];

    try {
      const result = await this.db.query(query, values);
      return result.rows.length > 0 ? this.mapRowToFormDocument(result.rows[0]) : null;
    } catch (error) {
      console.error('Error updating document status:', error);
      throw new Error('Failed to update document status');
    }
  }

  /**
   * Get a single form document by ID
   */
  async getFormDocumentById(id: string): Promise<FormDocument | null> {
    const query = 'SELECT * FROM form_documents WHERE id = $1';

    try {
      const result = await this.db.query(query, [id]);
      return result.rows.length > 0 ? this.mapRowToFormDocument(result.rows[0]) : null;
    } catch (error) {
      console.error('Error getting form document by ID:', error);
      throw new Error('Failed to get form document');
    }
  }

  /**
   * Get all documents for a specific form submission
   */
  async getDocumentsByFormSubmissionId(formSubmissionId: string): Promise<FormDocument[]> {
    const query = `
      SELECT * FROM form_documents 
      WHERE form_submission_id = $1
      ORDER BY created_at DESC
    `;

    try {
      const result = await this.db.query(query, [formSubmissionId]);
      return result.rows.map(row => this.mapRowToFormDocument(row));
    } catch (error) {
      console.error('Error getting documents by form submission ID:', error);
      throw new Error('Failed to get documents');
    }
  }

  /**
   * Delete a form document
   */
  async deleteFormDocument(id: string): Promise<boolean> {
    const query = 'DELETE FROM form_documents WHERE id = $1';

    try {
      const result = await this.db.query(query, [id]);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error deleting form document:', error);
      throw new Error('Failed to delete form document');
    }
  }

  /**
   * Delete all documents for a form submission
   */
  async deleteDocumentsByFormSubmissionId(formSubmissionId: string): Promise<number> {
    const query = 'DELETE FROM form_documents WHERE form_submission_id = $1';

    try {
      const result = await this.db.query(query, [formSubmissionId]);
      return result.rowCount ?? 0;
    } catch (error) {
      console.error('Error deleting documents by form submission ID:', error);
      throw new Error('Failed to delete documents');
    }
  }

  /**
   * Check if form submission exists
   */
  async formSubmissionExists(formSubmissionId: string): Promise<boolean> {
    const query = 'SELECT 1 FROM form_submissions WHERE id = $1';

    try {
      const result = await this.db.query(query, [formSubmissionId]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error checking form submission existence:', error);
      return false;
    }
  }

  /**
   * Map database row to FormDocument interface
   */
  private mapRowToFormDocument(row: any): FormDocument {
    return {
      id: row.id,
      form_submission_id: row.form_submission_id,
      client_id: row.client_id,
      form_config_id: row.form_config_id,
      file_name: row.file_name,
      applicant_type: row.applicant_type,
      document_id: row.document_id,
      firebase_path: row.firebase_path,
      upload_status: row.upload_status as DocumentUploadStatus,
      uploaded_at: row.uploaded_at?.toISOString() || '',
      created_at: row.created_at?.toISOString() || '',
      updated_at: row.updated_at?.toISOString() || ''
    };
  }
} 