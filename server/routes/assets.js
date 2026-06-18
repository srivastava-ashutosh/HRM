const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { protect, requirePermission } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  getAssets, getAsset, createAsset, updateAsset, deleteAsset,
  assignAsset, returnAsset, getAssignments, getMyAssets,
} = require('../controllers/assetController');

router.get('/assets', protect, getAssets);
router.get('/assets/:id', protect, getAsset);
router.post('/assets', protect, requirePermission('admin:create'), [
  body('name').notEmpty().withMessage('Asset name is required').trim(),
  body('type').isIn(['laptop', 'monitor', 'phone', 'tablet', 'headset', 'keyboard', 'mouse', 'printer', 'other']).withMessage('Invalid asset type'),
], validate, createAsset);
router.put('/assets/:id', protect, requirePermission('admin:update'), updateAsset);
router.delete('/assets/:id', protect, requirePermission('admin:delete'), deleteAsset);

router.post('/assign', protect, requirePermission('admin:create'), [
  body('assetId').notEmpty().withMessage('Asset is required'),
  body('employeeId').notEmpty().withMessage('Employee is required'),
], validate, assignAsset);

router.post('/return', protect, requirePermission('admin:update'), returnAsset);
router.get('/assignments', protect, getAssignments);
router.get('/my-assets', protect, getMyAssets);

module.exports = router;
