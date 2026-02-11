import { Op } from 'sequelize';
import Reservation from './reservation.model.js';
import User from '../users/user.model.js';
import { NotFoundError, ValidationError } from '../../middlewares/errorHandler.js';
import ReservationReminderLog from './reservation-reminder-log.model.js';
import {
  sendAdminBookingCreatedEmail,
  sendCustomerBookingCreatedEmail
} from './reservation.mailer.js';
import { getBookingEmailRuntimeConfig } from '../settings/setting.service.js';
import logger from '../../utils/logger.js';

/**
 * Reservation Service
 * Business logic for reservation management
 */

/**
 * Find all reservations with pagination and filtering
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Reservations and pagination info
 */
export const findAll = async ({
  page = 1,
  limit = 20,
  search = '',
  status = null,
  dateFrom = null,
  dateTo = null
} = {}) => {
  const offset = (page - 1) * limit;

  // Build where clause
  const where = {};

  if (search) {
    where[Op.or] = [
      { customer_name: { [Op.like]: `%${search}%` } },
      { customer_email: { [Op.like]: `%${search}%` } },
      { customer_phone: { [Op.like]: `%${search}%` } }
    ];
  }

  if (status) {
    where.status = status;
  }

  if (dateFrom || dateTo) {
    where.reservation_date = {};
    if (dateFrom) {
      where.reservation_date[Op.gte] = dateFrom;
    }
    if (dateTo) {
      where.reservation_date[Op.lte] = dateTo;
    }
  }

  const { count, rows } = await Reservation.findAndCountAll({
    where,
    limit,
    offset,
    order: [['reservation_date', 'DESC'], ['reservation_time', 'DESC']],
    include: [
      {
        model: User,
        as: 'handler',
        attributes: ['id', 'full_name', 'email']
      }
    ]
  });

  return {
    reservations: rows,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit)
  };
};

/**
 * Find reservation by ID
 * @param {number} id - Reservation ID
 * @returns {Promise<Object>} - Reservation object
 * @throws {NotFoundError} - If reservation not found
 */
export const findById = async (id) => {
  const reservation = await Reservation.findByPk(id, {
    include: [
      {
        model: User,
        as: 'handler',
        attributes: ['id', 'full_name', 'email']
      }
    ]
  });

  if (!reservation) {
    throw new NotFoundError('Reservation not found');
  }

  return reservation;
};

/**
 * Create new reservation (public - no auth required)
 * @param {Object} data - Reservation data
 * @returns {Promise<Object>} - Created reservation
 */
