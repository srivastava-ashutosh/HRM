const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { login, refresh, logout, changePassword, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.post('/login', [
  body('username').notEmpty().withMessage('Username is required').trim(),
  body('password').notEmpty().withMessage('Password is required'),
], validate, login);

router.post('/refresh', refresh);
router.post('/logout', protect, logout);

router.put('/change-password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 4 }).withMessage('New password must be at least 4 characters'),
], validate, changePassword);

router.get('/me', protect, getMe);

module.exports = router;
