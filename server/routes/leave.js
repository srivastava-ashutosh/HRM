const express = require('express');
const router = express.Router();
const { protect, requirePermission } = require('../middleware/auth');
const {
  getLeaveTypes, createLeaveType, updateLeaveType, deleteLeaveType,
  getLeaveRequests, createLeaveRequest, updateLeaveRequest, approveLeave, rejectLeave,
  getEntitlements, createEntitlement,
  getHolidays, createHoliday, deleteHoliday,
  importLeaveTypes, importEntitlements, importHolidays, importLeaveRequests
} = require('../controllers/leaveController');

router.get('/types', protect, requirePermission('leave:read'), getLeaveTypes);
router.post('/types', protect, requirePermission('leave:create'), createLeaveType);
router.put('/types/:id', protect, requirePermission('leave:update'), updateLeaveType);
router.delete('/types/:id', protect, requirePermission('leave:delete'), deleteLeaveType);

router.get('/requests', protect, requirePermission('leave:read'), getLeaveRequests);
router.post('/requests', protect, requirePermission('leave:create'), createLeaveRequest);
router.put('/requests/:id', protect, requirePermission('leave:update'), updateLeaveRequest);
router.put('/approve/:id', protect, requirePermission('leave:approve'), approveLeave);
router.put('/reject/:id', protect, requirePermission('leave:approve'), rejectLeave);

router.get('/entitlements', protect, requirePermission('leave:read'), getEntitlements);
router.post('/entitlements', protect, requirePermission('leave:create'), createEntitlement);

router.post('/types/import', protect, requirePermission('leave:create'), importLeaveTypes);
router.post('/entitlements/import', protect, requirePermission('leave:create'), importEntitlements);
router.post('/holidays/import', protect, requirePermission('leave:create'), importHolidays);
router.post('/requests/import', protect, requirePermission('leave:create'), importLeaveRequests);

router.get('/holidays', protect, requirePermission('leave:read'), getHolidays);
router.post('/holidays', protect, requirePermission('leave:create'), createHoliday);
router.delete('/holidays/:id', protect, requirePermission('leave:delete'), deleteHoliday);

module.exports = router;