export const create = async (data) => {
  // Validate party size
  if (data.party_size < 1 || data.party_size > 50) {
    throw new ValidationError('Party size must be between 1 and 50');
  }

  // Validate reservation date is not in the past
  const reservationDate = new Date(data.reservation_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (reservationDate < today) {
    throw new ValidationError('Reservation date cannot be in the past');
  }

  // Create reservation with pending status
  const reservation = await Reservation.create({
    ...data,
    status: 'pending'
  });
  const createdReservation = await findById(reservation.id);

  const bookingConfig = await getBookingEmailRuntimeConfig();
  const customerMailResult = await sendCustomerBookingCreatedEmail(createdReservation, bookingConfig);

  if (!customerMailResult.sent) {
    await reservation.destroy();
    throw new ValidationError('Khong the gui email xac nhan dat ban cho khach hang. Vui long thu lai sau.');
  }

  if (bookingConfig.adminBookingNotificationEnabled) {
    const adminRecipients = bookingConfig.adminBookingNotificationEmails || [];
    const adminMailResult = await sendAdminBookingCreatedEmail(createdReservation, adminRecipients, bookingConfig);
    if (!adminMailResult.sent) {
      logger.warn('Admin booking notification email was not sent', {
        reservationId: createdReservation.id,
        reason: adminMailResult.reason || 'unknown'
      });
    }
  }

  return createdReservation;
};

/**
 * Update reservation
 * @param {number} id - Reservation ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} - Updated reservation
 */
export const update = async (id, data) => {
  const reservation = await findById(id);

  // Validate party size if provided
  if (data.party_size !== undefined) {
    if (data.party_size < 1 || data.party_size > 50) {
      throw new ValidationError('Party size must be between 1 and 50');
    }
  }

  // Validate reservation date if provided
  if (data.reservation_date) {
    const reservationDate = new Date(data.reservation_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (reservationDate < today) {
      throw new ValidationError('Reservation date cannot be in the past');
    }
  }

  await reservation.update(data);

  if (data.reservation_date || data.reservation_time) {
    await ReservationReminderLog.destroy({
      where: {
        reservation_id: reservation.id,
        reminder_type: 'meal_reminder'
      }
    });
  }

  return findById(reservation.id);
};

/**
 * Update reservation status
 * @param {number} id - Reservation ID
 * @param {string} status - New status
 * @param {number} handlerId - User ID who is handling the status change
 * @returns {Promise<Object>} - Updated reservation
 */
export const updateStatus = async (id, status, handlerId = null) => {
  const reservation = await findById(id);

  // Validate status
  const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'];
  if (!validStatuses.includes(status)) {
    throw new ValidationError(`Status must be one of: ${validStatuses.join(', ')}`);
  }

  const updateData = { status };

  // Set handler if provided and status is being changed to confirmed
  if (handlerId && status === 'confirmed') {
    updateData.handler_id = handlerId;
  }

  await reservation.update(updateData);
  return findById(reservation.id);
};

/**
 * Delete reservation
 * @param {number} id - Reservation ID
 * @returns {Promise<void>}
 */
export const deleteReservation = async (id) => {
  const reservation = await findById(id);
  await reservation.destroy();
};

/**
 * Get calendar view - reservations grouped by date
 * @param {string} month - Month in YYYY-MM format
 * @returns {Promise<Object>} - Reservations grouped by date
 */
export const getCalendar = async (month) => {
  // Parse month parameter
  const [year, monthNum] = month.split('-').map(Number);

  if (!year || !monthNum || monthNum < 1 || monthNum > 12) {
    throw new ValidationError('Invalid month format. Use YYYY-MM');
  }

  // Calculate date range for the month
  const startDate = new Date(year, monthNum - 1, 1);
  const endDate = new Date(year, monthNum, 0); // Last day of month

  const reservations = await Reservation.findAll({
    where: {
      reservation_date: {
        [Op.between]: [startDate, endDate]
      }
    },
    order: [['reservation_date', 'ASC'], ['reservation_time', 'ASC']],
    include: [
      {
        model: User,
        as: 'handler',
        attributes: ['id', 'full_name', 'email']
      }
    ]
  });

  // Group by date
  const groupedByDate = {};

  reservations.forEach(reservation => {
    const date = reservation.reservation_date;
    if (!groupedByDate[date]) {
      groupedByDate[date] = [];
    }
    groupedByDate[date].push(reservation);
  });

  return {
    month,
    year,
    monthNum,
    reservations: groupedByDate
  };
};

/**
 * Get reservation statistics
 * @returns {Promise<Object>} - Statistics
 */
export const getStats = async () => {
  const total = await Reservation.count();

  const byStatus = await Reservation.findAll({
    attributes: [
      'status',
      [Reservation.sequelize.fn('COUNT', Reservation.sequelize.col('id')), 'count']
    ],
    group: ['status']
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = await Reservation.count({
    where: {
      reservation_date: { [Op.gte]: today },
      status: { [Op.in]: ['pending', 'confirmed'] }
    }
  });

  return {
    total,
    byStatus: byStatus.map(s => ({
      status: s.status,
      count: parseInt(s.get('count'))
    })),
    upcoming
  };
};

export default {
  findAll,
  findById,
  create,
  update,
  updateStatus,
  deleteReservation,
  getCalendar,
  getStats
};
