import { jest } from '@jest/globals';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  errorHandler,
  notFoundHandler,
  asyncHandler
} from '../errorHandler.js';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create error with message and status code', () => {
      const error = new AppError('Test error', 400);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
    });

    it('should create error with custom code', () => {
      const error = new AppError('Test error', 400, 'CUSTOM_ERROR');
      expect(error.code).toBe('CUSTOM_ERROR');
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with 400 status', () => {
      const errors = { email: 'Invalid email' };
      const error = new ValidationError('Validation failed', errors);
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.errors).toEqual(errors);
    });
  });

  describe('AuthenticationError', () => {
    it('should create authentication error with 401 status', () => {
      const error = new AuthenticationError();
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.message).toBe('Authentication required');
    });
  });

  describe('AuthorizationError', () => {
    it('should create authorization error with 403 status', () => {
      const error = new AuthorizationError();
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('AUTHORIZATION_ERROR');
      expect(error.message).toBe('Access denied');
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with 404 status', () => {
      const error = new NotFoundError();
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND_ERROR');
      expect(error.message).toBe('Resource not found');
    });
  });

  describe('ConflictError', () => {
    it('should create conflict error with 409 status', () => {
      const error = new ConflictError();
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('CONFLICT_ERROR');
      expect(error.message).toBe('Resource already exists');
    });
  });
});

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should handle AppError correctly', () => {
    const error = new AppError('Test error', 400, 'TEST_ERROR');
    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Test error',
      code: 'TEST_ERROR'
    });
  });

  it('should handle ValidationError with errors object', () => {
    const errors = { email: 'Invalid email', name: 'Required' };
    const error = new ValidationError('Validation failed', errors);
    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors
      })
    );
  });

  it('should handle unknown errors with 500 status', () => {
    const error = new Error('Unknown error');
    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Unknown error',
        code: 'SERVER_ERROR'
      })
    );
  });

  it('should handle Sequelize validation errors', () => {
    const error = {
      name: 'SequelizeValidationError',
      message: 'Validation error',
      errors: [
        { path: 'email', message: 'Email is required' },
        { path: 'name', message: 'Name is required' }
      ]
    };
    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        code: 'VALIDATION_ERROR',
        errors: {
          email: 'Email is required',
          name: 'Name is required'
        }
      })
    );
  });

  it('should handle JWT errors', () => {
    const error = {
      name: 'JsonWebTokenError',
      message: 'jwt malformed'
    };
    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        code: 'AUTHENTICATION_ERROR'
      })
    );
  });
});

describe('Not Found Handler', () => {
  it('should create NotFoundError and pass to next', () => {
    const req = { originalUrl: '/api/unknown' };
    const res = {};
    const next = jest.fn();

    notFoundHandler(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        message: 'Route /api/unknown not found'
      })
    );
  });
});

describe('Async Handler', () => {
  it('should handle successful async function', async () => {
    const fn = jest.fn().mockResolvedValue('success');
    const req = {};
    const res = {};
    const next = jest.fn();

    const handler = asyncHandler(fn);
    await handler(req, res, next);

    expect(fn).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it('should catch async function errors', async () => {
    const error = new Error('Async error');
    const fn = jest.fn().mockRejectedValue(error);
    const req = {};
    const res = {};
    const next = jest.fn();

    const handler = asyncHandler(fn);
    await handler(req, res, next);

    expect(fn).toHaveBeenCalledWith(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });
});
