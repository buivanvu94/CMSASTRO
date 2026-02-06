import { describe, beforeAll, beforeEach, afterAll, it, expect } from '@jest/globals';
import fc from 'fast-check';
import sequelize from '../../../config/database.js';
import { setupAssociations } from '../../../config/associations.js';
import Reservation from '../reservation.model.js';
import * as reservationService from '../reservation.service.js';

/**
 * Property-Based Tests for Reservation Creation
 * Feature: cms-system, Property 33: Reservation creation defaults to pending
 * Validates: Requirements 6.1
 */

describe('Reservation Creation - Property Tests', () => {
  beforeAll(async () => {
    setupAssociations();
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await Reservation.destroy({ where: {}, truncate: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  // Configure fast-check to run 100 iterations minimum
  const fcConfig = { numRuns: 100 };

  /**
   * Property 33: Reservation creation defaults to pending
   * For any valid reservation data, when a customer submits a reservation,
   * it should be created with status='pending'.
   */
  describe('Property 33: Reservation creation defaults to pending', () => {
    // Generator for valid customer names
    const customerNameArb = fc.string({ minLength: 2, maxLength: 100 })
      .filter(s => s.trim().length >= 2);

    // Generator for valid emails
    const emailArb = fc.emailAddress();

    // Generator for valid phone numbers
    const phoneArb = fc.string({ minLength: 8, maxLength: 20 })
      .map(s => s.replace(/[^0-9+\-() ]/g, ''))
      .filter(s => s.length >= 8);

    // Generator for valid party sizes (1-50)
    const partySizeArb = fc.integer({ min: 1, max: 50 });

    // Generator for future dates (today or later)
    const futureDateArb = fc.date({ min: new Date() })
      .map(d => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      });

    // Generator for valid times
    const timeArb = fc.integer({ min: 0, max: 23 })
      .chain(hour => 
        fc.integer({ min: 0, max: 59 }).map(minute => 
          `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`
        )
      );

    // Generator for optional special requests
    const specialRequestsArb = fc.option(
      fc.string({ maxLength: 500 }),
      { nil: null }
    );

    it('should create reservations with pending status for any valid data', async () => {
      await fc.assert(
        fc.asyncProperty(
          customerNameArb,
          emailArb,
          phoneArb,
          partySizeArb,
          futureDateArb,
          timeArb,
          specialRequestsArb,
          async (name, email, phone, partySize, date, time, specialRequests) => {
            const reservationData = {
              customer_name: name,
              customer_email: email,
              customer_phone: phone,
              party_size: partySize,
              reservation_date: date,
              reservation_time: time,
              special_requests: specialRequests
            };

            const reservation = await reservationService.create(reservationData);

            // Property: status should always be 'pending'
            expect(reservation.status).toBe('pending');
            
            // Additional checks to ensure data integrity
            expect(reservation.customer_name).toBe(name);
            expect(reservation.customer_email).toBe(email);
            expect(reservation.customer_phone).toBe(phone);
            expect(reservation.party_size).toBe(partySize);
            expect(reservation.isPending()).toBe(true);

            return true;
          }
        ),
        fcConfig
      );
    }, 60000);

    it('should create pending reservations regardless of other field values', async () => {
      await fc.assert(
        fc.asyncProperty(
          customerNameArb,
          emailArb,
          phoneArb,
          partySizeArb,
          futureDateArb,
          timeArb,
          async (name, email, phone, partySize, date, time) => {
            const reservation = await reservationService.create({
              customer_name: name,
              customer_email: email,
              customer_phone: phone,
              party_size: partySize,
              reservation_date: date,
              reservation_time: time
            });

            // Property: status is always pending, independent of other fields
            return reservation.status === 'pending';
          }
        ),
        fcConfig
      );
    }, 60000);

    it('should not allow explicit status override during creation', async () => {
      await fc.assert(
        fc.asyncProperty(
          customerNameArb,
          emailArb,
          phoneArb,
          partySizeArb,
          futureDateArb,
          timeArb,
          fc.constantFrom('confirmed', 'cancelled', 'completed', 'no_show'),
          async (name, email, phone, partySize, date, time, attemptedStatus) => {
            // Try to create with a different status
            const reservationData = {
              customer_name: name,
              customer_email: email,
              customer_phone: phone,
              party_size: partySize,
              reservation_date: date,
              reservation_time: time,
              status: attemptedStatus // Attempt to override
            };

            const reservation = await reservationService.create(reservationData);

            // Property: status should still be 'pending' regardless of attempted override
            return reservation.status === 'pending';
          }
        ),
        fcConfig
      );
    }, 60000);
  });

  describe('Edge cases for reservation creation', () => {
    it('should handle minimum party size', async () => {
      const reservation = await reservationService.create({
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        customer_phone: '1234567890',
        party_size: 1,
        reservation_date: '2026-12-31',
        reservation_time: '18:00:00'
      });

      expect(reservation.status).toBe('pending');
      expect(reservation.party_size).toBe(1);
    });

    it('should handle maximum party size', async () => {
      const reservation = await reservationService.create({
        customer_name: 'Jane Smith',
        customer_email: 'jane@example.com',
        customer_phone: '0987654321',
        party_size: 50,
        reservation_date: '2026-12-31',
        reservation_time: '19:00:00'
      });

      expect(reservation.status).toBe('pending');
      expect(reservation.party_size).toBe(50);
    });

    it('should handle reservations with special requests', async () => {
      const reservation = await reservationService.create({
        customer_name: 'Bob Wilson',
        customer_email: 'bob@example.com',
        customer_phone: '5551234567',
        party_size: 4,
        reservation_date: '2026-12-31',
        reservation_time: '20:00:00',
        special_requests: 'Window seat please, celebrating anniversary'
      });

      expect(reservation.status).toBe('pending');
      expect(reservation.special_requests).toBe('Window seat please, celebrating anniversary');
    });

    it('should handle reservations without special requests', async () => {
      const reservation = await reservationService.create({
        customer_name: 'Alice Brown',
        customer_email: 'alice@example.com',
        customer_phone: '5559876543',
        party_size: 2,
        reservation_date: '2026-12-31',
        reservation_time: '21:00:00'
      });

      expect(reservation.status).toBe('pending');
      expect(reservation.special_requests).toBeNull();
    });
  });

  describe('Validation for invalid reservation data', () => {
    it('should reject party size below minimum', async () => {
      await expect(
        reservationService.create({
          customer_name: 'Test User',
          customer_email: 'test@example.com',
          customer_phone: '1234567890',
          party_size: 0,
          reservation_date: '2026-12-31',
          reservation_time: '18:00:00'
        })
      ).rejects.toThrow();
    });

    it('should reject party size above maximum', async () => {
      await expect(
        reservationService.create({
          customer_name: 'Test User',
          customer_email: 'test@example.com',
          customer_phone: '1234567890',
          party_size: 51,
          reservation_date: '2026-12-31',
          reservation_time: '18:00:00'
        })
      ).rejects.toThrow();
    });

    it('should reject past dates', async () => {
      await expect(
        reservationService.create({
          customer_name: 'Test User',
          customer_email: 'test@example.com',
          customer_phone: '1234567890',
          party_size: 4,
          reservation_date: '2020-01-01',
          reservation_time: '18:00:00'
        })
      ).rejects.toThrow('Reservation date cannot be in the past');
    });
  });
});
