import { Router } from 'express';
import { IncomeController } from '../controllers/incomeController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
const incomeController = new IncomeController();

// POST /api/income - Create new income details
router.post(
  '/',
  authenticate,
  incomeController.createIncomeDetails.bind(incomeController)
);

// GET /api/income - Get all income details
router.get(
  '/',
  authenticate,
  incomeController.getAllIncomeDetails.bind(incomeController)
);

// GET /api/income/user/:userId - Get income by user ID
// Note: This specific route must come BEFORE the generic /:id route
router.get(
  '/user/:userId',
  authenticate,
  incomeController.getIncomeDetailsByUserId.bind(incomeController)
);

// GET /api/income/:id - Get income details by ID
router.get(
  '/:id',
  authenticate,
  incomeController.getIncomeDetailsById.bind(incomeController)
);

// PUT /api/income/:id - Update income details by ID
router.put(
  '/:id',
  authenticate,
  incomeController.updateIncomeDetails.bind(incomeController)
);

// DELETE /api/income/:id - Delete income details by ID
router.delete(
  '/:id',
  authenticate,
  incomeController.deleteIncomeDetails.bind(incomeController)
);

export default router; 