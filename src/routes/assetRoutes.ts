import { Router } from 'express';
import { AssetController } from '../controllers/assetController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
const assetController = new AssetController();

// POST /api/assets - Create new asset
router.post(
  '/',
  authenticate,
  assetController.createAsset.bind(assetController)
);

// GET /api/assets - Get all assets
router.get(
  '/',
  authenticate,
  assetController.getAllAssets.bind(assetController)
);

// GET /api/assets/user/:userId - Get assets by user ID
// Note: This specific route must come BEFORE the generic /:assetId route
router.get(
  '/user/:userId',
  authenticate,
  assetController.getAssetsByUserId.bind(assetController)
);

// PUT /api/assets/user/:userId - Update assets by user ID
router.put(
  '/user/:userId',
  authenticate,
  assetController.updateAssetByUserId.bind(assetController)
);

// DELETE /api/assets/user/:userId - Delete assets by user ID
router.delete(
  '/user/:userId',
  authenticate,
  assetController.deleteAssetByUserId.bind(assetController)
);

// GET /api/assets/:assetId - Get asset by ID
router.get(
  '/:assetId',
  authenticate,
  assetController.getAssetById.bind(assetController)
);

// PUT /api/assets/:assetId - Update asset by ID
router.put(
  '/:assetId',
  authenticate,
  assetController.updateAsset.bind(assetController)
);

// DELETE /api/assets/:assetId - Delete asset by ID
router.delete(
  '/:assetId',
  authenticate,
  assetController.deleteAsset.bind(assetController)
);

export default router; 