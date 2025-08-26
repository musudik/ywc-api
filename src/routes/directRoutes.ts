import { Router } from 'express';
import { PersonalDetailsController } from '../controllers/personalDetailsController';

const router = Router();

// POST /api/direct/personal-details - Create personal details without authentication
router.post(
  '/personal-details',
  PersonalDetailsController.directPersonalDetailsValidationRules,
  PersonalDetailsController.createDirectPersonalDetails
);

// POST /api/direct/registrations - Create online registration without authentication
router.post(
  '/registrations',
  PersonalDetailsController.getAllRegistrations
);

// PUT /api/direct/registrations/:registrationId/status - Update registration status
router.put(
  '/registrations/:registrationId/status',
  PersonalDetailsController.updateRegistrationStatusValidationRules,
  PersonalDetailsController.updateRegistrationStatus
);

// GET /api/direct/registrations/:registrationId - Get registration details
router.get(
  '/registrations/:registrationId',
  PersonalDetailsController.getRegistrationById
);

export default router;