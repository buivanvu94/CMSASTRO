import fc from 'fast-check';
import sequelize from './src/config/database.js';
import { setupAssociations } from './src/config/associations.js';
import Reservation from './src/modules/reservations/reservation.model.js';
import * as reservationService from './src/modules/reservations/reservation.service.js';

/**
 * Manual test runner for reservation property tests
 * This verifies Property 33: Reservation creation defaults to pending
 */

async function runTests() {
  console.log('Setting up database...');
  setupAssociations();
  await sequelize.sync({ force: true });

  console.log('\n=== Testing Property 33: Reservation creation defaults to pending ===\n');

  // Test 1: Simple case
  console.log('Test 1: Simple reservation creation');
  try {
    const reservation1 = await reservationService.create({
      customer_name: 'John Doe',
      customer_email: 'john@example.com',
      customer_phone: '1234567890',
      party_size: 4,
      reservation_date: '2026-12-31',
      reservation_time: '18:00:00'
    });

    console.log(`✓ Created reservation with status: ${reservation1.status}`);
    console.assert(reservation1.status === 'pending', 'Status should be pending');
    console.log('✓ Status is pending as expected');
  } catch (error) {
    console.error('✗ Test 1 failed:', error.message);
  }

  // Test 2: Try to override status
  console.log('\nTest 2: Attempt to override status during creation');
  try {
    await Reservation.destroy({ where: {}, truncate: true });
    
    const reservation2 = await reservationService.create({
      customer_name: 'Jane Smith',
      customer_email: 'jane@example.com',
      customer_phone: '0987654321',
      party_size: 2,
      reservation_date: '2026-12-31',
      reservation_time: '19:00:00',
      status: 'confirmed' // Try to override
    });

    console.log(`✓ Created reservation with status: ${reservation2.status}`);
    console.assert(reservation2.status === 'pending', 'Status should still be pending');
    console.log('✓ Status override was ignored, remains pending');
  } catch (error) {
    console.error('✗ Test 2 failed:', error.message);
  }

  // Test 3: Property-based test with fast-check
  console.log('\nTest 3: Property-based test with random data');
  try {
    await Reservation.destroy({ where: {}, truncate: true });

    const customerNameArb = fc.string({ minLength: 2, maxLength: 100 })
      .filter(s => s.trim().length >= 2);
    const emailArb = fc.emailAddress();
    const phoneArb = fc.string({ minLength: 8, maxLength: 20 })
      .map(s => s.replace(/[^0-9+\-() ]/g, ''))
      .filter(s => s.length >= 8);
    const partySizeArb = fc.integer({ min: 1, max: 50 });
    const futureDateArb = fc.date({ min: new Date() })
      .map(d => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      });
    const timeArb = fc.integer({ min: 0, max: 23 })
      .chain(hour => 
        fc.integer({ min: 0, max: 59 }).map(minute => 
          `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`
        )
      );

    let testCount = 0;
    let passCount = 0;

    await fc.assert(
      fc.asyncProperty(
        customerNameArb,
        emailArb,
        phoneArb,
        partySizeArb,
        futureDateArb,
        timeArb,
        async (name, email, phone, partySize, date, time) => {
          testCount++;
          
          const reservation = await reservationService.create({
            customer_name: name,
            customer_email: email,
            customer_phone: phone,
            party_size: partySize,
            reservation_date: date,
            reservation_time: time
          });

          const isPending = reservation.status === 'pending';
          if (isPending) passCount++;

          return isPending;
        }
      ),
      { numRuns: 20 } // Run 20 iterations for quick test
    );

    console.log(`✓ Ran ${testCount} property-based tests`);
    console.log(`✓ All ${passCount} reservations created with pending status`);
  } catch (error) {
    console.error('✗ Test 3 failed:', error.message);
  }

  // Test 4: Edge cases
  console.log('\nTest 4: Edge cases');
  try {
    await Reservation.destroy({ where: {}, truncate: true });

    // Minimum party size
    const res1 = await reservationService.create({
      customer_name: 'Min Party',
      customer_email: 'min@example.com',
      customer_phone: '1111111111',
      party_size: 1,
      reservation_date: '2026-12-31',
      reservation_time: '12:00:00'
    });
    console.assert(res1.status === 'pending', 'Min party size should be pending');
    console.log('✓ Minimum party size (1): pending');

    // Maximum party size
    const res2 = await reservationService.create({
      customer_name: 'Max Party',
      customer_email: 'max@example.com',
      customer_phone: '2222222222',
      party_size: 50,
      reservation_date: '2026-12-31',
      reservation_time: '13:00:00'
    });
    console.assert(res2.status === 'pending', 'Max party size should be pending');
    console.log('✓ Maximum party size (50): pending');

    // With special requests
    const res3 = await reservationService.create({
      customer_name: 'Special Request',
      customer_email: 'special@example.com',
      customer_phone: '3333333333',
      party_size: 4,
      reservation_date: '2026-12-31',
      reservation_time: '14:00:00',
      special_requests: 'Window seat please'
    });
    console.assert(res3.status === 'pending', 'With special requests should be pending');
    console.log('✓ With special requests: pending');

    // Without special requests
    const res4 = await reservationService.create({
      customer_name: 'No Special',
      customer_email: 'nospecial@example.com',
      customer_phone: '4444444444',
      party_size: 3,
      reservation_date: '2026-12-31',
      reservation_time: '15:00:00'
    });
    console.assert(res4.status === 'pending', 'Without special requests should be pending');
    console.log('✓ Without special requests: pending');

  } catch (error) {
    console.error('✗ Test 4 failed:', error.message);
  }

  // Test 5: Validation tests
  console.log('\nTest 5: Validation tests');
  
  // Invalid party size (too small)
  try {
    await reservationService.create({
      customer_name: 'Invalid',
      customer_email: 'invalid@example.com',
      customer_phone: '5555555555',
      party_size: 0,
      reservation_date: '2026-12-31',
      reservation_time: '16:00:00'
    });
    console.error('✗ Should have rejected party size 0');
  } catch (error) {
    console.log('✓ Correctly rejected party size 0');
  }

  // Invalid party size (too large)
  try {
    await reservationService.create({
      customer_name: 'Invalid',
      customer_email: 'invalid@example.com',
      customer_phone: '5555555555',
      party_size: 51,
      reservation_date: '2026-12-31',
      reservation_time: '17:00:00'
    });
    console.error('✗ Should have rejected party size 51');
  } catch (error) {
    console.log('✓ Correctly rejected party size 51');
  }

  // Past date
  try {
    await reservationService.create({
      customer_name: 'Past Date',
      customer_email: 'past@example.com',
      customer_phone: '6666666666',
      party_size: 4,
      reservation_date: '2020-01-01',
      reservation_time: '18:00:00'
    });
    console.error('✗ Should have rejected past date');
  } catch (error) {
    console.log('✓ Correctly rejected past date');
  }

  console.log('\n=== All tests completed ===\n');
  
  await sequelize.close();
  process.exit(0);
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
