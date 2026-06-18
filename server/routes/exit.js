const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { protect, requirePermission } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  getExitRequests, getMyExitRequests, getExitRequest, createExitRequest,
  approveExitRequest, rejectExitRequest, startClearance, clearItem, completeFnF,
} = require('../controllers/exitController');

router.get('/requests', protect, requirePermission('admin:read'), getExitRequests);
router.get('/requests/my', protect, getMyExitRequests);
router.get('/requests/:id', protect, getExitRequest);
router.post('/requests', protect, [
  body('reason').notEmpty().withMessage('Reason is required').trim(),
  body('type').optional().isIn(['resignation', 'termination', 'retirement']).withMessage('Invalid type'),
], validate, createExitRequest);
router.put('/requests/:id/approve', protect, requirePermission('admin:update'), approveExitRequest);
router.put('/requests/:id/reject', protect, requirePermission('admin:update'), [
  body('rejectionReason').notEmpty().withMessage('Rejection reason is required').trim(),
], validate, rejectExitRequest);
router.put('/requests/:id/start-clearance', protect, requirePermission('admin:update'), startClearance);
router.put('/requests/:id/clear-item/:itemId', protect, clearItem);
router.put('/requests/:id/complete-fnf', protect, requirePermission('admin:update'), [
  body('fnfAmount').isNumeric().withMessage('Valid F&F amount is required'),
], validate, completeFnF);

module.exports = router;
