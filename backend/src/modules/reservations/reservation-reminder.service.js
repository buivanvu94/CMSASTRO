import { Op } from 'sequelize';
import Reservation from './reservation.model.js';
import ReservationReminderLog from './reservation-reminder-log.model.js';
import { getBookingEmailRuntimeConfig } from '../settings/setting.service.js';
import { sendCustomerBookingReminderEmail } from './reservation.mailer.js';
import logger from '../../utils/logger.js';

const CHECK_INTERVAL_MS = 60 * 1000;
const REMINDER_TYPE = 'meal_reminder';
const ACTIVE_STATUSES = ['pending', 'confirmed'];

let reminderTimer = null;
let running = false;

const toReservationDateTime = (reservation) => {
  const value = new Date(`${reservation.reservation_date}T${String(reservation.reservation_time).slice(0, 8)}`);
  return Number.isNaN(value.getTime()) ? null : value;
};

export const processReservationReminders = async () => {
  if (running) return;
  running = true;

  try {
    const config = await getBookingEmailRuntimeConfig();
    if (!config.reminderEnabled) return;

    const now = new Date();
    const fromDate = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    const toDate = new Date(now.getTime() + (31 * 24 * 60 * 60 * 1000));
    const leadHours = Math.max(1, Math.min(168, parseInt(config.reminderLeadHours, 10) || 24));

    const reservations = await Reservation.findAll({
      where: {
        status: { [Op.in]: ACTIVE_STATUSES },
        reservation_date: {
          [Op.gte]: fromDate.toISOString().slice(0, 10),
          [Op.lte]: toDate.toISOString().slice(0, 10)
        }
      },
      order: [['reservation_date', 'ASC'], ['reservation_time', 'ASC']]
    });

    if (reservations.length === 0) return;

    const reservationIds = reservations.map((item) => item.id);
    const logs = await ReservationReminderLog.findAll({
      where: {
        reservation_id: { [Op.in]: reservationIds },
        reminder_type: REMINDER_TYPE
      }
    });
    const sentReservationIds = new Set(logs.map((item) => item.reservation_id));

    for (const reservation of reservations) {
      if (sentReservationIds.has(reservation.id)) continue;

      const reservationDateTime = toReservationDateTime(reservation);
      if (!reservationDateTime) continue;
      if (reservationDateTime <= now) continue;

      const reminderAt = new Date(reservationDateTime.getTime() - (leadHours * 60 * 60 * 1000));
      if (now < reminderAt) continue;

      const result = await sendCustomerBookingReminderEmail(reservation, leadHours, config);
      if (!result.sent) continue;

      await ReservationReminderLog.create({
        reservation_id: reservation.id,
        reminder_type: REMINDER_TYPE,
        lead_hours: leadHours,
        sent_at: new Date()
      });
    }
  } catch (error) {
    logger.error('Reservation reminder worker failed', {
      message: error.message
    });
  } finally {
    running = false;
  }
};

export const startReservationReminderScheduler = () => {
  if (reminderTimer) return;
  processReservationReminders();
  reminderTimer = setInterval(processReservationReminders, CHECK_INTERVAL_MS);
  logger.info('Reservation reminder scheduler started', { intervalMs: CHECK_INTERVAL_MS });
};

export const stopReservationReminderScheduler = () => {
  if (!reminderTimer) return;
  clearInterval(reminderTimer);
  reminderTimer = null;
  logger.info('Reservation reminder scheduler stopped');
};

export default {
  startReservationReminderScheduler,
  stopReservationReminderScheduler,
  processReservationReminders
};
