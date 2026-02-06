import * as reservationService from './reservation.service.js';
import {
  successResponse,
  createdResponse,
  paginatedResponse,
  noContentResponse
} from '../../utils/response.js';
import { asyncHandler } from '../../middlewares/errorHandler.js';

/**
 * Reservation Controller
 * Handles HTTP requests for reservation management
 */

/**
 * Get all reservations
 * GET /reservations
 */
export const getReservations = asyncHandler(async (req, res) => {
  const { page, limit, search, status, dateFrom, dateTo } = req.query;

  const result = await reservationService.findAll({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    search,
    status,
    dateFrom,
    dateTo
  });

  return paginatedResponse(
    res,
    result.reservations,
    result.total,
    result.page,
    result.limit,
    'Reservations retrieved successfully'
  );
});

/**
 * Get reservation by ID
 * GET /reservations/:id
 */
export const getReservationById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const reservation = await reservationService.findById(parseInt(id));

  return successResponse(res, reservation, 'Reservation retrieved successfully');
});

/**
 * Create new reservation (public endpoint - no auth required)
 * POST /reservations
 */
export const createReservation = asyncHandler(async (req, res) => {
  const data = req.body;
  const reservation = await reservationService.create(data);

  return createdResponse(res, reservation, 'Reservation created successfully');
});

/**
 * Update reservation
 * PUT /reservations/:id
 */
export const updateReservation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const reservation = await reservationService.update(parseInt(id), data);

  return successResponse(res, reservation, 'Reservation updated successfully');
});

/**
 * Update reservation status
 * PUT /reservations/:id/status
 */
export const updateReservationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const handlerId = req.user ? req.user.id : null;

  const reservation = await reservationService.updateStatus(
    parseInt(id),
    status,
    handlerId
  );

  return successResponse(res, reservation, 'Reservation status updated successfully');
});

/**
 * Delete reservation
 * DELETE /reservations/:id
 */
export const deleteReservation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await reservationService.deleteReservation(parseInt(id));

  return noContentResponse(res);
});

/**
 * Get calendar view
 * GET /reservations/calendar
 */
export const getCalendar = asyncHandler(async (req, res) => {
  const { month } = req.query;

  // Default to current month if not provided
  const currentDate = new Date();
  const defaultMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

  const result = await reservationService.getCalendar(month || defaultMonth);

  return successResponse(res, result, 'Calendar retrieved successfully');
});

/**
 * Get reservation statistics
 * GET /reservations/stats
 */
export const getStats = asyncHandler(async (req, res) => {
  const stats = await reservationService.getStats();

  return successResponse(res, stats, 'Statistics retrieved successfully');
});

export default {
  getReservations,
  getReservationById,
  createReservation,
  updateReservation,
  updateReservationStatus,
  deleteReservation,
  getCalendar,
  getStats
};
