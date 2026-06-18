const express = require('express');
const router = express.Router();
const { protect, requirePermission } = require('../middleware/auth');
const { getDirectory } = require('../controllers/directoryController');

router.get('/', protect, requirePermission('directory:read'), getDirectory);

module.exports = router;
