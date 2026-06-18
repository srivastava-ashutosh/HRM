const express = require('express');
const router = express.Router();
const { protect, adminOnly, requirePermission } = require('../middleware/auth');
const { purgeEmployee, purgeCandidate, getPurgeLog, accessEmployeeRecords } = require('../controllers/maintenanceController');

router.delete('/purge/employee/:id', protect, adminOnly, requirePermission('maintenance:delete'), purgeEmployee);
router.delete('/purge/candidate/:id', protect, adminOnly, requirePermission('maintenance:delete'), purgeCandidate);
router.get('/purge-log', protect, adminOnly, requirePermission('maintenance:read'), getPurgeLog);
router.get('/access-records/:id', protect, adminOnly, requirePermission('maintenance:read'), accessEmployeeRecords);

module.exports = router;
