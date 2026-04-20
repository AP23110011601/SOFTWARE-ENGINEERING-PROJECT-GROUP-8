const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error to monitoring system
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Log to monitoring endpoint if available
  if (req.app.get('monitoring')) {
    try {
      const monitoringRoutes = require('../routes/monitoring');
      // This would normally be handled by the monitoring middleware
      // For now, we'll just log to console
    } catch (monitoringError) {
      console.error('Failed to log to monitoring:', monitoringError);
    }
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  // JWT expired error
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // Database connection error
  if (err.name === 'MongoNetworkError') {
    const message = 'Database connection error';
    error = { message, statusCode: 503 };
  }

  // File upload error
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File size too large';
    error = { message, statusCode: 400 };
  }

  // Rate limit error
  if (err.name === 'RateLimitError') {
    const message = 'Too many requests, please try again later';
    error = { message, statusCode: 429 };
  }

  // Default error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

module.exports = errorHandler;
