class CustomError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends CustomError {
  constructor(message, field = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.field = field;
  }
}

class AuthenticationError extends CustomError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

class AuthorizationError extends CustomError {
  constructor(message = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

class NotFoundError extends CustomError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class ConflictError extends CustomError {
  constructor(message) {
    super(message, 409, 'CONFLICT');
  }
}

class DatabaseError extends CustomError {
  constructor(message = 'Database operation failed') {
    super(message, 500, 'DATABASE_ERROR');
  }
}

class RateLimitError extends CustomError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT');
  }
}

class FileUploadError extends CustomError {
  constructor(message = 'File upload failed') {
    super(message, 400, 'FILE_UPLOAD_ERROR');
  }
}

module.exports = {
  CustomError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  RateLimitError,
  FileUploadError
};
