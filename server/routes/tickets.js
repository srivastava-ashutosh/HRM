const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { protect, requirePermission } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  getTickets, getTicket, createTicket, updateTicket,
  assignTicket, resolveTicket, closeTicket, getMyTickets,
} = require('../controllers/ticketController');

router.get('/tickets', protect, requirePermission('admin:read'), getTickets);
router.get('/tickets/my', protect, getMyTickets);
router.get('/tickets/:id', protect, getTicket);
router.post('/tickets', protect, [
  body('subject').notEmpty().withMessage('Subject is required').trim(),
  body('category').isIn(['IT', 'HR', 'Facilities', 'Finance', 'Other']).withMessage('Invalid category'),
  body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
], validate, createTicket);
router.put('/tickets/:id', protect, requirePermission('admin:update'), updateTicket);
router.put('/tickets/:id/assign', protect, requirePermission('admin:update'), [
  body('assignedTo').notEmpty().withMessage('Assignee is required'),
], validate, assignTicket);
router.put('/tickets/:id/resolve', protect, resolveTicket);
router.put('/tickets/:id/close', protect, closeTicket);

module.exports = router;
