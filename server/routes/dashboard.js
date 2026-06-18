const express = require('express');
const router = express.Router();
const { protect, requirePermission } = require('../middleware/auth');
const { getDashboard, globalSearch } = require('../controllers/dashboardController');

router.get('/', protect, getDashboard);
router.get('/search', protect, globalSearch);

module.exports = router;
