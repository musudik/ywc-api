import { Router } from 'express';
import { FormSubmissionController } from '../controllers/formSubmissionController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
const formSubmissionController = new FormSubmissionController();

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

export default router; 