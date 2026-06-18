const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { protect, adminOnly, requirePermission } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  getUsers, createUser, updateUser, deleteUser,
  getJobTitles, createJobTitle, updateJobTitle, deleteJobTitle,
  getPayGrades, createPayGrade, updatePayGrade, deletePayGrade,
  getWorkShifts, createWorkShift, updateWorkShift, deleteWorkShift,
  getOrganization, updateOrganization,
  importUsers, importJobTitles, importPayGrades, importWorkShifts
} = require('../controllers/adminController');

router.use(protect, adminOnly);

router.get('/users', requirePermission('admin:read'), getUsers);
router.post('/users', requirePermission('admin:create'), [
  body('username').notEmpty().withMessage('Username is required').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('password').isLength({ min: 4 }).withMessage('Password must be at least 4 characters'),
  body('role').isIn(['admin', 'ess', 'supervisor']).withMessage('Invalid role'),
], validate, createUser);
router.put('/users/:id', requirePermission('admin:update'), updateUser);
router.delete('/users/:id', requirePermission('admin:delete'), deleteUser);
router.post('/users/import', requirePermission('admin:create'), importUsers);

router.get('/job-titles', requirePermission('admin:read'), getJobTitles);
router.post('/job-titles', requirePermission('admin:create'), [
  body('title').notEmpty().withMessage('Job title is required').trim(),
], validate, createJobTitle);
router.put('/job-titles/:id', requirePermission('admin:update'), updateJobTitle);
router.delete('/job-titles/:id', requirePermission('admin:delete'), deleteJobTitle);
router.post('/job-titles/import', requirePermission('admin:create'), importJobTitles);

router.get('/pay-grades', requirePermission('admin:read'), getPayGrades);
router.post('/pay-grades', requirePermission('admin:create'), [
  body('name').notEmpty().withMessage('Pay grade name is required').trim(),
], validate, createPayGrade);
router.put('/pay-grades/:id', requirePermission('admin:update'), updatePayGrade);
router.delete('/pay-grades/:id', requirePermission('admin:delete'), deletePayGrade);
router.post('/pay-grades/import', requirePermission('admin:create'), importPayGrades);

router.get('/work-shifts', requirePermission('admin:read'), getWorkShifts);
router.post('/work-shifts', requirePermission('admin:create'), [
  body('name').notEmpty().withMessage('Work shift name is required').trim(),
], validate, createWorkShift);
router.put('/work-shifts/:id', requirePermission('admin:update'), updateWorkShift);
router.delete('/work-shifts/:id', requirePermission('admin:delete'), deleteWorkShift);
router.post('/work-shifts/import', requirePermission('admin:create'), importWorkShifts);

router.get('/organization', requirePermission('admin:read'), getOrganization);
router.put('/organization', requirePermission('admin:update'), updateOrganization);

module.exports = router;
