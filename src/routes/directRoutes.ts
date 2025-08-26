import { Router } from 'express';
import { PersonalDetailsController } from '../controllers/personalDetailsController';

const router = Router();

// POST /api/direct/personal-details - Create personal details without authentication
router.post(
  '/personal-details',
  PersonalDetailsController.directPersonalDetailsValidationRules,
  PersonalDetailsController.createDirectPersonalDetails
);

export default router;