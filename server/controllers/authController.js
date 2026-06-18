const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const Employee = require('../models/Employee');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { sendSuccess } = require('../utils/response');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { expiresIn: '30d' });
};

const getRolePermissions = async (roleName) => {
  try {
    const role = await Role.findOne({ name: roleName });
    return role ? role.permissions : [];
  } catch {
    return [];
  }
};

exports.login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    throw new AppError('Please provide username and password', 400);
  }
  const user = await User.findOne({ username, status: true }).populate('employeeId');
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }
  user.isLoggedIn = true;
  user.lastLogin = new Date();
  await user.save();
  const token = generateToken(user._id);
  const permissions = await getRolePermissions(user.role);
  const refreshToken = generateRefreshToken(user._id);
  sendSuccess(res, {
    token,
    refreshToken,
    user: {
      id: user._id,
      username: user.username,
      role: user.role,
      employeeId: user.employeeId,
      permissions
    }
  }, 'Login successful');
});

exports.refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new AppError('Refresh token required', 400);
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password').populate('employeeId');
    if (!user || !user.status) throw new AppError('Invalid refresh token', 401);
    const token = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    sendSuccess(res, { token, refreshToken: newRefreshToken }, 'Token refreshed');
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }
});

exports.logout = asyncHandler(async (req, res) => {
  req.user.isLoggedIn = false;
  await req.user.save();
  sendSuccess(res, null, 'Logged out successfully');
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  if (!(await user.matchPassword(currentPassword))) {
    throw new AppError('Current password is incorrect', 400);
  }
  user.password = newPassword;
  await user.save();
  sendSuccess(res, null, 'Password changed successfully');
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password').populate('employeeId');
  const permissions = await getRolePermissions(user.role);
  sendSuccess(res, { ...user.toObject(), permissions });
});
