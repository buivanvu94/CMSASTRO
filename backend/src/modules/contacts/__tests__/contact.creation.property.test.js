import { describe, beforeAll, beforeEach, afterAll, it, expect } from '@jest/globals';
import fc from 'fast-check';
import sequelize from '../../../config/database.js';
import { setupAssociations } from '../../../config/associations.js';
import Contact from '../contact.model.js';
import * as contactService from '../contact.service.js';

/**
 * Property-Based Tests for Contact Creation
 * Feature: cms-system, Property 36: Contact creation defaults to new
 * Validates: Requirements 7.1
 */

describe('Contact Creation - Property Tests', () => {
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
   * Property 36: Contact creation defaults to new
   * For any valid contact form submission, when created,
   * the contact should have status='new'.
   */
  describe('Property 36: Contact creation defaults to new', () => {
    // Generator for valid names
    const nameArb = fc.string({ minLength: 2, maxLength: 100 })
      .filter(s => s.trim().length >= 2);

    // Generator for valid emails
    const emailArb = fc.emailAddress();

    // Generator for valid subjects
    const subjectArb = fc.string({ minLength: 2, maxLength: 255 })
      .filter(s => s.trim().length >= 2);

    // Generator for valid messages
    const messageArb = fc.string({ minLength: 10, maxLength: 1000 })
      .filter(s => s.trim().length >= 10);

    // Generator for optional phone numbers
    const phoneArb = fc.option(
      fc.string({ minLength: 8, maxLength: 20 })
        .map(s => s.replace(/[^0-9+\-() ]/g, ''))
        .filter(s => s.length >= 8),
      { nil: null }
    );

    // Generator for optional IP addresses
    const ipArb = fc.option(
      fc.tuple(
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 })
      ).map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`),
      { nil: null }
    );

    // Generator for optional user agents
    const userAgentArb = fc.option(
      fc.constantFrom(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
      ),
      { nil: null }
    );

    it('should create contacts with new status for any valid data', async () => {
      await fc.assert(
        fc.asyncProperty(
          nameArb,
          emailArb,
          subjectArb,
          messageArb,
          phoneArb,
          ipArb,
          userAgentArb,
          async (name, email, subject, message, phone, ip, userAgent) => {
            const contactData = {
              name,
              email,
              subject,
              message,
              phone
            };

            const contact = await contactService.create(contactData, ip, userAgent);

            // Property: status should always be 'new'
            expect(contact.status).toBe('new');
            
            // Additional checks to ensure data integrity
            expect(contact.name).toBe(name);
            expect(contact.email).toBe(email);
            expect(contact.subject).toBe(subject);
            expect(contact.message).toBe(message);
            expect(contact.isNew()).toBe(true);

            return true;
          }
        ),
        fcConfig
      );
    }, 60000);

    it('should create new contacts regardless of other field values', async () => {
      await fc.assert(
        fc.asyncProperty(
          nameArb,
          emailArb,
          subjectArb,
          messageArb,
          async (name, email, subject, message) => {
            const contact = await contactService.create({
              name,
              email,
              subject,
              message
            });

            // Property: status is always new, independent of other fields
            return contact.status === 'new';
          }
        ),
        fcConfig
      );
    }, 60000);

    it('should not allow explicit status override during creation', async () => {
      await fc.assert(
        fc.asyncProperty(
          nameArb,
          emailArb,
          subjectArb,
          messageArb,
          fc.constantFrom('read', 'replied', 'spam'),
          async (name, email, subject, message, attemptedStatus) => {
            // Try to create with a different status
            const contactData = {
              name,
              email,
              subject,
              message,
              status: attemptedStatus // Attempt to override
            };

            const contact = await contactService.create(contactData);

            // Property: status should still be 'new' regardless of attempted override
            return contact.status === 'new';
          }
        ),
        fcConfig
      );
    }, 60000);

    it('should store IP address and user agent when provided', async () => {
      await fc.assert(
        fc.asyncProperty(
          nameArb,
          emailArb,
          subjectArb,
          messageArb,
          ipArb,
          userAgentArb,
          async (name, email, subject, message, ip, userAgent) => {
            const contact = await contactService.create(
              { name, email, subject, message },
              ip,
              userAgent
            );

            // Property: status is new and metadata is stored
            const statusIsNew = contact.status === 'new';
            const ipMatches = contact.ip_address === ip;
            const userAgentMatches = contact.user_agent === userAgent;

            return statusIsNew && ipMatches && userAgentMatches;
          }
        ),
        fcConfig
      );
    }, 60000);
  });

  describe('Edge cases for contact creation', () => {
    it('should handle minimum length fields', async () => {
      const contact = await contactService.create({
        name: 'Jo',
        email: 'a@b.co',
        subject: 'Hi',
        message: '1234567890'
      });

      expect(contact.status).toBe('new');
      expect(contact.name).toBe('Jo');
    });

    it('should handle maximum length fields', async () => {
      const longName = 'A'.repeat(100);
      const longSubject = 'B'.repeat(255);
      const longMessage = 'C'.repeat(1000);

      const contact = await contactService.create({
        name: longName,
        email: 'test@example.com',
        subject: longSubject,
        message: longMessage
      });

      expect(contact.status).toBe('new');
      expect(contact.name).toBe(longName);
      expect(contact.subject).toBe(longSubject);
    });

    it('should handle contacts with phone numbers', async () => {
      const contact = await contactService.create({
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'This is a test message with enough characters',
        phone: '+1-234-567-8900'
      });

      expect(contact.status).toBe('new');
      expect(contact.phone).toBe('+1-234-567-8900');
    });

    it('should handle contacts without phone numbers', async () => {
      const contact = await contactService.create({
        name: 'Jane Smith',
        email: 'jane@example.com',
        subject: 'Another Test',
        message: 'Another test message with sufficient length'
      });

      expect(contact.status).toBe('new');
      expect(contact.phone).toBeNull();
    });

    it('should handle contacts with IP address', async () => {
      const contact = await contactService.create(
        {
          name: 'Bob Wilson',
          email: 'bob@example.com',
          subject: 'IP Test',
          message: 'Testing IP address storage functionality'
        },
        '192.168.1.100'
      );

      expect(contact.status).toBe('new');
      expect(contact.ip_address).toBe('192.168.1.100');
    });

    it('should handle contacts with user agent', async () => {
      const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
      
      const contact = await contactService.create(
        {
          name: 'Alice Brown',
          email: 'alice@example.com',
          subject: 'User Agent Test',
          message: 'Testing user agent storage functionality'
        },
        null,
        userAgent
      );

      expect(contact.status).toBe('new');
      expect(contact.user_agent).toBe(userAgent);
    });
  });

  describe('Validation for invalid contact data', () => {
    it('should reject contacts without name', async () => {
      await expect(
        contactService.create({
          email: 'test@example.com',
          subject: 'Test',
          message: 'Test message with enough characters'
        })
      ).rejects.toThrow();
    });

    it('should reject contacts without email', async () => {
      await expect(
        contactService.create({
          name: 'Test User',
          subject: 'Test',
          message: 'Test message with enough characters'
        })
      ).rejects.toThrow();
    });

    it('should reject contacts without subject', async () => {
      await expect(
        contactService.create({
          name: 'Test User',
          email: 'test@example.com',
          message: 'Test message with enough characters'
        })
      ).rejects.toThrow();
    });

    it('should reject contacts without message', async () => {
      await expect(
        contactService.create({
          name: 'Test User',
          email: 'test@example.com',
          subject: 'Test'
        })
      ).rejects.toThrow();
    });

    it('should reject contacts with too short name', async () => {
      await expect(
        Contact.create({
          name: 'A',
          email: 'test@example.com',
          subject: 'Test',
          message: 'Test message with enough characters'
        })
      ).rejects.toThrow();
    });

    it('should reject contacts with too short message', async () => {
      await expect(
        Contact.create({
          name: 'Test User',
          email: 'test@example.com',
          subject: 'Test',
          message: 'Short'
        })
      ).rejects.toThrow();
    });

    it('should reject contacts with invalid email', async () => {
      await expect(
        Contact.create({
          name: 'Test User',
          email: 'invalid-email',
          subject: 'Test',
          message: 'Test message with enough characters'
        })
      ).rejects.toThrow();
    });
  });

  describe('Instance methods', () => {
    it('should correctly identify new contacts', async () => {
      const contact = await contactService.create({
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test',
        message: 'Test message with enough characters'
      });

      expect(contact.isNew()).toBe(true);
      expect(contact.isRead()).toBe(false);
      expect(contact.isReplied()).toBe(false);
      expect(contact.isSpam()).toBe(false);
    });

    it('should allow marking as read', async () => {
      const contact = await contactService.create({
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test',
        message: 'Test message with enough characters'
      });

      await contact.markAsRead();

      expect(contact.status).toBe('read');
      expect(contact.isRead()).toBe(true);
      expect(contact.isNew()).toBe(false);
    });

    it('should allow marking as replied', async () => {
      const contact = await contactService.create({
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test',
        message: 'Test message with enough characters'
      });

      await contact.markAsReplied();

      expect(contact.status).toBe('replied');
      expect(contact.isReplied()).toBe(true);
      expect(contact.isNew()).toBe(false);
    });

    it('should allow marking as spam', async () => {
      const contact = await contactService.create({
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test',
        message: 'Test message with enough characters'
      });

      await contact.markAsSpam();

      expect(contact.status).toBe('spam');
      expect(contact.isSpam()).toBe(true);
      expect(contact.isNew()).toBe(false);
    });
  });
});
