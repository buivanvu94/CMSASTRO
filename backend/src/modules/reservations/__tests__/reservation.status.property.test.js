import { describe, beforeAll, beforeEach, afterAll, it, expect } from '@jest/globals';
import fc from 'fast-check';
import sequelize from '../../../config/database.js';
import { setupAssociations } from '../../../config/associations.js';
import Reservation from '../reservation.model.js';
import User from '../../users/user.model.js';
import * as reservationService from '../reservation.service.js';

/**
 * Property-Based Tests for Reservation Status Transitions
 * Feature: cms-system, Property 35: Reservation status transitions
 * Validates: Requirements 6.3, 6.4, 6.5, 6.6
 */

describe('Reservation Status Transitions - Property Tests', () => {
  let testUser;

  beforeAll(async () => {
    setupAssociations();
    await sequelize.sync({ force: true });

    // Create a test user for handler
    testUser = await User.create({
      full_name: 'Test Manager',
      email: 'manager@test.com',
      password: 'hashedpassword123',
      role: 'admin',
      status: 'active'
    });
  });

  beforeEach(async () => {
    await Reservation.destroy({ where: {}, truncate: true });
  });

  afterAll(async () => {
    await User.destroy({ where: {}, truncate: true });
    await sequelize.close();
  });

  // Configure fast-check to run 100 iterations minimum
  const fcConfig = { numRuns: 100 };

  /**
   * Property 35: Reservation status transitions
   * For any reservation, when a manager updates the status, the new status
   * should be persisted and retrievable (pending→confirmed, confirmed→completed,
   * confirmed→cancelled, confirmed→no_show).
   */
  describe('Property 35: Reservation status transitions', () => {
    // Helper to create a reservation
    const createTestReservation = async (status = 'pending') => {
      const reservation = await Reservation.create({
        customer_name: 'Test Customer',
        customer_email: 'customer@test.com',
        customer_phone: '1234567890',
        party_size: 4,
        reservation_date: '2026-12-31',
        reservation_time: '18:00:00',
        status
      });
      return reservation;
    };

    it('should persist status updates for any valid transition', async () => {
      // Valid transitions: pending→confirmed, confirmed→completed, confirmed→cancelled, confirmed→no_show
      const validTransitions = [
        { from: 'pending', to: 'confirmed' },
        { from: 'confirmed', to: 'completed' },
        { from: 'confirmed', to: 'cancelled' },
        { from: 'confirmed', to: 'no_show' }
      ];

      for (const transition of validTransitions) {
        const reservation = await createTestReservation(transition.from);
        
        const updated = await reservationService.updateStatus(
          reservation.id,
          transition.to,
          testUser.id
        );

        expect(updated.status).toBe(transition.to);

        // Verify persistence by fetching again
        const fetched = await reservationService.findById(reservation.id);
        expect(fetched.status).toBe(transition.to);
      }
    });

    it('should update status for any reservation regardless of other fields', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 2, maxLength: 100 }),
          fc.emailAddress(),
          fc.string({ minLength: 8, maxLength: 20 }),
          fc.integer({ min: 1, max: 50 }),
          fc.constantFrom('confirmed', 'completed', 'cancelled', 'no_show'),
          async (name, email, phone, partySize, newStatus) => {
            // Create reservation with pending status
            const reservation = await Reservation.create({
              customer_name: name,
              customer_email: email,
              customer_phone: phone,
              party_size: partySize,
              reservation_date: '2026-12-31',
              reservation_time: '18:00:00',
              status: 'pending'
            });

            // Update to new status
            const updated = await reservationService.updateStatus(
              reservation.id,
              newStatus,
              testUser.id
            );

            // Property: status should be updated regardless of other fields
            return updated.status === newStatus;
          }
        ),
        fcConfig
      );
    }, 60000);

    it('should maintain status persistence across multiple updates', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.constantFrom('pending', 'confirmed', 'completed', 'cancelled', 'no_show'),
            { minLength: 2, maxLength: 5 }
          ),
          async (statusSequence) => {
            const reservation = await createTestReservation('pending');

            let lastStatus = 'pending';
            for (const newStatus of statusSequence) {
              const updated = await reservationService.updateStatus(
                reservation.id,
                newStatus,
                testUser.id
              );
              lastStatus = newStatus;
            }

            // Property: final status should match last update
            const final = await reservationService.findById(reservation.id);
            return final.status === lastStatus;
          }
        ),
        { numRuns: 50 } // Fewer runs due to multiple updates per test
      );
    }, 60000);

    it('should set handler when confirming reservation', async () => {
      const reservation = await createTestReservation('pending');

      const updated = await reservationService.updateStatus(
        reservation.id,
        'confirmed',
        testUser.id
      );

      expect(updated.status).toBe('confirmed');
      expect(updated.handler_id).toBe(testUser.id);
      expect(updated.handler).toBeDefined();
      expect(updated.handler.id).toBe(testUser.id);
    });

    it('should allow status updates without handler', async () => {
      const reservation = await createTestReservation('confirmed');

      const updated = await reservationService.updateStatus(
        reservation.id,
        'completed'
      );

      expect(updated.status).toBe('completed');
    });
  });

  describe('Specific status transition tests', () => {
    it('should transition from pending to confirmed', async () => {
      const reservation = await Reservation.create({
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        customer_phone: '1234567890',
        party_size: 4,
        reservation_date: '2026-12-31',
        reservation_time: '18:00:00',
        status: 'pending'
      });

      const updated = await reservationService.updateStatus(
        reservation.id,
        'confirmed',
        testUser.id
      );

      expect(updated.status).toBe('confirmed');
      expect(updated.handler_id).toBe(testUser.id);
    });

    it('should transition from confirmed to completed', async () => {
      const reservation = await Reservation.create({
        customer_name: 'Jane Smith',
        customer_email: 'jane@example.com',
        customer_phone: '0987654321',
        party_size: 2,
        reservation_date: '2026-12-31',
        reservation_time: '19:00:00',
        status: 'confirmed'
      });

      const updated = await reservationService.updateStatus(
        reservation.id,
        'completed'
      );

      expect(updated.status).toBe('completed');
    });

    it('should transition from confirmed to cancelled', async () => {
      const reservation = await Reservation.create({
        customer_name: 'Bob Wilson',
        customer_email: 'bob@example.com',
        customer_phone: '5551234567',
        party_size: 6,
        reservation_date: '2026-12-31',
        reservation_time: '20:00:00',
        status: 'confirmed'
      });

      const updated = await reservationService.updateStatus(
        reservation.id,
        'cancelled'
      );

      expect(updated.status).toBe('cancelled');
    });

    it('should transition from confirmed to no_show', async () => {
      const reservation = await Reservation.create({
        customer_name: 'Alice Brown',
        customer_email: 'alice@example.com',
        customer_phone: '5559876543',
        party_size: 3,
        reservation_date: '2026-12-31',
        reservation_time: '21:00:00',
        status: 'confirmed'
      });

      const updated = await reservationService.updateStatus(
        reservation.id,
        'no_show'
      );

      expect(updated.status).toBe('no_show');
    });
  });

  describe('Status validation', () => {
    it('should reject invalid status values', async () => {
      const reservation = await Reservation.create({
        customer_name: 'Test User',
        customer_email: 'test@example.com',
        customer_phone: '1234567890',
        party_size: 4,
        reservation_date: '2026-12-31',
        reservation_time: '18:00:00',
        status: 'pending'
      });

      await expect(
        reservationService.updateStatus(reservation.id, 'invalid_status')
      ).rejects.toThrow();
    });

    it('should accept all valid status values', async () => {
      const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'];

      for (const status of validStatuses) {
        const reservation = await Reservation.create({
          customer_name: 'Test User',
          customer_email: `test${status}@example.com`,
          customer_phone: '1234567890',
          party_size: 4,
          reservation_date: '2026-12-31',
          reservation_time: '18:00:00',
          status: 'pending'
        });

        const updated = await reservationService.updateStatus(
          reservation.id,
          status
        );

        expect(updated.status).toBe(status);
      }
    });
  });

  describe('Status retrieval after update', () => {
    it('should retrieve updated status correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('pending', 'confirmed', 'completed', 'cancelled', 'no_show'),
          async (targetStatus) => {
            const reservation = await Reservation.create({
              customer_name: 'Test Customer',
              customer_email: 'test@example.com',
              customer_phone: '1234567890',
              party_size: 4,
              reservation_date: '2026-12-31',
              reservation_time: '18:00:00',
              status: 'pending'
            });

            await reservationService.updateStatus(
              reservation.id,
              targetStatus,
              testUser.id
            );

            // Fetch from database
            const fetched = await reservationService.findById(reservation.id);

            // Property: fetched status should match updated status
            return fetched.status === targetStatus;
          }
        ),
        fcConfig
      );
    }, 60000);
  });

  describe('Concurrent status updates', () => {
    it('should handle sequential status updates correctly', async () => {
      const reservation = await Reservation.create({
        customer_name: 'Test Customer',
        customer_email: 'test@example.com',
        customer_phone: '1234567890',
        party_size: 4,
        reservation_date: '2026-12-31',
        reservation_time: '18:00:00',
        status: 'pending'
      });

      // Update to confirmed
      await reservationService.updateStatus(reservation.id, 'confirmed', testUser.id);
      let fetched = await reservationService.findById(reservation.id);
      expect(fetched.status).toBe('confirmed');

      // Update to completed
      await reservationService.updateStatus(reservation.id, 'completed');
      fetched = await reservationService.findById(reservation.id);
      expect(fetched.status).toBe('completed');
    });
  });

  describe('Status instance methods', () => {
    it('should correctly identify pending reservations', async () => {
      const reservation = await Reservation.create({
        customer_name: 'Test Customer',
        customer_email: 'test@example.com',
        customer_phone: '1234567890',
        party_size: 4,
        reservation_date: '2026-12-31',
        reservation_time: '18:00:00',
        status: 'pending'
      });

      expect(reservation.isPending()).toBe(true);
      expect(reservation.isConfirmed()).toBe(false);
    });

    it('should correctly identify confirmed reservations', async () => {
      const reservation = await Reservation.create({
        customer_name: 'Test Customer',
        customer_email: 'test@example.com',
        customer_phone: '1234567890',
        party_size: 4,
        reservation_date: '2026-12-31',
        reservation_time: '18:00:00',
        status: 'confirmed'
      });

      expect(reservation.isPending()).toBe(false);
      expect(reservation.isConfirmed()).toBe(true);
    });

    it('should correctly identify modifiable reservations', async () => {
      const pending = await Reservation.create({
        customer_name: 'Pending Customer',
        customer_email: 'pending@example.com',
        customer_phone: '1111111111',
        party_size: 2,
        reservation_date: '2026-12-31',
        reservation_time: '18:00:00',
        status: 'pending'
      });

      const confirmed = await Reservation.create({
        customer_name: 'Confirmed Customer',
        customer_email: 'confirmed@example.com',
        customer_phone: '2222222222',
        party_size: 3,
        reservation_date: '2026-12-31',
        reservation_time: '19:00:00',
        status: 'confirmed'
      });

      const completed = await Reservation.create({
        customer_name: 'Completed Customer',
        customer_email: 'completed@example.com',
        customer_phone: '3333333333',
        party_size: 4,
        reservation_date: '2026-12-31',
        reservation_time: '20:00:00',
        status: 'completed'
      });

      expect(pending.canBeModified()).toBe(true);
      expect(confirmed.canBeModified()).toBe(true);
      expect(completed.canBeModified()).toBe(false);
    });
  });
});
