import express from 'express';
import * as reservationController from './reservation.controller.js';
import * as reservationValidation from './reservation.validation.js';
import { authenticate } from '../../middlewares/auth.js';
import { authorize } from '../../middlewares/authorize.js';

const router = express.Router();

/**
 * Reservation Routes
 * Some routes are public (create), others require authentication
 */

/**
 * GET /reservations/stats
 * Get reservation statistics
 * Requires authentication (admin/editor)
 */
router.get(
  '/stats',
  authenticate,
  authorize(['admin', 'editor']),
  reservationController.getStats
);

/**
 * GET /reservations/calendar
 * Get calendar view
 * Requires authentication (admin/editor)
 */
router.get(
  '/calendar',
  authenticate,
  authorize(['admin', 'editor']),
  reservationValidation.getCalendarValidation,
  reservationValidation.handleValidationErrors,
  reservationController.getCalendar
);

/**
 * GET /reservations
 * List all reservations
 * Requires authentication (admin/editor)
 */
router.get(
  '/',
  authenticate,
  authorize(['admin', 'editor']),
  reservationValidation.getReservationsValidation,
  reservationValidation.handleValidationErrors,
  reservationController.getReservations
);

/**
 * GET /reservations/:id
 * Get reservation by ID
 * Requires authentication (admin/editor)
 */
router.get(
  '/:id',
  authenticate,
  authorize(['admin', 'editor']),
  reservationValidation.getReservationByIdValidation,
  reservationValidation.handleValidationErrors,
  reservationController.getReservationById
);

/**
 * POST /reservations
 * Create new reservation
 * PUBLIC ENDPOINT - No authentication required
 */
router.post(
  '/',
  reservationValidation.createReservationValidation,
  reservationValidation.handleValidationErrors,
  reservationController.createReservation
);

/**
 * PUT /reservations/:id
 * Update reservation
 * Requires authentication (admin/editor)
 */
router.put(
  '/:id',
  authenticate,
  authorize(['admin', 'editor']),
  reservationValidation.updateReservationValidation,
  reservationValidation.handleValidationErrors,
  reservationController.updateReservation
);

/**
 * PUT /reservations/:id/status
 * Update reservation status
 * Requires authentication (admin/editor)
 */
router.put(
  '/:id/status',
  authenticate,
  authorize(['admin', 'editor']),
  reservationValidation.updateReservationStatusValidation,
  reservationValidation.handleValidationErrors,
  reservationController.updateReservationStatus
);

/**
 * DELETE /reservations/:id
 * Delete reservation
 * Requires authentication (admin only)
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['admin']),
  reservationValidation.deleteReservationValidation,
  reservationValidation.handleValidationErrors,
  reservationController.deleteReservation
);

export default router;
