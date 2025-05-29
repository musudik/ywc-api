import { Router } from 'express';
import { PersonController } from '../controllers/personController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
const personController = new PersonController();

// All routes require authentication
router.use(authenticate);

// Get users by role (for accessing /api/person/user/users/:role)
router.get('/user/users/:role', personController.getUsersByRole.bind(personController));

// Get users by role (alternative route for /api/person/users/:role)
router.get('/users/:role', personController.getUsersByRole.bind(personController));

// Person Routes (aggregated data)
router.get('/user/:userId/complete', personController.getCompletePersonProfile.bind(personController));
router.get('/user/:userId/summary', personController.getPersonSummary.bind(personController));
router.get('/user/:userId/financial-summary', personController.getFinancialSummary.bind(personController));

// Backward compatibility route for personal_id
router.get('/personal/:personalId/complete', personController.getCompletePersonProfileByPersonalId.bind(personController));

// Get all persons summary (for coach dashboard)
router.get('/', personController.getAllPersonsSummary.bind(personController));

export default router; 