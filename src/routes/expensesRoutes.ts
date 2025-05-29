import { Router } from 'express';
import { ExpensesController } from '../controllers/expensesController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
const expensesController = new ExpensesController();

// POST /api/expenses - Create new expenses details
router.post(
  '/',
  authenticate,
  expensesController.createExpensesDetails.bind(expensesController)
);

// GET /api/expenses - Get all expenses details
router.get(
  '/',
  authenticate,
  expensesController.getAllExpensesDetails.bind(expensesController)
);

// GET /api/expenses/user/:userId - Get expenses by user ID
// Note: This specific route must come BEFORE the generic /:id route
router.get(
  '/user/:userId',
  authenticate,
  expensesController.getExpensesDetailsByUserId.bind(expensesController)
);

// GET /api/expenses/:id - Get expenses details by ID
router.get(
  '/:id',
  authenticate,
  expensesController.getExpensesDetailsById.bind(expensesController)
);

// PUT /api/expenses/:id - Update expenses details by ID
router.put(
  '/:id',
  authenticate,
  expensesController.updateExpensesDetails.bind(expensesController)
);

// DELETE /api/expenses/:id - Delete expenses details by ID
router.delete(
  '/:id',
  authenticate,
  expensesController.deleteExpensesDetails.bind(expensesController)
);

export default router; 