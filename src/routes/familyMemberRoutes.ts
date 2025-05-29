import { Router } from 'express';
import { FamilyMemberController } from '../controllers/familyMemberController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
const familyMemberController = new FamilyMemberController();

// POST /api/family-members - Create new family member
router.post(
  '/',
  authenticate,
  familyMemberController.createFamilyMember.bind(familyMemberController)
);

// GET /api/family-members - Get all family members
router.get(
  '/',
  authenticate,
  familyMemberController.getAllFamilyMembers.bind(familyMemberController)
);

// GET /api/family-members/user/:userId - Get family members by user ID
// Note: This specific route must come BEFORE the generic /:id route
router.get(
  '/user/:userId',
  authenticate,
  familyMemberController.getFamilyMembersByUserId.bind(familyMemberController)
);

// GET /api/family-members/user/:userId/relation/:relation - Get family members by user ID and relation
router.get(
  '/user/:userId/relation/:relation',
  authenticate,
  familyMemberController.getFamilyMembersByRelation.bind(familyMemberController)
);

// DELETE /api/family-members/user/:userId - Delete all family members for a user
router.delete(
  '/user/:userId',
  authenticate,
  familyMemberController.deleteFamilyMembersByUserId.bind(familyMemberController)
);

// GET /api/family-members/:id - Get family member by ID
router.get(
  '/:id',
  authenticate,
  familyMemberController.getFamilyMemberById.bind(familyMemberController)
);

// PUT /api/family-members/:id - Update family member by ID
router.put(
  '/:id',
  authenticate,
  familyMemberController.updateFamilyMember.bind(familyMemberController)
);

// DELETE /api/family-members/:id - Delete family member by ID
router.delete(
  '/:id',
  authenticate,
  familyMemberController.deleteFamilyMember.bind(familyMemberController)
);

export default router; 