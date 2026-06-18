const express = require('express');
const router = express.Router();
const { protect, requirePermission } = require('../middleware/auth');
const {
  getTimesheets, createTimesheet, updateTimesheet, submitTimesheet, approveTimesheet,
  getAttendance, punchIn, punchOut,
  importTimesheets, importAttendance
} = require('../controllers/timeController');

router.get('/timesheets', protect, requirePermission('time:read'), getTimesheets);
router.post('/timesheets', protect, requirePermission('time:create'), createTimesheet);
router.put('/timesheets/:id', protect, requirePermission('time:update'), updateTimesheet);
router.put('/timesheets/submit/:id', protect, requirePermission('time:write'), submitTimesheet);
router.put('/timesheets/approve/:id', protect, requirePermission('time:approve'), approveTimesheet);
router.post('/timesheets/import', protect, requirePermission('time:create'), importTimesheets);

router.get('/attendance', protect, requirePermission('time:read'), getAttendance);
router.post('/attendance/import', protect, requirePermission('time:create'), importAttendance);
router.post('/attendance/punch-in', protect, requirePermission('time:create'), punchIn);
router.post('/attendance/punch-out', protect, requirePermission('time:create'), punchOut);

module.exports = router;
