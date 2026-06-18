const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { protect, requirePermission } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee, getSupervisors, importEmployees } = require('../controllers/pimController');

router.get('/employees', protect, requirePermission('pim:read'), getEmployees);
router.get('/employees/:id', protect, requirePermission('pim:read'), getEmployee);

router.post('/employees', protect, requirePermission('pim:create'), [
  body('firstName').notEmpty().withMessage('First name is required').trim(),
  body('lastName').notEmpty().withMessage('Last name is required').trim(),
  body('workEmail').optional({ values: 'falsy' }).isEmail().withMessage('Invalid work email'),
  body('otherEmail').optional({ values: 'falsy' }).isEmail().withMessage('Invalid other email'),
], validate, createEmployee);

router.put('/employees/:id', protect, requirePermission('pim:update'), updateEmployee);
router.delete('/employees/:id', protect, requirePermission('pim:delete'), deleteEmployee);
router.post('/employees/import', protect, requirePermission('pim:create'), importEmployees);
router.get('/supervisors', protect, requirePermission('pim:read'), getSupervisors);

module.exports = router;
