import { describe, beforeAll, beforeEach, afterAll, it, expect } from '@jest/globals';
import fc from 'fast-check';
import sequelize from '../../../config/database.js';
import { setupAssociations } from '../../../config/associations.js';
import User from '../user.model.js';
import * as userService from '../user.service.js';

/**
 * Property-Based Tests for User Password Encryption
 * Feature: cms-system, Property 7: User creation encrypts passwords
 * Validates: Requirements 2.1
 */

describe('User Password Encryption - Property Tests', () => {
  beforeAll(async () => {
    setupAssociations();
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await User.destroy({ where: {}, truncate: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  // Configure fast-check to run 100 iterations minimum
  const fcConfig = { numRuns: 100 };

  /**
   * Property 7: User creation encrypts passwords
   * For any valid user data with a plaintext password, when an administrator 
   * creates the user, the stored password should be encrypted and not match 
   * the plaintext input.
   */
  describe('Property 7: User creation encrypts passwords', () => {
    // Generator for valid full names
    const fullNameArb = fc.string({ minLength: 2, maxLength: 100 })
      .filter(s => s.trim().length >= 2);

    // Generator for valid emails
    const emailArb = fc.emailAddress();

    // Generator for passwords (at least 6 characters)
    const passwordArb = fc.string({ minLength: 6, maxLength: 50 })
      .filter(s => s.trim().length >= 6);

    // Generator for roles
    const roleArb = fc.constantFrom('admin', 'editor', 'author');

    // Generator for status
    const statusArb = fc.constantFrom('active', 'inactive');

    it('should encrypt passwords for any valid user data', async () => {
      await fc.assert(
        fc.asyncProperty(
          fullNameArb,
          emailArb,
          passwordArb,
          roleArb,
          statusArb,
          async (fullName, email, password, role, status) => {
            const userData = {
              full_name: fullName,
              email,
              password,
              role,
              status
            };

            const user = await userService.create(userData);

            // Property: stored password should not match plaintext
            expect(user.password).not.toBe(password);

            // Property: stored password should be a hash (bcrypt format)
            expect(user.password).toMatch(/^\$2[aby]\$\d{2}\$.{53}$/);

            // Property: password should be verifiable with comparePassword
            const isValid = await userService.comparePassword(password, user.password);
            expect(isValid).toBe(true);

            // Property: wrong password should not verify
            const isInvalid = await userService.comparePassword(password + 'wrong', user.password);
            expect(isInvalid).toBe(false);

            return true;
          }
        ),
        fcConfig
      );
    }, 120000);

    it('should produce different hashes for same password', async () => {
      await fc.assert(
        fc.asyncProperty(
          fullNameArb,
          passwordArb,
          roleArb,
          async (fullName, password, role) => {
            // Create two users with same password
            const user1 = await userService.create({
              full_name: fullName,
              email: `user1-${Date.now()}-${Math.random()}@example.com`,
              password,
              role,
              status: 'active'
            });

            const user2 = await userService.create({
              full_name: fullName,
              email: `user2-${Date.now()}-${Math.random()}@example.com`,
              password,
              role,
              status: 'active'
            });

            // Property: hashes should be different (due to salt)
            expect(user1.password).not.toBe(user2.password);

            // Property: both should verify with same password
            const isValid1 = await userService.comparePassword(password, user1.password);
            const isValid2 = await userService.comparePassword(password, user2.password);
            expect(isValid1).toBe(true);
            expect(isValid2).toBe(true);

            return true;
          }
        ),
        { numRuns: 50 }
      );
    }, 120000);

    it('should encrypt passwords regardless of other field values', async () => {
      await fc.assert(
        fc.asyncProperty(
          fullNameArb,
          emailArb,
          passwordArb,
          roleArb,
          statusArb,
          async (fullName, email, password, role, status) => {
            const user = await userService.create({
              full_name: fullName,
              email,
              password,
              role,
              status
            });

            // Property: password is always encrypted, independent of other fields
            const isEncrypted = user.password !== password;
            const isBcryptFormat = /^\$2[aby]\$\d{2}\$.{53}$/.test(user.password);

            return isEncrypted && isBcryptFormat;
          }
        ),
        fcConfig
      );
    }, 120000);

    it('should handle password updates with encryption', async () => {
      await fc.assert(
        fc.asyncProperty(
          fullNameArb,
          emailArb,
          passwordArb,
          passwordArb,
          roleArb,
          async (fullName, email, oldPassword, newPassword, role) => {
            // Create user with initial password
            const user = await userService.create({
              full_name: fullName,
              email,
              password: oldPassword,
              role,
              status: 'active'
            });

            const originalHash = user.password;

            // Update password
            const updated = await userService.update(user.id, {
              password: newPassword
            });

            // Property: new password should be encrypted
            expect(updated.password).not.toBe(newPassword);
            expect(updated.password).toMatch(/^\$2[aby]\$\d{2}\$.{53}$/);

            // Property: new hash should be different from old hash
            expect(updated.password).not.toBe(originalHash);

            // Property: new password should verify
            const isNewValid = await userService.comparePassword(newPassword, updated.password);
            expect(isNewValid).toBe(true);

            // Property: old password should not verify
            const isOldValid = await userService.comparePassword(oldPassword, updated.password);
            expect(isOldValid).toBe(false);

            return true;
          }
        ),
        { numRuns: 50 }
      );
    }, 120000);
  });

  describe('Password encryption strength', () => {
    it('should use bcrypt with appropriate salt rounds', async () => {
      const user = await userService.create({
        full_name: 'Test User',
        email: 'test@example.com',
        password: 'testpassword123',
        role: 'author',
        status: 'active'
      });

      // Bcrypt hash format: $2a$10$... (10 is the salt rounds)
      expect(user.password).toMatch(/^\$2[aby]\$10\$/);
    });

    it('should handle various password lengths', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 6, max: 100 }),
          async (length) => {
            const password = 'a'.repeat(length);
            
            const user = await userService.create({
              full_name: 'Test User',
              email: `test-${Date.now()}-${Math.random()}@example.com`,
              password,
              role: 'author',
              status: 'active'
            });

            // Property: password should be encrypted regardless of length
            expect(user.password).not.toBe(password);
            expect(user.password).toMatch(/^\$2[aby]\$\d{2}\$.{53}$/);

            const isValid = await userService.comparePassword(password, user.password);
            expect(isValid).toBe(true);

            return true;
          }
        ),
        fcConfig
      );
    }, 120000);

    it('should handle passwords with special characters', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 6, maxLength: 50 }),
          async (password) => {
            const user = await userService.create({
              full_name: 'Test User',
              email: `test-${Date.now()}-${Math.random()}@example.com`,
              password,
              role: 'author',
              status: 'active'
            });

            // Property: special characters should be handled correctly
            const isValid = await userService.comparePassword(password, user.password);
            expect(isValid).toBe(true);

            return true;
          }
        ),
        fcConfig
      );
    }, 120000);
  });

  describe('Password verification', () => {
    it('should correctly verify matching passwords', async () => {
      await fc.assert(
        fc.asyncProperty(
          passwordArb,
          async (password) => {
            const hash = await userService.hashPassword(password);
            const isValid = await userService.comparePassword(password, hash);

            return isValid === true;
          }
        ),
        fcConfig
      );
    });

    it('should correctly reject non-matching passwords', async () => {
      await fc.assert(
        fc.asyncProperty(
          passwordArb,
          passwordArb,
          async (password1, password2) => {
            // Only test when passwords are different
            if (password1 === password2) return true;

            const hash = await userService.hashPassword(password1);
            const isValid = await userService.comparePassword(password2, hash);

            return isValid === false;
          }
        ),
        fcConfig
      );
    });

    it('should be case-sensitive', async () => {
      const password = 'TestPassword123';
      const user = await userService.create({
        full_name: 'Test User',
        email: 'test@example.com',
        password,
        role: 'author',
        status: 'active'
      });

      const isValidLower = await userService.comparePassword('testpassword123', user.password);
      const isValidUpper = await userService.comparePassword('TESTPASSWORD123', user.password);
      const isValidCorrect = await userService.comparePassword(password, user.password);

      expect(isValidLower).toBe(false);
      expect(isValidUpper).toBe(false);
      expect(isValidCorrect).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle minimum length passwords', async () => {
      const user = await userService.create({
        full_name: 'Test User',
        email: 'test@example.com',
        password: '123456',
        role: 'author',
        status: 'active'
      });

      expect(user.password).not.toBe('123456');
      
      const isValid = await userService.comparePassword('123456', user.password);
      expect(isValid).toBe(true);
    });

    it('should handle very long passwords', async () => {
      const longPassword = 'a'.repeat(200);
      
      const user = await userService.create({
        full_name: 'Test User',
        email: 'test@example.com',
        password: longPassword,
        role: 'author',
        status: 'active'
      });

      expect(user.password).not.toBe(longPassword);
      
      const isValid = await userService.comparePassword(longPassword, user.password);
      expect(isValid).toBe(true);
    });

    it('should handle passwords with unicode characters', async () => {
      const unicodePassword = 'パスワード123!@#';
      
      const user = await userService.create({
        full_name: 'Test User',
        email: 'test@example.com',
        password: unicodePassword,
        role: 'author',
        status: 'active'
      });

      expect(user.password).not.toBe(unicodePassword);
      
      const isValid = await userService.comparePassword(unicodePassword, user.password);
      expect(isValid).toBe(true);
    });

    it('should handle passwords with whitespace', async () => {
      const passwordWithSpaces = '  password with spaces  ';
      
      const user = await userService.create({
        full_name: 'Test User',
        email: 'test@example.com',
        password: passwordWithSpaces,
        role: 'author',
        status: 'active'
      });

      // Exact match including spaces
      const isValid = await userService.comparePassword(passwordWithSpaces, user.password);
      expect(isValid).toBe(true);

      // Without spaces should not match
      const isInvalid = await userService.comparePassword('password with spaces', user.password);
      expect(isInvalid).toBe(false);
    });
  });

  describe('Security properties', () => {
    it('should not store plaintext passwords in database', async () => {
      await fc.assert(
        fc.asyncProperty(
          fullNameArb,
          emailArb,
          passwordArb,
          roleArb,
          async (fullName, email, password, role) => {
            const user = await userService.create({
              full_name: fullName,
              email,
              password,
              role,
              status: 'active'
            });

            // Fetch from database
            const dbUser = await User.findByPk(user.id);

            // Property: database should not contain plaintext password
            return dbUser.password !== password;
          }
        ),
        fcConfig
      );
    }, 120000);

    it('should produce irreversible hashes', async () => {
      const password = 'testpassword123';
      const hash = await userService.hashPassword(password);

      // There should be no way to get original password from hash
      expect(hash).not.toContain(password);
      expect(hash.length).toBeGreaterThan(password.length);
    });

    it('should use consistent hashing algorithm', async () => {
      await fc.assert(
        fc.asyncProperty(
          passwordArb,
          async (password) => {
            const hash1 = await userService.hashPassword(password);
            const hash2 = await userService.hashPassword(password);

            // Both hashes should verify the same password
            const isValid1 = await userService.comparePassword(password, hash1);
            const isValid2 = await userService.comparePassword(password, hash2);

            return isValid1 && isValid2;
          }
        ),
        fcConfig
      );
    });
  });

  describe('Password update scenarios', () => {
    it('should maintain encryption when updating other fields', async () => {
      const user = await userService.create({
        full_name: 'Original Name',
        email: 'original@example.com',
        password: 'originalpassword',
        role: 'author',
        status: 'active'
      });

      const originalHash = user.password;

      // Update only name
      const updated = await userService.update(user.id, {
        full_name: 'Updated Name'
      });

      // Password hash should remain unchanged
      expect(updated.password).toBe(originalHash);

      // Original password should still verify
      const isValid = await userService.comparePassword('originalpassword', updated.password);
      expect(isValid).toBe(true);
    });

    it('should handle updatePassword method correctly', async () => {
      const oldPassword = 'oldpassword123';
      const newPassword = 'newpassword456';

      const user = await userService.create({
        full_name: 'Test User',
        email: 'test@example.com',
        password: oldPassword,
        role: 'author',
        status: 'active'
      });

      // Update password using updatePassword method
      await userService.updatePassword(user.id, oldPassword, newPassword);

      // Fetch updated user
      const updated = await User.findByPk(user.id);

      // New password should verify
      const isNewValid = await userService.comparePassword(newPassword, updated.password);
      expect(isNewValid).toBe(true);

      // Old password should not verify
      const isOldValid = await userService.comparePassword(oldPassword, updated.password);
      expect(isOldValid).toBe(false);
    });

    it('should reject updatePassword with wrong old password', async () => {
      const user = await userService.create({
        full_name: 'Test User',
        email: 'test@example.com',
        password: 'correctpassword',
        role: 'author',
        status: 'active'
      });

      await expect(
        userService.updatePassword(user.id, 'wrongpassword', 'newpassword')
      ).rejects.toThrow('Current password is incorrect');
    });
  });
});
