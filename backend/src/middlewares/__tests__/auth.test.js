import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import {
  extractToken,
  verifyToken,
  authenticate,
  optionalAuth,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from '../auth.js';
import { AuthenticationError } from '../errorHandler.js';

// Mock config
jest.mock('../../config/index.js', () => ({
  config: {
    jwt: {
      secret: 'test-secret',
      refreshSecret: 'test-refresh-secret',
      expiresIn: '1h',
      refreshExpiresIn: '7d'
    }
  }
}));

describe('Auth Middleware', () => {
  describe('extractToken', () => {
    it('should extract token from Bearer header', () => {
      const token = extractToken('Bearer abc123');
      expect(token).toBe('abc123');
    });

    it('should return null if no header provided', () => {
      const token = extractToken(null);
      expect(token).toBeNull();
    });

    it('should return null if header does not start with Bearer', () => {
      const token = extractToken('abc123');
      expect(token).toBeNull();
    });
  });

  describe('verifyToken', () => {
    const secret = 'test-secret';
    const payload = { id: 1, email: 'test@example.com', role: 'admin' };

    it('should verify valid token', () => {
      const token = jwt.sign(payload, secret);
      const decoded = verifyToken(token, secret);
      
      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it('should throw AuthenticationError for invalid token', () => {
      expect(() => {
        verifyToken('invalid-token', secret);
      }).toThrow(AuthenticationError);
    });

    it('should throw AuthenticationError for expired token', () => {
      const token = jwt.sign(payload, secret, { expiresIn: '0s' });
      
      // Wait a bit to ensure token expires
      return new Promise(resolve => setTimeout(resolve, 100)).then(() => {
        expect(() => {
          verifyToken(token, secret);
        }).toThrow(AuthenticationError);
      });
    });
  });

  describe('authenticate middleware', () => {
    let req, res, next;

    beforeEach(() => {
      req = { headers: {} };
      res = {};
      next = jest.fn();
    });

    it('should attach user to request with valid token', async () => {
      const payload = { id: 1, email: 'test@example.com', role: 'admin' };
      const token = jwt.sign(payload, 'test-secret');
      req.headers.authorization = `Bearer ${token}`;

      await authenticate(req, res, next);

      expect(req.user).toEqual({
        id: payload.id,
        email: payload.email,
        role: payload.role
      });
      expect(next).toHaveBeenCalledWith();
    });

    it('should call next with error if no token provided', async () => {
      await authenticate(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'No token provided',
          statusCode: 401
        })
      );
    });

    it('should call next with error if token is invalid', async () => {
      req.headers.authorization = 'Bearer invalid-token';

      await authenticate(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401
        })
      );
    });
  });

  describe('optionalAuth middleware', () => {
    let req, res, next;

    beforeEach(() => {
      req = { headers: {} };
      res = {};
      next = jest.fn();
    });

    it('should attach user to request with valid token', async () => {
      const payload = { id: 1, email: 'test@example.com', role: 'admin' };
      const token = jwt.sign(payload, 'test-secret');
      req.headers.authorization = `Bearer ${token}`;

      await optionalAuth(req, res, next);

      expect(req.user).toEqual({
        id: payload.id,
        email: payload.email,
        role: payload.role
      });
      expect(next).toHaveBeenCalledWith();
    });

    it('should continue without user if no token provided', async () => {
      await optionalAuth(req, res, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalledWith();
    });

    it('should continue without user if token is invalid', async () => {
      req.headers.authorization = 'Bearer invalid-token';

      await optionalAuth(req, res, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('generateAccessToken', () => {
    it('should generate valid access token', () => {
      const payload = { id: 1, email: 'test@example.com', role: 'admin' };
      const token = generateAccessToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = jwt.verify(token, 'test-secret');
      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate valid refresh token', () => {
      const payload = { id: 1, email: 'test@example.com' };
      const token = generateRefreshToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = jwt.verify(token, 'test-refresh-secret');
      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', () => {
      const payload = { id: 1, email: 'test@example.com' };
      const token = jwt.sign(payload, 'test-refresh-secret');
      
      const decoded = verifyRefreshToken(token);
      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
    });

    it('should throw error for invalid refresh token', () => {
      expect(() => {
        verifyRefreshToken('invalid-token');
      }).toThrow();
    });
  });
});
