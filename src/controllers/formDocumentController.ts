import { Request, Response } from 'express';
import { FormDocumentService } from '../services/formDocumentService';
import { CreateFormDocumentData, UpdateFormDocumentData } from '../types/FormModels';

export class FormDocumentController {
  private formDocumentService: FormDocumentService;

  constructor() {
    this.formDocumentService = new FormDocumentService();
  }

  /**
   * Create a new form document record
   * POST /api/form-submissions/:formSubmissionId/documents
   */
  async createFormDocument(req: Request, res: Response): Promise<void> {
    try {
      const { formSubmissionId } = req.params;
      const documentData: CreateFormDocumentData = {
        form_submission_id: formSubmissionId,
        ...req.body
      };

      // Check authentication
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Validate required fields
      const requiredFields = ['client_id', 'form_config_id', 'file_name', 'applicant_type', 'document_id', 'firebase_path'];
      const missingFields = requiredFields.filter(field => !documentData[field as keyof CreateFormDocumentData]);

      if (missingFields.length > 0) {
        res.status(400).json({
          error: 'Missing required fields',
          missing_fields: missingFields
        });
        return;
      }

      // Check if form submission exists
      const formSubmissionExists = await this.formDocumentService.formSubmissionExists(formSubmissionId);
      if (!formSubmissionExists) {
        res.status(404).json({ error: 'Form submission not found' });
        return;
      }

      // Check user authorization - users can only create documents for their own form submissions or if they're admin/coach
      if (req.user.role === 'CLIENT') {
        // Additional validation for clients would go here
        // For now, we'll allow clients to create documents for their own submissions
      }

      const document = await this.formDocumentService.createFormDocument(documentData);

      res.status(201).json({
        message: 'Form document created successfully',
        document
      });
    } catch (error: any) {
      console.error('Error creating form document:', error);
      res.status(500).json({
        error: 'Failed to create form document',
        details: error.message
      });
    }
  }

  /**
   * Get document status for a form submission
   * GET /api/form-submissions/:formSubmissionId/document-status
   */
  async getDocumentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { formSubmissionId } = req.params;

      // Check authentication
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Check if form submission exists
      const formSubmissionExists = await this.formDocumentService.formSubmissionExists(formSubmissionId);
      if (!formSubmissionExists) {
        res.status(404).json({ error: 'Form submission not found' });
        return;
      }

      // Check user authorization
      if (req.user.role === 'CLIENT') {
        // Additional validation for clients would go here to ensure they can only see their own documents
      }

      const documentStatus = await this.formDocumentService.getDocumentStatus(formSubmissionId);

      res.status(200).json(documentStatus);
    } catch (error: any) {
      console.error('Error getting document status:', error);
      res.status(500).json({
        error: 'Failed to get document status',
        details: error.message
      });
    }
  }

  /**
   * Update a form document
   * PUT /api/form-submissions/:formSubmissionId/documents/:documentId
   */
  async updateFormDocument(req: Request, res: Response): Promise<void> {
    try {
      const { documentId } = req.params;
      const updateData: UpdateFormDocumentData = req.body;

      // Check authentication
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Get existing document first
      const existingDocument = await this.formDocumentService.getFormDocumentById(documentId);
      if (!existingDocument) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }

      // Check user authorization
      if (req.user.role === 'CLIENT') {
        // Additional validation for clients would go here
      }

      const updatedDocument = await this.formDocumentService.updateFormDocument(documentId, updateData);

      if (!updatedDocument) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }

      res.status(200).json({
        message: 'Form document updated successfully',
        document: updatedDocument
      });
    } catch (error: any) {
      console.error('Error updating form document:', error);
      res.status(500).json({
        error: 'Failed to update form document',
        details: error.message
      });
    }
  }

  /**
   * Update document status
   * PATCH /api/form-submissions/:formSubmissionId/documents/:documentId/status
   */
  async updateDocumentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { documentId } = req.params;
      const { upload_status, uploaded_at } = req.body;

      // Check authentication
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      if (!upload_status) {
        res.status(400).json({ error: 'Upload status is required' });
        return;
      }

      // Get existing document first
      const existingDocument = await this.formDocumentService.getFormDocumentById(documentId);
      if (!existingDocument) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }

      // Check user authorization
      if (req.user.role === 'CLIENT') {
        // Additional validation for clients would go here
      }

      const updatedDocument = await this.formDocumentService.updateDocumentStatus(
        documentId, 
        upload_status, 
        uploaded_at
      );

      if (!updatedDocument) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }

      res.status(200).json({
        message: 'Document status updated successfully',
        document: updatedDocument
      });
    } catch (error: any) {
      console.error('Error updating document status:', error);
      res.status(500).json({
        error: 'Failed to update document status',
        details: error.message
      });
    }
  }

  /**
   * Get all documents for a form submission
   * GET /api/form-submissions/:formSubmissionId/documents
   */
  async getFormDocuments(req: Request, res: Response): Promise<void> {
    try {
      const { formSubmissionId } = req.params;

      // Check authentication
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Check if form submission exists
      const formSubmissionExists = await this.formDocumentService.formSubmissionExists(formSubmissionId);
      if (!formSubmissionExists) {
        res.status(404).json({ error: 'Form submission not found' });
        return;
      }

      // Check user authorization
      if (req.user.role === 'CLIENT') {
        // Additional validation for clients would go here
      }

      const documents = await this.formDocumentService.getDocumentsByFormSubmissionId(formSubmissionId);

      res.status(200).json({
        form_submission_id: formSubmissionId,
        documents,
        total_count: documents.length
      });
    } catch (error: any) {
      console.error('Error getting form documents:', error);
      res.status(500).json({
        error: 'Failed to get form documents',
        details: error.message
      });
    }
  }

  /**
   * Delete a form document
   * DELETE /api/form-submissions/:formSubmissionId/documents/:documentId
   */
  async deleteFormDocument(req: Request, res: Response): Promise<void> {
    try {
      const { documentId } = req.params;

      // Check authentication
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Get existing document first
      const existingDocument = await this.formDocumentService.getFormDocumentById(documentId);
      if (!existingDocument) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }

      // Check user authorization - only admin and coach can delete documents
      if (req.user.role === 'CLIENT') {
        res.status(403).json({ error: 'Insufficient permissions to delete documents' });
        return;
      }

      const deleted = await this.formDocumentService.deleteFormDocument(documentId);

      if (!deleted) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }

      res.status(200).json({
        message: 'Form document deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting form document:', error);
      res.status(500).json({
        error: 'Failed to delete form document',
        details: error.message
      });
    }
  }

  /**
   * Get a single form document by ID
   * GET /api/form-submissions/:formSubmissionId/documents/:documentId
   */
  async getFormDocument(req: Request, res: Response): Promise<void> {
    try {
      const { documentId } = req.params;

      // Check authentication
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const document = await this.formDocumentService.getFormDocumentById(documentId);

      if (!document) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }

      // Check user authorization
      if (req.user.role === 'CLIENT') {
        // Additional validation for clients would go here
      }

      res.status(200).json({
        document
      });
    } catch (error: any) {
      console.error('Error getting form document:', error);
      res.status(500).json({
        error: 'Failed to get form document',
        details: error.message
      });
    }
  }
} 