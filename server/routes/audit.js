const express = require('express');
const router = express.Router();
const { protect, adminOnly, requirePermission } = require('../middleware/auth');
const Audit = require('../models/Audit');
const paginate = require('../utils/paginate');

router.get('/logs', protect, adminOnly, requirePermission('admin:read'), async (req, res) => {
  try {
    const { user, action, resource, startDate, endDate } = req.query;
    const filters = {};
    if (user) filters.user = user;
    if (action) filters.action = action;
    if (resource) filters.resource = resource;
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.$gte = new Date(startDate);
      if (endDate) filters.createdAt.$lte = new Date(endDate);
    }
    const result = await paginate(Audit, {}, {
      ...req.query,
      filters,
      populate: [{ path: 'user', select: 'username' }],
      sort: '-createdAt',
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
