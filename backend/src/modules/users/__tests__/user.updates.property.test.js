import { describe, beforeAll, beforeEach, afterAll, it, expect } from '@jest/globals';
import fc from 'fast-check';
import sequelize from '../../../config/database.js';
import { setupAssociations } from '../../../config/associations.js';
import User from '../user.model.js';
import * as userService from '../user.service.js';

/**
 * Property-Based Tests for User Updates
 * Feature: cms-system, Property 9: User updates persist correctly
 * Validates: Requirements 2.3
 */

describe('User Updates - Property Tests', () => {
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
   * Property 9: User updates persist correctly
   * For any valid user update data, when an administrator updates a user,
   * the changes should be persisted and retrievable in subsequent requests.
   */
  describe('Property 9: User updates persist correctly', () => {
    // Generator for valid full names
    const fullNameArb = fc.string({ minLength: 2, maxLength: 100 })
      .filter(s => s.trim().length >= 2);

    // Generator for valid emails
    const emailArb = fc.emailAddress();

    // Generator for passwords
    const passwordArb = fc.string({ minLength: 6, maxLength: 50 })
      .filter(s => s.trim().length >= 6);

    // Generator for roles
    const roleArb = fc.constantFrom('admin', 'editor', 'author');

    // Generator for status
    const statusArb = fc.constantFrom('active', 'inactive');

    it('should persist full_name updates for any valid value', async () => {
      await fc.assert(
        fc.asyncProperty(
          fullNameArb,
          fullNameArb,
          emailArb,
          passwordArb,
          roleArb,
          async (originalName, newName, email, password, role) => {
            // Create user
            const user = await userService.create({
              full_name: originalName,
              email,
              password,
              role,
              status: 'active'
            });

            // Update full_name
            const updated = await userService.update(user.id, {
              full_name: newName
            });

            // Property: update should be persisted
            expect(updated.full_name).toBe(newName);

            // Property: update should be retrievable
            const fetched = await userService.findById(user.id);
            expect(fetched.full_name).toBe(newName);

            return true;
          }
        ),
        fcConfig
      );
    }, 120000);

    it('should persist email updates for any valid value', async () => {
      await fc.assert(
        fc.asyncProperty(
          fullNameArb,
          emailArb,
          emailArb,
          passwordArb,
          roleArb,
          async (fullName, originalEmail, newEmail, password, role) => {
            // Create user
            const user = await userService.create({
              full_name: fullName,
              email: originalEmail,
              password,
              role,
              status: 'active'
            });

            // Update email
            const updated = await userService.update(user.id, {
              email: newEmail
            });

            // Property: update should be persisted
            expect(updated.email).toBe(newEmail);

            // Property: update should be retrievable
            const fetched = await userService.findById(user.id);
            expect(fetched.email).toBe(newEmail);

            return true;
          }
        ),
        { numRuns: 50 }
      );
    }, 120000);

    it('should persist role updates for any valid value', async () => {
      await fc.assert(
        fc.asyncProperty(
          fullNameArb,
          emailArb,
          passwordArb,
          roleArb,
          roleArb,
          async (fullName, email, password, originalRole, newRole) => {
            // Create user
            const user = await userService.create({
              full_name: fullName,
              email,
              password,
              role: originalRole,
              status: 'active'
            });

            // Update role
            const updated = await userService.update(user.id, {
              role: newRole
            });

            // Property: update should be persisted
            expect(updated.role).toBe(newRole);

            // Property: update should be retrievable
            const fetched = await userService.findById(user.id);
            expect(fetched.role).toBe(newRole);

            return true;
          }
        ),
        fcConfig
      );
    }, 120000);

    it('should persist status updates for any valid value', async () => {
      await fc.assert(
        fc.asyncProperty(
          fullNameArb,
          emailArb,
          passwordArb,
          roleArb,
          statusArb,
          statusArb,
          async (fullName, email, password, role, originalStatus, newStatus) => {
            // Create user
            const user = await userService.create({
              full_name: fullName,
              email,
              password,
              role,
              status: originalStatus
            });

            // Update status
            const updated = await userService.update(user.id, {
              status: newStatus
            });

            // Property: update should be persisted
            expect(updated.status).toBe(newStatus);

            // Property: update should be retrievable
            const fetched = await userService.findById(user.id);
            expect(fetched.status).toBe(newStatus);

            return true;
          }
        ),
        fcConfig
      );
    }, 120000);

    it('should persist multiple field updates simultaneously', async () => {
      await fc.assert(
        fc.asyncProperty(
          fullNameArb,
          fullNameArb,
          emailArb,
          emailArb,
          roleArb,
          roleArb,
          statusArb,
          statusArb,
          passwordArb,
          async (origName, newName, origEmail, newEmail, origRole, newRole, origStatus, newStatus, password) => {
            // Create user
            const user = await userService.create({
              full_name: origName,
              email: origEmail,
              password,
              role: origRole,
              status: origStatus
            });

            // Update multiple fields
            const updated = await userService.update(user.id, {
              full_name: newName,
              email: newEmail,
              role: newRole,
              status: newStatus
            });

            // Property: all updates should be persisted
            expect(updated.full_name).toBe(newName);
            expect(updated.email).toBe(newEmail);
            expect(updated.role).toBe(newRole);
            expect(updated.status).toBe(newStatus);

            // Property: all updates should be retrievable
            const fetched = await userService.findById(user.id);
            expect(fetched.full_name).toBe(newName);
            expect(fetched.email).toBe(newEmail);
            expect(fetched.role).toBe(newRole);
            expect(fetched.status).toBe(newStatus);

            return true;
          }
        ),
        { numRuns: 50 }
      );
    }, 120000);

    it('should persist updates across multiple sequential updates', async () => {
      await fc.assert(
        fc.asyncProperty(
          fullNameArb,
          fc.array(fullNameArb, { minLength: 2, maxLength: 5 }),
          emailArb,
          passwordArb,
          roleArb,
          async (initialName, nameUpdates, email, password, role) => {
            // Create user
            const user = await userService.create({
              full_name: initialName,
              email,
              password,
              role,
              status: 'active'
            });

            let lastUpdate;
            // Apply multiple updates
            for (const newName of nameUpdates) {
              lastUpdate = await userService.update(user.id, {
                full_name: newName
              });
            }

            // Property: final update should be persisted
            const finalName = nameUpdates[nameUpdates.length - 1];
            expect(lastUpdate.full_name).toBe(finalName);

            // Property: final update should be retrievable
            const fetched = await userService.findById(user.id);
            expect(fetched.full_name).toBe(finalName);

            return true;
          }
        ),
        { numRuns: 50 }
      );
    }, 120000);
  });

  describe('Update persistence verification', () => {
    it('should maintain data integrity after updates', async () => {
      const user = await userService.create({
        full_name: 'Original Name',
        email: 'original@example.com',
        password: 'password123',
        role: 'author',
        status: 'active'
      });

      const originalId = user.id;
      const originalCreatedAt = user.created_at;

      // Update user
      await userService.update(user.id, {
        full_name: 'Updated Name',
        role: 'editor'
      });

      // Fetch updated user
      const updated = await userService.findById(user.id);

      // ID should not change
      expect(updated.id).toBe(originalId);

      // created_at should not change
      expect(updated.created_at).toEqual(originalCreatedAt);

      // updated_at should change
      expect(updated.updated_at).not.toEqual(originalCreatedAt);

      // Updated fields should persist
      expect(updated.full_name).toBe('Updated Name');
      expect(updated.role).toBe('editor');

      // Unchanged fields should remain
      expect(updated.email).toBe('original@example.com');
      expect(updated.status).toBe('active');
    });

    it('should handle partial updates without affecting other fields', async () => {
      await fc.assert(
        fc.asyncProperty(
          fullNameArb,
          emailArb,
          passwordArb,
          roleArb,
          statusArb,
          fullNameArb,
          async (origName, email, password, role, status, newName) => {
            // Create user
            const user = await userService.create({
              full_name: origName,
              email,
              password,
              role,
              status
            });

            // Update only full_name
            await userService.update(user.id, {
              full_name: newName
            });

            // Fetch updated user
            const updated = await userService.findById(user.id);

            // Property: updated field should change
            expect(updated.full_name).toBe(newName);

            // Property: other fields should remain unchanged
            expect(updated.email).toBe(email);
            expect(updated.role).toBe(role);
            expect(updated.status).toBe(status);

            return true;
          }
        ),
        fcConfig
      );
    }, 120000);
  });

  describe('Edge cases for updates', () => {
    it('should handle updating to same values', async () => {
      const user = await userService.create({
        full_name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'author',
        status: 'active'
      });

      // Update to same values
      const updated = await userService.update(user.id, {
        full_name: 'Test User',
        role: 'author',
        status: 'active'
      });

      expect(updated.full_name).toBe('Test User');
      expect(updated.role).toBe('author');
      expect(updated.status).toBe('active');
    });

    it('should handle empty update object', async () => {
      const user = await userService.create({
        full_name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'author',
        status: 'active'
      });

      // Update with empty object
      const updated = await userService.update(user.id, {});

      // All fields should remain unchanged
      expect(updated.full_name).toBe('Test User');
      expect(updated.email).toBe('test@example.com');
      expect(updated.role).toBe('author');
      expect(updated.status).toBe('active');
    });

    it('should handle updating non-existent user', async () => {
      await expect(
        userService.update(99999, {
          full_name: 'New Name'
        })
      ).rejects.toThrow('User not found');
    });

    it('should reject duplicate email updates', async () => {
      const user1 = await userService.create({
        full_name: 'User 1',
        email: 'user1@example.com',
        password: 'password123',
        role: 'author',
        status: 'active'
      });

      const user2 = await userService.create({
        full_name: 'User 2',
        email: 'user2@example.com',
        password: 'password123',
        role: 'author',
        status: 'active'
      });

      // Try to update user2's email to user1's email
      await expect(
        userService.update(user2.id, {
          email: 'user1@example.com'
        })
      ).rejects.toThrow('Email already exists');
    });
  });

  describe('Password update persistence', () => {
    it('should persist password updates', async () => {
      const user = await userService.create({
        full_name: 'Test User',
        email: 'test@example.com',
        password: 'oldpassword',
        role: 'author',
        status: 'active'
      });

      const originalHash = user.password;

      // Update password
      const updated = await userService.update(user.id, {
        password: 'newpassword'
      });

      // Password hash should change
      expect(updated.password).not.toBe(originalHash);

      // New password should verify
      const isValid = await userService.comparePassword('newpassword', updated.password);
      expect(isValid).toBe(true);

      // Fetch from database
      const fetched = await userService.findById(user.id);
      const isValidFetched = await userService.comparePassword('newpassword', fetched.password);
      expect(isValidFetched).toBe(true);
    });

    it('should not update password when not provided', async () => {
      const user = await userService.create({
        full_name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'author',
        status: 'active'
      });

      const originalHash = user.password;

      // Update other fields without password
      await userService.update(user.id, {
        full_name: 'Updated Name'
      });

      // Fetch updated user
      const updated = await userService.findById(user.id);

      // Password should remain unchanged
      expect(updated.password).toBe(originalHash);

      // Original password should still verify
      const isValid = await userService.comparePassword('password123', updated.password);
      expect(isValid).toBe(true);
    });
  });

  describe('Concurrent updates', () => {
    it('should handle sequential updates correctly', async () => {
      const user = await userService.create({
        full_name: 'Original',
        email: 'test@example.com',
        password: 'password123',
        role: 'author',
        status: 'active'
      });

      // First update
      await userService.update(user.id, { full_name: 'First Update' });
      let fetched = await userService.findById(user.id);
      expect(fetched.full_name).toBe('First Update');

      // Second update
      await userService.update(user.id, { full_name: 'Second Update' });
      fetched = await userService.findById(user.id);
      expect(fetched.full_name).toBe('Second Update');

      // Third update
      await userService.update(user.id, { full_name: 'Third Update' });
      fetched = await userService.findById(user.id);
      expect(fetched.full_name).toBe('Third Update');
    });

    it('should maintain consistency across multiple field updates', async () => {
      const user = await userService.create({
        full_name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'author',
        status: 'active'
      });

      // Update name
      await userService.update(user.id, { full_name: 'Updated Name' });

      // Update role
      await userService.update(user.id, { role: 'editor' });

      // Update status
      await userService.update(user.id, { status: 'inactive' });

      // Fetch final state
      const final = await userService.findById(user.id);

      // All updates should be present
      expect(final.full_name).toBe('Updated Name');
      expect(final.role).toBe('editor');
      expect(final.status).toBe('inactive');
      expect(final.email).toBe('test@example.com');
    });
  });

  describe('Update timestamps', () => {
    it('should update updated_at timestamp on updates', async () => {
      const user = await userService.create({
        full_name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'author',
        status: 'active'
      });

      const originalUpdatedAt = user.updated_at;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100));

      // Update user
      const updated = await userService.update(user.id, {
        full_name: 'Updated Name'
      });

      // updated_at should change
      expect(updated.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should not update created_at timestamp on updates', async () => {
      const user = await userService.create({
        full_name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'author',
        status: 'active'
      });

      const originalCreatedAt = user.created_at;

      // Update user
      const updated = await userService.update(user.id, {
        full_name: 'Updated Name'
      });

      // created_at should not change
      expect(updated.created_at).toEqual(originalCreatedAt);
    });
  });
});
