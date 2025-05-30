import { Router } from 'express';
import { FormConfigurationController } from '../controllers/formConfigurationController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
const formConfigurationController = new FormConfigurationController();

// POST /api/form-configurations - Create new form configuration
router.post(
  '/',
  authenticate,
  formConfigurationController.createFormConfiguration.bind(formConfigurationController)
);

// GET /api/form-configurations - Get all form configurations with optional filters
router.get(
  '/',
  authenticate,
  formConfigurationController.getAllFormConfigurations.bind(formConfigurationController)
);

// GET /api/form-configurations/statistics - Get usage statistics
router.get(
  '/statistics',
  authenticate,
  formConfigurationController.getUsageStatistics.bind(formConfigurationController)
);

// GET /api/form-configurations/user/:userId - Get form configurations by user ID
router.get(
  '/user/:userId',
  authenticate,
  formConfigurationController.getFormConfigurationsByUserId.bind(formConfigurationController)
);

// GET /api/form-configurations/type/:formType - Get form configurations by type
router.get(
  '/type/:formType',
  authenticate,
  formConfigurationController.getFormConfigurationsByType.bind(formConfigurationController)
);

// GET /api/form-configurations/config/:configId - Get form configuration by config ID
router.get(
  '/config/:configId',
  authenticate,
  formConfigurationController.getFormConfigurationByConfigId.bind(formConfigurationController)
);

// POST /api/form-configurations/:id/clone - Clone form configuration
router.post(
  '/:id/clone',
  authenticate,
  formConfigurationController.cloneFormConfiguration.bind(formConfigurationController)
);

// PATCH /api/form-configurations/:id/status - Toggle form configuration status
router.patch(
  '/:id/status',
  authenticate,
  formConfigurationController.toggleFormConfigurationStatus.bind(formConfigurationController)
);

// GET /api/form-configurations/:id - Get form configuration by ID
router.get(
  '/:id',
  authenticate,
  formConfigurationController.getFormConfigurationById.bind(formConfigurationController)
);

// PUT /api/form-configurations/:id - Update form configuration by ID
router.put(
  '/:id',
  authenticate,
  formConfigurationController.updateFormConfiguration.bind(formConfigurationController)
);

// DELETE /api/form-configurations/:id - Delete form configuration by ID
router.delete(
  '/:id',
  authenticate,
  formConfigurationController.deleteFormConfiguration.bind(formConfigurationController)
);

export default router; 