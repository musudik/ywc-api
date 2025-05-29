import { Router } from 'express';
import { PersonalDetailsController } from '../controllers/personalDetailsController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// POST /api/personal-details - Create new personal details
router.post(
  '/',
  authenticate,
  PersonalDetailsController.createValidationRules,
  PersonalDetailsController.createPersonalDetails
);

// GET /api/personal-details - Get all personal details
router.get(
  '/',
  authenticate,
  PersonalDetailsController.getAllPersonalDetails
);

// GET /api/personal-details/coach/:coachId - Get personal details by coach ID
// Note: This specific route must come BEFORE the generic /:personalId route
router.get(
  '/coach/:coachId',
  authenticate,
  PersonalDetailsController.getPersonalDetailsByCoachId
);

// GET /api/personal-details/:userId - Get personal details by user ID
router.get(
  '/:userId',
  authenticate,
  PersonalDetailsController.getValidationRules,
  PersonalDetailsController.getPersonalDetails
);

// PUT /api/personal-details/:userId - Update personal details
router.put(
  '/:userId',
  authenticate,
  PersonalDetailsController.updateValidationRules,
  PersonalDetailsController.updatePersonalDetails
);

// DELETE /api/personal-details/:userId - Delete personal details
router.delete(
  '/:userId',
  authenticate,
  PersonalDetailsController.getValidationRules,
  PersonalDetailsController.deletePersonalDetails
);

export default router; 