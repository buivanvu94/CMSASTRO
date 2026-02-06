/**
 * Property-Based Tests for Invalid Credentials
 * 
 * Tests Property 2: Invalid credentials are rejected
 * Validates Requirements 1.2
 * 
 * Uses fast-check for property-based testing with minimum 100 iterations
 */

import { describe, beforeAll, beforeEach, afterAll, test, expect } from '@jest/globals';
import fc from 'fast-check';
import * as authService from '../auth.service.js';
import * as userService from '../../users/user.service.js';
import { AuthenticationError } from '../../../middlewares/errorHandler.js';
import sequelize from '../../../config/database.js';
import { setupAssociations } from '../../../config/associations.js';

describe('Auth Invalid Credentials Property Tests', () => {
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

  describe('Property 2: Invalid credentials are rejected', () => {
    /**
     * For any invalid credential combination (wrong password, non-existent email, malformed input),
     * the login attempt should be rejected with an appropriate error message.
     */
    test('should reject login with wrong password', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            full_name: fc.string({ minLength: 2, maxLength: 100 }),
            email: fc.emailAddress(),
            password: fc.string({ minLength: 8, maxLength: 50 }),
            wrongPassword: fc.string({ minLength: 8, maxLength: 50 }),
            role: fc.constantFrom('admin', 'editor', 'author')
          }).filter(data => data.password !== data.wrongPassword),
          async (userData) => {
            // Create user with valid credentials
            const user = await userService.create({
              full_name: userData.full_name,
              email: userData.email,
              password: userData.password,
              role: userData.role,
              status: 'active'
            });

            // Attempt login with wrong password
            await expect(
              authService.login(userData.email, userData.wrongPassword)
            ).rejects.toThrow(AuthenticationError);

            await expect(
              authService.login(userData.email, userData.wrongPassword)
            ).rejects.toThrow('Invalid email or password');

            // Clean up
            await userService.deleteUser(user.id);
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);

    test('should reject login with non-existent email', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            email: fc.emailAddress(),
            password: fc.string({ minLength: 8, maxLength: 50 })
          }),
          async (credentials) => {
            // Ensure email doesn't exist
            const existingUser = await sequelize.models.User.findOne({
              where: { email: credentials.email }
            });

            if (existingUser) {
              return; // Skip this iteration if email exists
            }

            // Attempt login with non-existent email
            await expect(
              authService.login(credentials.email, credentials.password)
            ).rejects.toThrow(AuthenticationError);

            await expect(
              authService.login(credentials.email, credentials.password)
            ).rejects.toThrow('Invalid email or password');
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);

    test('should reject login for inactive users', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            full_name: fc.string({ minLength: 2, maxLength: 100 }),
            email: fc.emailAddress(),
            password: fc.string({ minLength: 8, maxLength: 50 }),
            role: fc.constantFrom('admin', 'editor', 'author'),
            status: fc.constantFrom('inactive', 'suspended')
          }),
          async (userData) => {
            // Create user with inactive status
            const user = await userService.create(userData);

            // Attempt login with correct credentials but inactive account
            await expect(
              authService.login(userData.email, userData.password)
            ).rejects.toThrow(AuthenticationError);

            await expect(
              authService.login(userData.email, userData.password)
            ).rejects.toThrow('Account is inactive');

            // Clean up
            await userService.deleteUser(user.id);
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);

    test('should reject login with empty credentials', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(
            { email: '', password: 'password123' },
            { email: 'test@example.com', password: '' },
            { email: '', password: '' }
          ),
          async (credentials) => {
            // Attempt login with empty credentials
            await expect(
              authService.login(credentials.email, credentials.password)
            ).rejects.toThrow();
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);

    test('should reject login with malformed email', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            email: fc.oneof(
              fc.constant('not-an-email'),
              fc.constant('missing@domain'),
              fc.constant('@nodomain.com'),
              fc.constant('spaces in@email.com'),
              fc.constant('double@@email.com')
            ),
            password: fc.string({ minLength: 8, maxLength: 50 })
          }),
          async (credentials) => {
            // Attempt login with malformed email
            await expect(
              authService.login(credentials.email, credentials.password)
            ).rejects.toThrow();
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);

    test('should not leak information about whether email exists', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            full_name: fc.string({ minLength: 2, maxLength: 100 }),
            existingEmail: fc.emailAddress(),
            nonExistentEmail: fc.emailAddress(),
            correctPassword: fc.string({ minLength: 8, maxLength: 50 }),
            wrongPassword: fc.string({ minLength: 8, maxLength: 50 }),
            role: fc.constantFrom('admin', 'editor', 'author')
          }).filter(data => 
            data.existingEmail !== data.nonExistentEmail &&
            data.correctPassword !== data.wrongPassword
          ),
          async (userData) => {
            // Create user with existing email
            const user = await userService.create({
              full_name: userData.full_name,
              email: userData.existingEmail,
              password: userData.correctPassword,
              role: userData.role,
              status: 'active'
            });

            // Try wrong password with existing email
            let errorMessage1;
            try {
              await authService.login(userData.existingEmail, userData.wrongPassword);
            } catch (error) {
              errorMessage1 = error.message;
            }

            // Try any password with non-existent email
            let errorMessage2;
            try {
              await authService.login(userData.nonExistentEmail, userData.wrongPassword);
            } catch (error) {
              errorMessage2 = error.message;
            }

            // Both should return the same generic error message
            expect(errorMessage1).toBe(errorMessage2);
            expect(errorMessage1).toBe('Invalid email or password');

            // Clean up
            await userService.deleteUser(user.id);
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);

    test('should reject multiple failed login attempts consistently', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            full_name: fc.string({ minLength: 2, maxLength: 100 }),
            email: fc.emailAddress(),
            password: fc.string({ minLength: 8, maxLength: 50 }),
            wrongPassword: fc.string({ minLength: 8, maxLength: 50 }),
            role: fc.constantFrom('admin', 'editor', 'author'),
            attempts: fc.integer({ min: 2, max: 5 })
          }).filter(data => data.password !== data.wrongPassword),
          async (userData) => {
            // Create user
            const user = await userService.create({
              full_name: userData.full_name,
              email: userData.email,
              password: userData.password,
              role: userData.role,
              status: 'active'
            });

            // Attempt multiple failed logins
            const errors = [];
            for (let i = 0; i < userData.attempts; i++) {
              try {
                await authService.login(userData.email, userData.wrongPassword);
              } catch (error) {
                errors.push(error);
              }
            }

            // All attempts should fail with same error
            expect(errors).toHaveLength(userData.attempts);
            errors.forEach(error => {
              expect(error).toBeInstanceOf(AuthenticationError);
              expect(error.message).toBe('Invalid email or password');
            });

            // Valid login should still work after failed attempts
            const result = await authService.login(userData.email, userData.password);
            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');

            // Clean up
            await userService.deleteUser(user.id);
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);

    test('should reject login with case-sensitive password', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            full_name: fc.string({ minLength: 2, maxLength: 100 }),
            email: fc.emailAddress(),
            password: fc.string({ minLength: 8, maxLength: 50 }).filter(p => p.toLowerCase() !== p.toUpperCase()),
            role: fc.constantFrom('admin', 'editor', 'author')
          }),
          async (userData) => {
            // Create user
            const user = await userService.create({
              ...userData,
              status: 'active'
            });

            // Try login with different case password
            const wrongCasePassword = userData.password === userData.password.toUpperCase()
              ? userData.password.toLowerCase()
              : userData.password.toUpperCase();

            if (wrongCasePassword !== userData.password) {
              await expect(
                authService.login(userData.email, wrongCasePassword)
              ).rejects.toThrow(AuthenticationError);
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
