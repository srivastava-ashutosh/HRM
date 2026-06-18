const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const { sendError } = require('../utils/response');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password').populate('employeeId');
      if (!req.user) {
        return sendError(res, 'Not authorized', 401);
      }
      req.userPermissions = [];
      try {
        const role = await Role.findOne({ name: req.user.role });
        if (role) req.userPermissions = role.permissions.map(p => `${p.module}:${p.action}`);
      } catch (e) { /* ignore */ }
      next();
    } catch (error) {
      return sendError(res, 'Not authorized, token failed', 401);
    }
  } else {
    return sendError(res, 'Not authorized, no token', 401);
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return sendError(res, 'Admin access required', 403);
  }
};

const requirePermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.userPermissions) return sendError(res, 'No permissions loaded', 403);
    const hasAll = permissions.every(p => req.userPermissions.includes(p));
    if (hasAll || req.user.role === 'admin') return next();
    return sendError(res, `Required: ${permissions.join(', ')}`, 403);
  };
};

module.exports = { protect, adminOnly, requirePermission };
