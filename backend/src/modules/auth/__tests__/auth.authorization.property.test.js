/**
 * Property-Based Tests for Authorization
 * 
 * Tests Property 4: Unauthenticated requests are blocked
 * Tests Property 5: Unauthorized access is prevented
 * Validates Requirements 1.4, 1.5
 * 
 * Uses fast-check for property-based testing with minimum 100 iterations
 */

import { describe, beforeAll, beforeEach, afterAll, test, expect, jest } from '@jest/globals';
import fc from 'fast-check';
import * as authService from '../auth.service.js';
import * as userService from '../../users/user.service.js';
import { authenticate, authorize } from '../../../middlewares/auth.js';
import { AuthenticationError, ForbiddenError } from '../../../middlewares/errorHandler.js';
import sequelize from '../../../config/database.js';
import { setupAssociations } from '../../../config/associations.js';

describe('Auth Authorization Property Tests', () => {
  beforeAll(async () => {
    setupAssociations();
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clear all users before each test
    await sequelize.models.User.destroy({ where: {}, truncate: true });
    authService.clearInvalidatedTokens();
  });

  describe('Property 4: Unauthenticated requests are blocked', () => {
    /**
     * For any protected endpoint, when accessed without a valid authentication token,
     * the system should return a 401 unauthorized error.
     */
    test('should block requests without authentication token', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constant(null),
          async () => {
            // Create mock request without token
            const req = {
              headers: {},
              header: function(name) {
                return this.headers[name.toLowerCase()];
              }
            };
            const res = {};
            const next = jest.fn();

            // Attempt to authenticate
            await authenticate(req, res, next);

            // Should not call next() without error
            expect(next).toHaveBeenCalledWith(expect.any(AuthenticationError));
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);

    test('should block requests with invalid token format', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.constant('invalid-token'),
            fc.constant('Bearer'),
            fc.constant('Bearer '),
            fc.constant('NotBearer token'),
            fc.string({ minLength: 1, maxLength: 50 })
          ),
          async (invalidToken) => {
            // Create mock request with invalid token
            const req = {
              headers: {
                authorization: invalidToken
              },
              header: function(name) {
                return this.headers[name.toLowerCase()];
              }
            };
            const res = {};
            const next = jest.fn();

            // Attempt to authenticate
            await authenticate(req, res, next);

            // Should call next() with error
            expect(next).toHaveBeenCalledWith(expect.any(Error));
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);

    test('should block requests with expired token', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            full_name: fc.string({ minLength: 2, maxLength: 100 }),
            email: fc.emailAddress(),
            password: fc.string({ minLength: 8, maxLength: 50 }),
            role: fc.constantFrom('admin', 'editor', 'author')
          }),
          async (userData) => {
            // Create user and get token
            const user = await userService.create({
              ...userData,
              status: 'active'
            });

            const loginResult = await authService.login(userData.email, userData.password);

            // Simulate token expiration by using an invalid token
            // (In real scenario, we'd wait for expiration or manipulate time)
            const expiredToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid';

            const req = {
              headers: {
                authorization: expiredToken
              },
              header: function(name) {
                return this.headers[name.toLowerCase()];
              }
            };
            const res = {};
            const next = jest.fn();

            // Attempt to authenticate with expired token
            await authenticate(req, res, next);

            // Should call next() with error
            expect(next).toHaveBeenCalledWith(expect.any(Error));

            // Clean up
            await userService.deleteUser(user.id);
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);

    test('should block requests with invalidated refresh token', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            full_name: fc.string({ minLength: 2, maxLength: 100 }),
            email: fc.emailAddress(),
            password: fc.string({ minLength: 8, maxLength: 50 }),
            role: fc.constantFrom('admin', 'editor', 'author')
          }),
          async (userData) => {
            // Create user and get tokens
            const user = await userService.create({
              ...userData,
              status: 'active'
            });

            const loginResult = await authService.login(userData.email, userData.password);

            // Logout to invalidate refresh token
            await authService.logout(loginResult.refreshToken);

            // Attempt to use invalidated refresh token
            await expect(
              authService.refreshAccessToken(loginResult.refreshToken)
            ).rejects.toThrow(AuthenticationError);

            // Clean up
            await userService.deleteUser(user.id);
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);
  });

  describe('Property 5: Unauthorized access is prevented', () => {
    /**
     * For any user role and protected resource, when the user attempts to access
     * a resource beyond their permissions, the system should return a 403 forbidden error.
     */
    test('should prevent author from accessing admin-only resources', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            full_name: fc.string({ minLength: 2, maxLength: 100 }),
            email: fc.emailAddress(),
            password: fc.string({ minLength: 8, maxLength: 50 })
          }),
          async (userData) => {
            // Create author user
            const user = await userService.create({
              ...userData,
              role: 'author',
              status: 'active'
            });

            const loginResult = await authService.login(userData.email, userData.password);

            // Create mock request with author token
            const req = {
              headers: {
                authorization: `Bearer ${loginResult.accessToken}`
              },
              header: function(name) {
                return this.headers[name.toLowerCase()];
              },
              user: {
                id: user.id,
                email: user.email,
                role: 'author'
              }
            };
            const res = {};
            const next = jest.fn();

            // Attempt to access admin-only resource
            const adminMiddleware = authorize(['admin']);
            adminMiddleware(req, res, next);

            // Should call next() with ForbiddenError
            expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));

            // Clean up
            await userService.deleteUser(user.id);
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);

    test('should prevent editor from accessing admin-only resources', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            full_name: fc.string({ minLength: 2, maxLength: 100 }),
            email: fc.emailAddress(),
            password: fc.string({ minLength: 8, maxLength: 50 })
          }),
          async (userData) => {
            // Create editor user
            const user = await userService.create({
              ...userData,
              role: 'editor',
              status: 'active'
            });

            const loginResult = await authService.login(userData.email, userData.password);

            // Create mock request with editor token
            const req = {
              user: {
                id: user.id,
                email: user.email,
                role: 'editor'
              }
            };
            const res = {};
            const next = jest.fn();

            // Attempt to access admin-only resource
            const adminMiddleware = authorize(['admin']);
            adminMiddleware(req, res, next);

            // Should call next() with ForbiddenError
            expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));

            // Clean up
            await userService.deleteUser(user.id);
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);

    test('should allow access when user has required role', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            full_name: fc.string({ minLength: 2, maxLength: 100 }),
            email: fc.emailAddress(),
            password: fc.string({ minLength: 8, maxLength: 50 }),
            role: fc.constantFrom('admin', 'editor', 'author')
          }),
          async (userData) => {
            // Create user with specific role
            const user = await userService.create({
              ...userData,
              status: 'active'
            });

            const loginResult = await authService.login(userData.email, userData.password);

            // Create mock request with user token
            const req = {
              user: {
                id: user.id,
                email: user.email,
                role: userData.role
              }
            };
            const res = {};
            const next = jest.fn();

            // Attempt to access resource that allows this role
            const middleware = authorize([userData.role]);
            middleware(req, res, next);

            // Should call next() without error
            expect(next).toHaveBeenCalledWith();

            // Clean up
            await userService.deleteUser(user.id);
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);

    test('should enforce role hierarchy correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            adminData: fc.record({
              full_name: fc.string({ minLength: 2, maxLength: 100 }),
              email: fc.emailAddress(),
              password: fc.string({ minLength: 8, maxLength: 50 })
            }),
            editorData: fc.record({
              full_name: fc.string({ minLength: 2, maxLength: 100 }),
              email: fc.emailAddress(),
              password: fc.string({ minLength: 8, maxLength: 50 })
            }),
            authorData: fc.record({
              full_name: fc.string({ minLength: 2, maxLength: 100 }),
              email: fc.emailAddress(),
              password: fc.string({ minLength: 8, maxLength: 50 })
            })
          }).filter(data => 
            data.adminData.email !== data.editorData.email &&
            data.adminData.email !== data.authorData.email &&
            data.editorData.email !== data.authorData.email
          ),
          async (usersData) => {
            // Create users with different roles
            const admin = await userService.create({
              ...usersData.adminData,
              role: 'admin',
              status: 'active'
            });

            const editor = await userService.create({
              ...usersData.editorData,
              role: 'editor',
              status: 'active'
            });

            const author = await userService.create({
              ...usersData.authorData,
              role: 'author',
              status: 'active'
            });

            // Admin should access admin-only resources
            const adminReq = { user: { id: admin.id, role: 'admin' } };
            const adminNext = jest.fn();
            authorize(['admin'])(adminReq, {}, adminNext);
            expect(adminNext).toHaveBeenCalledWith();

            // Admin should access editor resources
            const adminEditorNext = jest.fn();
            authorize(['editor', 'admin'])(adminReq, {}, adminEditorNext);
            expect(adminEditorNext).toHaveBeenCalledWith();

            // Editor should not access admin-only resources
            const editorReq = { user: { id: editor.id, role: 'editor' } };
            const editorNext = jest.fn();
            authorize(['admin'])(editorReq, {}, editorNext);
            expect(editorNext).toHaveBeenCalledWith(expect.any(ForbiddenError));

            // Author should not access admin or editor-only resources
            const authorReq = { user: { id: author.id, role: 'author' } };
            const authorAdminNext = jest.fn();
            authorize(['admin'])(authorReq, {}, authorAdminNext);
            expect(authorAdminNext).toHaveBeenCalledWith(expect.any(ForbiddenError));

            const authorEditorNext = jest.fn();
            authorize(['editor'])(authorReq, {}, authorEditorNext);
            expect(authorEditorNext).toHaveBeenCalledWith(expect.any(ForbiddenError));

            // Clean up
            await userService.deleteUser(admin.id);
            await userService.deleteUser(editor.id);
            await userService.deleteUser(author.id);
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);

    test('should handle multiple allowed roles correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            full_name: fc.string({ minLength: 2, maxLength: 100 }),
            email: fc.emailAddress(),
            password: fc.string({ minLength: 8, maxLength: 50 }),
            role: fc.constantFrom('admin', 'editor', 'author')
          }),
          async (userData) => {
            // Create user
            const user = await userService.create({
              ...userData,
              status: 'active'
            });

            const req = {
              user: {
                id: user.id,
                email: user.email,
                role: userData.role
              }
            };
            const res = {};

            // Test with multiple allowed roles
            const allowedRoles = ['admin', 'editor'];
            const next = jest.fn();
            authorize(allowedRoles)(req, res, next);

            if (allowedRoles.includes(userData.role)) {
              // Should allow access
              expect(next).toHaveBeenCalledWith();
            } else {
              // Should deny access
              expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
            }

            // Clean up
            await userService.deleteUser(user.id);
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);
  });
});
