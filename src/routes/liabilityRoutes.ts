import { Router } from 'express';
import { LiabilityController } from '../controllers/liabilityController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
const liabilityController = new LiabilityController();

// POST /api/liabilities - Create new liability
router.post(
  '/',
  authenticate,
  liabilityController.createLiability.bind(liabilityController)
);

// GET /api/liabilities - Get all liabilities
router.get(
  '/',
  authenticate,
  liabilityController.getAllLiabilities.bind(liabilityController)
);

// GET /api/liabilities/user/:userId - Get liabilities by user ID
// Note: This specific route must come BEFORE the generic /:id route
router.get(
  '/user/:userId',
  authenticate,
  liabilityController.getLiabilitiesByUserId.bind(liabilityController)
);

// GET /api/liabilities/:id - Get liability by ID
router.get(
  '/:id',
  authenticate,
  liabilityController.getLiabilityById.bind(liabilityController)
);

// PUT /api/liabilities/:id - Update liability by ID
router.put(
  '/:id',
  authenticate,
  liabilityController.updateLiability.bind(liabilityController)
);

// DELETE /api/liabilities/:id - Delete liability by ID
router.delete(
  '/:id',
  authenticate,
  liabilityController.deleteLiability.bind(liabilityController)
);

export default router; 