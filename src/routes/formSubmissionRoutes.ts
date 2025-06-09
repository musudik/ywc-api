import { Router } from 'express';
import { FormSubmissionController } from '../controllers/formSubmissionController';
import { FormDocumentController } from '../controllers/formDocumentController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
const formSubmissionController = new FormSubmissionController();
const formDocumentController = new FormDocumentController();

// POST /api/form-submissions - Create new form submission
router.post(
  '/',
  authenticate,
  formSubmissionController.createFormSubmission.bind(formSubmissionController)
);

// GET /api/form-submissions - Get all form submissions (admin/coach only)
router.get(
  '/',
  authenticate,
  formSubmissionController.getAllFormSubmissions.bind(formSubmissionController)
);

// GET /api/form-submissions/user/:userId - Get user's form submissions
router.get(
  '/user/:userId',
  authenticate,
  formSubmissionController.getUserFormSubmissions.bind(formSubmissionController)
);

// PATCH /api/form-submissions/:id/submit - Submit form (change status to submitted)
router.patch(
  '/:id/submit',
  authenticate,
  formSubmissionController.submitForm.bind(formSubmissionController)
);

// GET /api/form-submissions/:id - Get form submission by ID
router.get(
  '/:id',
  authenticate,
  formSubmissionController.getFormSubmission.bind(formSubmissionController)
);

// PUT /api/form-submissions/:id - Update form submission by ID
router.put(
  '/:id',
  authenticate,
  formSubmissionController.updateFormSubmission.bind(formSubmissionController)
);

// DELETE /api/form-submissions/:id - Delete form submission by ID
router.delete(
  '/:id',
  authenticate,
  formSubmissionController.deleteFormSubmission.bind(formSubmissionController)
);

// =====================
// DOCUMENT ROUTES
// =====================

// GET /api/form-submissions/:formSubmissionId/document-status - Get document status
router.get(
  '/:formSubmissionId/document-status',
  authenticate,
  formDocumentController.getDocumentStatus.bind(formDocumentController)
);

// POST /api/form-submissions/:formSubmissionId/documents - Create new document record
router.post(
  '/:formSubmissionId/documents',
  authenticate,
  formDocumentController.createFormDocument.bind(formDocumentController)
);

// GET /api/form-submissions/:formSubmissionId/documents - Get all documents for form submission
router.get(
  '/:formSubmissionId/documents',
  authenticate,
  formDocumentController.getFormDocuments.bind(formDocumentController)
);

// GET /api/form-submissions/:formSubmissionId/documents/:documentId - Get single document
router.get(
  '/:formSubmissionId/documents/:documentId',
  authenticate,
  formDocumentController.getFormDocument.bind(formDocumentController)
);

// PUT /api/form-submissions/:formSubmissionId/documents/:documentId - Update document
router.put(
  '/:formSubmissionId/documents/:documentId',
  authenticate,
  formDocumentController.updateFormDocument.bind(formDocumentController)
);

// PATCH /api/form-submissions/:formSubmissionId/documents/:documentId/status - Update document status
router.patch(
  '/:formSubmissionId/documents/:documentId/status',
  authenticate,
  formDocumentController.updateDocumentStatus.bind(formDocumentController)
);

// DELETE /api/form-submissions/:formSubmissionId/documents/:documentId - Delete document
router.delete(
  '/:formSubmissionId/documents/:documentId',
  authenticate,
  formDocumentController.deleteFormDocument.bind(formDocumentController)
);

export default router; 