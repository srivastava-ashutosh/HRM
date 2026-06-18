const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { protect, requirePermission } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  getCourses, getCourse, createCourse, updateCourse, deleteCourse,
  getTrainingRecords, enrollEmployee, updateTrainingRecord, getMyTraining,
} = require('../controllers/trainingController');

router.get('/courses', protect, getCourses);
router.get('/courses/:id', protect, getCourse);
router.post('/courses', protect, requirePermission('admin:create'), [
  body('title').notEmpty().withMessage('Course title is required').trim(),
], validate, createCourse);
router.put('/courses/:id', protect, requirePermission('admin:update'), updateCourse);
router.delete('/courses/:id', protect, requirePermission('admin:delete'), deleteCourse);

router.get('/records', protect, getTrainingRecords);
router.post('/enroll', protect, requirePermission('admin:create'), [
  body('employeeId').notEmpty().withMessage('Employee is required'),
  body('courseId').notEmpty().withMessage('Course is required'),
], validate, enrollEmployee);
router.put('/records/:id', protect, requirePermission('admin:update'), updateTrainingRecord);

router.get('/my-training', protect, getMyTraining);

module.exports = router;
