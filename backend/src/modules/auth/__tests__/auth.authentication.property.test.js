/**
 * Property-Based Tests for Authentication
 * 
 * Tests Property 1: Valid credentials generate tokens
 * Validates Requirements 1.1
 * 
 * Uses fast-check for property-based testing with minimum 100 iterations
 */

import { describe, beforeAll, beforeEach, afterAll, test, expect } from '@jest/globals';
import fc from 'fast-check';
import * as authService from '../auth.service.js';
import * as userService from '../../users/user.service.js';
import { verifyAccessToken, verifyRefreshToken } from '../../../middlewares/auth.js';
import sequelize from '../../../config/database.js';
import { setupAssociations } from '../../../config/associations.js';

describe('Auth Authentication Property Tests', () => {
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

  describe('Property 1: Valid credentials generate tokens', () => {
    /**
     * For any valid username and password combination, when a user logs in,
     * the system should return both a valid JWT access token and a valid JWT refresh token.
     */
    test('should generate valid access and refresh tokens for any valid credentials', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            full_name: fc.string({ minLength: 2, maxLength: 100 }),
            email: fc.emailAddress(),
            password: fc.string({ minLength: 8, maxLength: 50 }),
            role: fc.constantFrom('admin', 'editor', 'author')
          }),
          async (userData) => {
            // Create user with valid credentials
            const user = await userService.create({
              ...userData,
              status: 'active'
            });

            // Login with the credentials
            const result = await authService.login(userData.email, userData.password);

            // Verify result structure
            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');

            // Verify user data
            expect(result.user.id).toBe(user.id);
            expect(result.user.email).toBe(userData.email);
            expect(result.user.role).toBe(userData.role);
            expect(result.user.password).toBeUndefined(); // Password should not be returned

            // Verify access token is valid JWT
            expect(typeof result.accessToken).toBe('string');
            expect(result.accessToken.split('.')).toHaveLength(3); // JWT has 3 parts

            // Verify refresh token is valid JWT
            expect(typeof result.refreshToken).toBe('string');
            expect(result.refreshToken.split('.')).toHaveLength(3);

            // Verify tokens can be decoded
            const decodedAccess = verifyAccessToken(result.accessToken);
            expect(decodedAccess.id).toBe(user.id);
            expect(decodedAccess.email).toBe(userData.email);
            expect(decodedAccess.role).toBe(userData.role);

            const decodedRefresh = verifyRefreshToken(result.refreshToken);
            expect(decodedRefresh.id).toBe(user.id);
            expect(decodedRefresh.email).toBe(userData.email);

            // Clean up
            await userService.deleteUser(user.id);
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);

    test('should generate different tokens for different users', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              full_name: fc.string({ minLength: 2, maxLength: 100 }),
              email: fc.emailAddress(),
              password: fc.string({ minLength: 8, maxLength: 50 }),
              role: fc.constantFrom('admin', 'editor', 'author')
            }),
            { minLength: 2, maxLength: 5 }
          ),
          async (usersData) => {
            // Create multiple users
            const users = [];
            const tokens = [];

            for (const userData of usersData) {
              const user = await userService.create({
                ...userData,
                status: 'active'
              });
              users.push(user);

              const result = await authService.login(userData.email, userData.password);
              tokens.push(result);
            }

            // Verify all tokens are unique
            const accessTokens = tokens.map(t => t.accessToken);
            const refreshTokens = tokens.map(t => t.refreshToken);

            const uniqueAccessTokens = new Set(accessTokens);
            const uniqueRefreshTokens = new Set(refreshTokens);

            expect(uniqueAccessTokens.size).toBe(accessTokens.length);
            expect(uniqueRefreshTokens.size).toBe(refreshTokens.length);

            // Verify each token contains correct user data
            for (let i = 0; i < users.length; i++) {
              const decoded = verifyAccessToken(tokens[i].accessToken);
              expect(decoded.id).toBe(users[i].id);
              expect(decoded.email).toBe(users[i].email);
            }

            // Clean up
            for (const user of users) {
              await userService.deleteUser(user.id);
            }
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);

    test('should generate tokens with correct role information', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            full_name: fc.string({ minLength: 2, maxLength: 100 }),
            email: fc.emailAddress(),
            password: fc.string({ minLength: 8, maxLength: 50 }),
            role: fc.constantFrom('admin', 'editor', 'author')
          }),
          async (userData) => {
            const user = await userService.create({
              ...userData,
              status: 'active'
            });

            const result = await authService.login(userData.email, userData.password);

            // Verify role in token matches user role
            const decoded = verifyAccessToken(result.accessToken);
            expect(decoded.role).toBe(userData.role);
            expect(decoded.role).toBe(user.role);

            // Clean up
            await userService.deleteUser(user.id);
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);

    test('should not include sensitive data in tokens', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            full_name: fc.string({ minLength: 2, maxLength: 100 }),
            email: fc.emailAddress(),
            password: fc.string({ minLength: 8, maxLength: 50 }),
            role: fc.constantFrom('admin', 'editor', 'author')
          }),
          async (userData) => {
            const user = await userService.create({
              ...userData,
              status: 'active'
            });

            const result = await authService.login(userData.email, userData.password);

            // Verify password is not in response
            expect(result.user.password).toBeUndefined();

            // Verify password is not in token payload
            const decoded = verifyAccessToken(result.accessToken);
            expect(decoded.password).toBeUndefined();

            // Clean up
            await userService.deleteUser(user.id);
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);

    test('should generate tokens that can be used for subsequent requests', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            full_name: fc.string({ minLength: 2, maxLength: 100 }),
            email: fc.emailAddress(),
            password: fc.string({ minLength: 8, maxLength: 50 }),
            role: fc.constantFrom('admin', 'editor', 'author')
          }),
          async (userData) => {
            const user = await userService.create({
              ...userData,
              status: 'active'
            });

            const loginResult = await authService.login(userData.email, userData.password);

            // Use access token to get current user
            const decoded = verifyAccessToken(loginResult.accessToken);
            const currentUser = await userService.findById(decoded.id);

            expect(currentUser.id).toBe(user.id);
            expect(currentUser.email).toBe(userData.email);

            // Use refresh token to get new access token
            const refreshResult = await authService.refreshAccessToken(loginResult.refreshToken);
            expect(refreshResult).toHaveProperty('accessToken');
            expect(typeof refreshResult.accessToken).toBe('string');

            const newDecoded = verifyAccessToken(refreshResult.accessToken);
            expect(newDecoded.id).toBe(user.id);

            // Clean up
            await userService.deleteUser(user.id);
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);
  });
});
