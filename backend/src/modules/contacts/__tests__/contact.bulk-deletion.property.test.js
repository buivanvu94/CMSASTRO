import { describe, beforeAll, beforeEach, afterAll, it, expect } from '@jest/globals';
import fc from 'fast-check';
import sequelize from '../../../config/database.js';
import { setupAssociations } from '../../../config/associations.js';
import Contact from '../contact.model.js';
import * as contactService from '../contact.service.js';

/**
 * Property-Based Tests for Bulk Contact Deletion
 * Feature: cms-system, Property 39: Bulk contact deletion
 * Validates: Requirements 7.6
 */

describe('Bulk Contact Deletion - Property Tests', () => {
  beforeAll(async () => {
    setupAssociations();
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await Contact.destroy({ where: {}, truncate: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  // Configure fast-check to run 100 iterations minimum
  const fcConfig = { numRuns: 100 };

  /**
   * Property 39: Bulk contact deletion
   * For any set of contact IDs, when performing bulk delete,
   * all specified contacts should be removed from the database.
   */
  describe('Property 39: Bulk contact deletion', () => {
    // Helper to create test contacts
    const createTestContacts = async (count) => {
      const contacts = [];
      for (let i = 0; i < count; i++) {
        const contact = await Contact.create({
          name: `Test User ${i}`,
          email: `test${i}@example.com`,
          subject: `Test Subject ${i}`,
          message: `Test message ${i} with enough characters to pass validation`,
          status: 'new'
        });
        contacts.push(contact);
      }
      return contacts;
    };

    it('should delete all specified contacts for any set of IDs', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 20 }),
          async (contactCount) => {
            // Create contacts
            const contacts = await createTestContacts(contactCount);
            const contactIds = contacts.map(c => c.id);

            // Get initial count
            const initialCount = await Contact.count();
            expect(initialCount).toBe(contactCount);

            // Delete all contacts
            const deletedCount = await contactService.deleteMultiple(contactIds);

            // Property: deleted count should match number of IDs
            expect(deletedCount).toBe(contactCount);

            // Property: all contacts should be removed
            const remainingCount = await Contact.count();
            expect(remainingCount).toBe(0);

            // Property: none of the deleted IDs should exist
            for (const id of contactIds) {
              const contact = await Contact.findByPk(id);
              expect(contact).toBeNull();
            }

            return true;
          }
        ),
        fcConfig
      );
    }, 120000);

    it('should delete only specified contacts, leaving others intact', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 5, max: 15 }),
          fc.integer({ min: 1, max: 10 }),
          async (totalCount, deleteCount) => {
            // Ensure we don't try to delete more than we create
            const actualDeleteCount = Math.min(deleteCount, totalCount);

            // Create contacts
            const contacts = await createTestContacts(totalCount);
            
            // Select random contacts to delete
            const contactsToDelete = contacts.slice(0, actualDeleteCount);
            const contactsToKeep = contacts.slice(actualDeleteCount);
            
            const idsToDelete = contactsToDelete.map(c => c.id);
            const idsToKeep = contactsToKeep.map(c => c.id);

            // Delete selected contacts
            const deletedCount = await contactService.deleteMultiple(idsToDelete);

            // Property: correct number deleted
            expect(deletedCount).toBe(actualDeleteCount);

            // Property: deleted contacts should not exist
            for (const id of idsToDelete) {
              const contact = await Contact.findByPk(id);
              expect(contact).toBeNull();
            }

            // Property: kept contacts should still exist
            for (const id of idsToKeep) {
              const contact = await Contact.findByPk(id);
              expect(contact).not.toBeNull();
            }

            // Property: remaining count should be correct
            const remainingCount = await Contact.count();
            expect(remainingCount).toBe(totalCount - actualDeleteCount);

            return true;
          }
        ),
        { numRuns: 50 } // Fewer runs due to complexity
      );
    }, 120000);

    it('should handle deletion of contacts with different statuses', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.constantFrom('new', 'read', 'replied', 'spam'),
            { minLength: 3, maxLength: 10 }
          ),
          async (statuses) => {
            // Create contacts with different statuses
            const contacts = [];
            for (let i = 0; i < statuses.length; i++) {
              const contact = await Contact.create({
                name: `User ${i}`,
                email: `user${i}@example.com`,
                subject: `Subject ${i}`,
                message: `Message ${i} with enough characters`,
                status: statuses[i]
              });
              contacts.push(contact);
            }

            const contactIds = contacts.map(c => c.id);

            // Delete all contacts
            const deletedCount = await contactService.deleteMultiple(contactIds);

            // Property: all contacts deleted regardless of status
            expect(deletedCount).toBe(statuses.length);

            const remainingCount = await Contact.count();
            expect(remainingCount).toBe(0);

            return true;
          }
        ),
        fcConfig
      );
    }, 120000);

    it('should return correct count for partial deletions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 5, max: 15 }),
          async (contactCount) => {
            // Create contacts
            const contacts = await createTestContacts(contactCount);
            
            // Mix of valid and invalid IDs
            const validIds = contacts.slice(0, Math.floor(contactCount / 2)).map(c => c.id);
            const invalidIds = [99999, 99998, 99997];
            const mixedIds = [...validIds, ...invalidIds];

            // Delete with mixed IDs
            const deletedCount = await contactService.deleteMultiple(mixedIds);

            // Property: only valid IDs are deleted
            expect(deletedCount).toBe(validIds.length);

            // Property: invalid IDs don't cause errors
            const remainingCount = await Contact.count();
            expect(remainingCount).toBe(contactCount - validIds.length);

            return true;
          }
        ),
        { numRuns: 50 }
      );
    }, 120000);
  });

  describe('Edge cases for bulk deletion', () => {
    it('should handle deletion of single contact', async () => {
      const contact = await Contact.create({
        name: 'Single User',
        email: 'single@example.com',
        subject: 'Single Subject',
        message: 'Single message with enough characters',
        status: 'new'
      });

      const deletedCount = await contactService.deleteMultiple([contact.id]);

      expect(deletedCount).toBe(1);
      
      const remaining = await Contact.findByPk(contact.id);
      expect(remaining).toBeNull();
    });

    it('should handle deletion of all contacts', async () => {
      const contacts = await createTestContacts(10);
      const allIds = contacts.map(c => c.id);

      const deletedCount = await contactService.deleteMultiple(allIds);

      expect(deletedCount).toBe(10);
      
      const remainingCount = await Contact.count();
      expect(remainingCount).toBe(0);
    });

    it('should handle deletion with duplicate IDs', async () => {
      const contacts = await createTestContacts(5);
      const id = contacts[0].id;
      
      // Try to delete same ID multiple times
      const duplicateIds = [id, id, id];

      const deletedCount = await contactService.deleteMultiple(duplicateIds);

      // Should only delete once
      expect(deletedCount).toBe(1);
      
      const contact = await Contact.findByPk(id);
      expect(contact).toBeNull();
    });

    it('should handle deletion with non-existent IDs', async () => {
      const contacts = await createTestContacts(3);
      
      // Mix of valid and invalid IDs
      const validId = contacts[0].id;
      const invalidIds = [99999, 88888, 77777];
      const mixedIds = [validId, ...invalidIds];

      const deletedCount = await contactService.deleteMultiple(mixedIds);

      // Should only delete the valid one
      expect(deletedCount).toBe(1);
      
      const remainingCount = await Contact.count();
      expect(remainingCount).toBe(2);
    });

    it('should handle deletion with only non-existent IDs', async () => {
      await createTestContacts(5);
      
      const invalidIds = [99999, 88888, 77777];

      const deletedCount = await contactService.deleteMultiple(invalidIds);

      // Should delete nothing
      expect(deletedCount).toBe(0);
      
      const remainingCount = await Contact.count();
      expect(remainingCount).toBe(5);
    });

    it('should handle large batch deletions', async () => {
      const contacts = await createTestContacts(50);
      const allIds = contacts.map(c => c.id);

      const deletedCount = await contactService.deleteMultiple(allIds);

      expect(deletedCount).toBe(50);
      
      const remainingCount = await Contact.count();
      expect(remainingCount).toBe(0);
    });
  });

  describe('Validation for bulk deletion', () => {
    it('should reject empty array', async () => {
      await expect(
        contactService.deleteMultiple([])
      ).rejects.toThrow('IDs must be a non-empty array');
    });

    it('should reject non-array input', async () => {
      await expect(
        contactService.deleteMultiple(123)
      ).rejects.toThrow('IDs must be a non-empty array');
    });

    it('should reject null input', async () => {
      await expect(
        contactService.deleteMultiple(null)
      ).rejects.toThrow('IDs must be a non-empty array');
    });

    it('should reject undefined input', async () => {
      await expect(
        contactService.deleteMultiple(undefined)
      ).rejects.toThrow('IDs must be a non-empty array');
    });
  });

  describe('Idempotence of bulk deletion', () => {
    it('should be idempotent - deleting twice has same effect as once', async () => {
      const contacts = await createTestContacts(5);
      const contactIds = contacts.map(c => c.id);

      // First deletion
      const firstDeleteCount = await contactService.deleteMultiple(contactIds);
      expect(firstDeleteCount).toBe(5);

      // Second deletion with same IDs
      const secondDeleteCount = await contactService.deleteMultiple(contactIds);
      expect(secondDeleteCount).toBe(0);

      // Final count should be 0
      const finalCount = await Contact.count();
      expect(finalCount).toBe(0);
    });
  });

  describe('Bulk deletion with filtering', () => {
    it('should delete contacts matching specific criteria', async () => {
      // Create contacts with different statuses
      await Contact.create({
        name: 'New Contact 1',
        email: 'new1@example.com',
        subject: 'Subject 1',
        message: 'Message 1 with enough characters',
        status: 'new'
      });

      await Contact.create({
        name: 'Read Contact',
        email: 'read@example.com',
        subject: 'Subject 2',
        message: 'Message 2 with enough characters',
        status: 'read'
      });

      await Contact.create({
        name: 'New Contact 2',
        email: 'new2@example.com',
        subject: 'Subject 3',
        message: 'Message 3 with enough characters',
        status: 'new'
      });

      // Get all 'new' contacts
      const newContacts = await Contact.findAll({ where: { status: 'new' } });
      const newContactIds = newContacts.map(c => c.id);

      // Delete only 'new' contacts
      const deletedCount = await contactService.deleteMultiple(newContactIds);

      expect(deletedCount).toBe(2);

      // Only 'read' contact should remain
      const remainingCount = await Contact.count();
      expect(remainingCount).toBe(1);

      const remaining = await Contact.findOne();
      expect(remaining.status).toBe('read');
    });
  });

  // Helper function for tests
  async function createTestContacts(count) {
    const contacts = [];
    for (let i = 0; i < count; i++) {
      const contact = await Contact.create({
        name: `Test User ${i}`,
        email: `test${i}@example.com`,
        subject: `Test Subject ${i}`,
        message: `Test message ${i} with enough characters to pass validation`,
        status: 'new'
      });
      contacts.push(contact);
    }
    return contacts;
  }
});
