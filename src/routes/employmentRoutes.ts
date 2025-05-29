import { Router } from 'express';
import { EmploymentController } from '../controllers/employmentController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// POST /api/employment - Create new employment details
router.post(
  '/',
  authenticate,
  EmploymentController.createValidationRules,
  EmploymentController.createEmploymentDetails
);

// GET /api/employment/user/:userId - Get employment details by user ID
router.get(
  '/user/:userId',
  authenticate,
  EmploymentController.getEmploymentDetailsByUserId
);

// PUT /api/employment/user/:userId - Update employment details by user ID
router.put(
  '/user/:userId',
  authenticate,
  EmploymentController.updateEmploymentDetailsByUserId
);

// DELETE /api/employment/user/:userId - Delete employment details by user ID
router.delete(
  '/user/:userId',
  authenticate,
  EmploymentController.deleteEmploymentDetailsByUserId
);

// GET /api/employment/:id - Get employment details by ID
router.get(
  '/:id',
  authenticate,
  EmploymentController.getValidationRules,
  EmploymentController.getEmploymentDetails
);

// PUT /api/employment/:id - Update employment details
router.put(
  '/:id',
  authenticate,
  EmploymentController.getValidationRules,
  EmploymentController.updateEmploymentDetails
);

// DELETE /api/employment/:id - Delete employment details
router.delete(
  '/:id',
  authenticate,
  EmploymentController.getValidationRules,
  EmploymentController.deleteEmploymentDetails
);

// GET /api/employment - Get all employment details
router.get(
  '/',
  authenticate,
  EmploymentController.getAllEmploymentDetails
);

export default router; 