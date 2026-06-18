const { sendError } = require('../utils/response');

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV === 'development') {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return sendError(res, messages.join('. '), 400);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return sendError(res, `Duplicate value for ${field}`, 400);
  }

  if (err.name === 'CastError') {
    return sendError(res, `Invalid ${err.path}: ${err.value}`, 400);
  }

  sendError(res, message, statusCode);
};

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = { asyncHandler, errorHandler, AppError };
