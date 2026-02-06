import { jest } from '@jest/globals';
import {
  ROLES,
  hasRole,
  authorize,
  adminOnly,
  editorOrAdmin,
  checkOwnership,
  canModify,
  canDelete,
  canAccessProfile
} from '../authorize.js';

describe('Authorization Middleware', () => {
  describe('hasRole', () => {
    it('should return true if user has exact role', () => {
      expect(hasRole(ROLES.ADMIN, ROLES.ADMIN)).toBe(true);
      expect(hasRole(ROLES.EDITOR, ROLES.EDITOR)).toBe(true);
      expect(hasRole(ROLES.AUTHOR, ROLES.AUTHOR)).toBe(true);
    });

    it('should return true if user has higher role', () => {
      expect(hasRole(ROLES.ADMIN, ROLES.EDITOR)).toBe(true);
      expect(hasRole(ROLES.ADMIN, ROLES.AUTHOR)).toBe(true);
      expect(hasRole(ROLES.EDITOR, ROLES.AUTHOR)).toBe(true);
    });

    it('should return false if user has lower role', () => {
      expect(hasRole(ROLES.AUTHOR, ROLES.EDITOR)).toBe(false);
      expect(hasRole(ROLES.AUTHOR, ROLES.ADMIN)).toBe(false);
      expect(hasRole(ROLES.EDITOR, ROLES.ADMIN)).toBe(false);
    });
  });

  describe('authorize', () => {
    let req, res, next;

    beforeEach(() => {
      req = { user: null };
      res = {};
      next = jest.fn();
    });

    it('should call next if user has allowed role', () => {
      req.user = { id: 1, role: ROLES.ADMIN };
      const middleware = authorize(ROLES.ADMIN);
      
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
    });

    it('should call next if user has one of multiple allowed roles', () => {
      req.user = { id: 1, role: ROLES.EDITOR };
      const middleware = authorize(ROLES.ADMIN, ROLES.EDITOR);
      
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
    });

    it('should call next with error if user not authenticated', () => {
      const middleware = authorize(ROLES.ADMIN);
      
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Authentication required'
        })
      );
    });

    it('should call next with error if user does not have allowed role', () => {
      req.user = { id: 1, role: ROLES.AUTHOR };
      const middleware = authorize(ROLES.ADMIN);
      
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403
        })
      );
    });
  });

  describe('adminOnly', () => {
    let req, res, next;

    beforeEach(() => {
      req = { user: null };
      res = {};
      next = jest.fn();
    });

    it('should allow admin', () => {
      req.user = { id: 1, role: ROLES.ADMIN };
      
      adminOnly(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
    });

    it('should deny editor', () => {
      req.user = { id: 1, role: ROLES.EDITOR };
      
      adminOnly(req, res, next);
      
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403 })
      );
    });

    it('should deny author', () => {
      req.user = { id: 1, role: ROLES.AUTHOR };
      
      adminOnly(req, res, next);
      
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403 })
      );
    });
  });

  describe('editorOrAdmin', () => {
    let req, res, next;

    beforeEach(() => {
      req = { user: null };
      res = {};
      next = jest.fn();
    });

    it('should allow admin', () => {
      req.user = { id: 1, role: ROLES.ADMIN };
      
      editorOrAdmin(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
    });

    it('should allow editor', () => {
      req.user = { id: 1, role: ROLES.EDITOR };
      
      editorOrAdmin(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
    });

    it('should deny author', () => {
      req.user = { id: 1, role: ROLES.AUTHOR };
      
      editorOrAdmin(req, res, next);
      
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403 })
      );
    });
  });

  describe('checkOwnership', () => {
    let req, res, next;

    beforeEach(() => {
      req = { user: null };
      res = {};
      next = jest.fn();
    });

    it('should allow admin to access any resource', async () => {
      req.user = { id: 1, role: ROLES.ADMIN };
      const getOwnerId = jest.fn().mockResolvedValue(2);
      const middleware = checkOwnership(getOwnerId);
      
      await middleware(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
      expect(getOwnerId).not.toHaveBeenCalled();
    });

    it('should allow editor to access any resource', async () => {
      req.user = { id: 1, role: ROLES.EDITOR };
      const getOwnerId = jest.fn().mockResolvedValue(2);
      const middleware = checkOwnership(getOwnerId);
      
      await middleware(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
      expect(getOwnerId).not.toHaveBeenCalled();
    });

    it('should allow author to access their own resource', async () => {
      req.user = { id: 1, role: ROLES.AUTHOR };
      const getOwnerId = jest.fn().mockResolvedValue(1);
      const middleware = checkOwnership(getOwnerId);
      
      await middleware(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
      expect(getOwnerId).toHaveBeenCalledWith(req);
    });

    it('should deny author from accessing others resource', async () => {
      req.user = { id: 1, role: ROLES.AUTHOR };
      const getOwnerId = jest.fn().mockResolvedValue(2);
      const middleware = checkOwnership(getOwnerId);
      
      await middleware(req, res, next);
      
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          message: 'You can only access your own resources'
        })
      );
    });
  });

  describe('canModify', () => {
    let req, res, next;

    beforeEach(() => {
      req = { user: null };
      res = {};
      next = jest.fn();
    });

    it('should allow admin to modify any resource', async () => {
      req.user = { id: 1, role: ROLES.ADMIN };
      const getOwnerId = jest.fn().mockResolvedValue(2);
      const middleware = canModify(getOwnerId);
      
      await middleware(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
    });

    it('should allow editor to modify any resource', async () => {
      req.user = { id: 1, role: ROLES.EDITOR };
      const getOwnerId = jest.fn().mockResolvedValue(2);
      const middleware = canModify(getOwnerId);
      
      await middleware(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
    });

    it('should allow author to modify their own resource', async () => {
      req.user = { id: 1, role: ROLES.AUTHOR };
      const getOwnerId = jest.fn().mockResolvedValue(1);
      const middleware = canModify(getOwnerId);
      
      await middleware(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
    });

    it('should deny author from modifying others resource', async () => {
      req.user = { id: 1, role: ROLES.AUTHOR };
      const getOwnerId = jest.fn().mockResolvedValue(2);
      const middleware = canModify(getOwnerId);
      
      await middleware(req, res, next);
      
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403
        })
      );
    });
  });

  describe('canDelete', () => {
    let req, res, next;

    beforeEach(() => {
      req = { user: null };
      res = {};
      next = jest.fn();
    });

    it('should allow admin to delete', () => {
      req.user = { id: 1, role: ROLES.ADMIN };
      const middleware = canDelete();
      
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
    });

    it('should allow editor to delete', () => {
      req.user = { id: 1, role: ROLES.EDITOR };
      const middleware = canDelete();
      
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
    });

    it('should deny author from deleting', () => {
      req.user = { id: 1, role: ROLES.AUTHOR };
      const middleware = canDelete();
      
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403
        })
      );
    });
  });

  describe('canAccessProfile', () => {
    let req, res, next;

    beforeEach(() => {
      req = { user: null, params: {} };
      res = {};
      next = jest.fn();
    });

    it('should allow admin to access any profile', () => {
      req.user = { id: 1, role: ROLES.ADMIN };
      req.params.id = '2';
      const middleware = canAccessProfile();
      
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
    });

    it('should allow user to access their own profile', () => {
      req.user = { id: 1, role: ROLES.AUTHOR };
      req.params.id = '1';
      const middleware = canAccessProfile();
      
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
    });

    it('should deny user from accessing others profile', () => {
      req.user = { id: 1, role: ROLES.AUTHOR };
      req.params.id = '2';
      const middleware = canAccessProfile();
      
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403
        })
      );
    });
  });
});
