import { sendMail } from '../../utils/mailer.js';
import logger from '../../utils/logger.js';

const RESTAURANT_NAME = 'Aurelian Seafood';
const PLACEHOLDER_PATTERN = /{{\s*([a-zA-Z0-9_]+)\s*}}/g;

const FALLBACK_EMAIL_TEMPLATES = {
  customerBookingCreated: {
    subject: '[Aurelian Seafood] Xác nhận đặt bàn thành công',
    body: [
      'Xin chào {{customer_name}},',
      '',
      'Cảm ơn bạn đã đặt bàn tại {{restaurant_name}}.',
      'Thời gian: {{reservation_datetime}}',
      'Số khách: {{party_size}}',
      'Ghi chú: {{special_requests}}',
      '',
      'Chúng tôi sẽ liên hệ nếu cần xác nhận thêm thông tin.',
      'Hẹn gặp bạn tại nhà hàng.'
    ].join('\n')
  },
  adminBookingCreated: {
    subject: '[Booking mới] {{customer_name}} - {{reservation_datetime}}',
    body: [
      'Có booking mới trên hệ thống.',
      'Khách hàng: {{customer_name}}',
      'Email: {{customer_email}}',
      'Điện thoại: {{customer_phone}}',
      'Thời gian: {{reservation_datetime}}',
      'Số khách: {{party_size}}',
      'Ghi chú: {{special_requests}}'
    ].join('\n')
  },
  customerBookingReminder: {
    subject: '[Aurelian Seafood] Nhắc lịch đặt bàn sau {{lead_hours}} giờ',
    body: [
      'Xin chào {{customer_name}},',
      '',
      'Bạn có lịch đặt bàn sau {{lead_hours}} giờ.',
      'Thời gian: {{reservation_datetime}}',
      'Số khách: {{party_size}}',
      'Ghi chú: {{special_requests}}',
      '',
      'Hẹn gặp bạn tại nhà hàng.'
    ].join('\n')
  }
};

const formatDateTimeVi = (dateValue, timeValue) => {
  const parsed = new Date(`${dateValue}T${String(timeValue).slice(0, 8)}`);
  if (Number.isNaN(parsed.getTime())) {
    return `${dateValue} ${timeValue}`;
  }
  return parsed.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const escapeHtml = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const renderTemplate = (template, variables) => String(template || '').replace(
  PLACEHOLDER_PATTERN,
  (_match, key) => String(variables[key] ?? '')
);

const textToHtml = (text) => escapeHtml(text).replace(/\n/g, '<br/>');

const buildReservationSummary = (reservation, leadHours = 24) => {
  const whenText = formatDateTimeVi(reservation.reservation_date, reservation.reservation_time);
  const customerName = reservation.customer_name || 'Quý khách';
  return {
    customerName,
    whenText,
    notesText: reservation.special_requests || 'Không có',
    variables: {
      customer_name: customerName,
      reservation_datetime: whenText,
      party_size: String(reservation.party_size ?? ''),
      special_requests: reservation.special_requests || 'Không có',
      customer_email: reservation.customer_email || '',
      customer_phone: reservation.customer_phone || '',
      lead_hours: String(leadHours),
      restaurant_name: RESTAURANT_NAME
    }
  };
};

const resolveTemplate = (bookingConfig, templateKey) => {
  const custom = bookingConfig?.emailTemplates?.[templateKey] || {};
  const fallback = FALLBACK_EMAIL_TEMPLATES[templateKey];
  return {
    subject: String(custom.subject || fallback.subject),
    body: String(custom.body || fallback.body)
  };
};

export const sendCustomerBookingCreatedEmail = async (reservation, bookingConfig = null) => {
  const { variables } = buildReservationSummary(reservation);
  const template = resolveTemplate(bookingConfig, 'customerBookingCreated');
  const subject = renderTemplate(template.subject, variables);
  const text = renderTemplate(template.body, variables);
  const html = `<div style="font-family:Arial,sans-serif;line-height:1.7;color:#111">${textToHtml(text)}</div>`;

  return sendMail({
    to: reservation.customer_email,
    subject,
    text,
    html
  });
};

export const sendAdminBookingCreatedEmail = async (reservation, recipients = [], bookingConfig = null) => {
  if (!Array.isArray(recipients) || recipients.length === 0) {
    return { sent: false, reason: 'no_recipient' };
  }

  const { variables } = buildReservationSummary(reservation);
  const template = resolveTemplate(bookingConfig, 'adminBookingCreated');
  const subject = renderTemplate(template.subject, variables);
  const text = renderTemplate(template.body, variables);
  const html = `<div style="font-family:Arial,sans-serif;line-height:1.7;color:#111">${textToHtml(text)}</div>`;

  return sendMail({
    to: recipients.join(','),
    subject,
    text,
    html
  });
};

export const sendCustomerBookingReminderEmail = async (reservation, leadHours, bookingConfig = null) => {
  const { variables } = buildReservationSummary(reservation, leadHours);
  const template = resolveTemplate(bookingConfig, 'customerBookingReminder');
  const subject = renderTemplate(template.subject, variables);
  const text = renderTemplate(template.body, variables);
  const html = `<div style="font-family:Arial,sans-serif;line-height:1.7;color:#111">${textToHtml(text)}</div>`;

  const result = await sendMail({
    to: reservation.customer_email,
    subject,
    text,
    html
  });

  if (!result.sent) {
    logger.warn('Failed to send reservation reminder email', {
      reservationId: reservation.id,
      leadHours,
      reason: result.reason || 'unknown'
    });
  }

  return result;
};
