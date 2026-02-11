import nodemailer from 'nodemailer';
import { config } from '../config/index.js';
import logger from './logger.js';
import { getBookingEmailRuntimeConfig } from '../modules/settings/setting.service.js';

let transporterCache = null;
let transporterSignature = null;

const toResolvedConfig = async (overrideConfig = null) => {
  const runtimeConfig = overrideConfig || await getBookingEmailRuntimeConfig();
  const smtpHost = String(runtimeConfig.smtpHost || config.mail.host || '').trim();
  const smtpPort = parseInt(runtimeConfig.smtpPort, 10) || config.mail.port || 587;
  const smtpSecure = Boolean(runtimeConfig.smtpSecure);
  const smtpUser = String(runtimeConfig.smtpUser || config.mail.user || '').trim();
  const smtpPass = String(runtimeConfig.smtpPass || config.mail.pass || '');
  const smtpFrom = String(runtimeConfig.smtpFrom || config.mail.from || '').trim();
  const smtpReplyTo = String(runtimeConfig.smtpReplyTo || '').trim();

  return {
    smtpHost,
    smtpPort,
    smtpSecure,
    smtpUser,
    smtpPass,
    smtpFrom,
    smtpReplyTo
  };
};

const hasMailConfig = (mailConfig) => {
  return Boolean(mailConfig.smtpHost && mailConfig.smtpPort && mailConfig.smtpFrom);
};

const getSignature = (mailConfig) => {
  return [
    mailConfig.smtpHost,
    mailConfig.smtpPort,
    mailConfig.smtpSecure,
    mailConfig.smtpUser,
    mailConfig.smtpPass
  ].join('|');
};

const getTransporter = (mailConfig) => {
  const signature = getSignature(mailConfig);
  if (transporterCache && transporterSignature === signature) {
    return transporterCache;
  }

  const transportOptions = {
    host: mailConfig.smtpHost,
    port: mailConfig.smtpPort,
    secure: mailConfig.smtpSecure
  };

  if (mailConfig.smtpUser && mailConfig.smtpPass) {
    transportOptions.auth = {
      user: mailConfig.smtpUser,
      pass: mailConfig.smtpPass
    };
  }

  transporterCache = nodemailer.createTransport(transportOptions);
  transporterSignature = signature;
  return transporterCache;
};

export const verifyMailConnection = async (overrideConfig = null) => {
  const resolvedConfig = await toResolvedConfig(overrideConfig);

  if (!hasMailConfig(resolvedConfig)) {
    return { ok: false, reason: 'smtp_not_configured' };
  }

  try {
    const transporter = getTransporter(resolvedConfig);
    await transporter.verify();
    return { ok: true };
  } catch (error) {
    logger.error('SMTP verification failed', { message: error.message });
    return { ok: false, reason: 'verify_failed', message: error.message };
  }
};

export const sendMail = async ({ to, subject, html, text, overrideConfig = null }) => {
  const resolvedConfig = await toResolvedConfig(overrideConfig);

  if (!hasMailConfig(resolvedConfig)) {
    logger.warn('SMTP is not configured. Skipping email send.');
    return { sent: false, reason: 'smtp_not_configured' };
  }

  try {
    const mailTransport = getTransporter(resolvedConfig);
    const info = await mailTransport.sendMail({
      from: resolvedConfig.smtpFrom,
      replyTo: resolvedConfig.smtpReplyTo || undefined,
      to,
      subject,
      html,
      text
    });

    logger.info('Email sent successfully', { messageId: info.messageId, to });
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Failed to send email', { message: error.message, to });
    return { sent: false, reason: 'send_failed', message: error.message };
  }
};

export const sendResetPasswordEmail = async ({ to, fullName, resetUrl, expiresMinutes = 15 }) => {
  const subject = 'Dat lai mat khau CMS Admin';
  const safeName = fullName || 'ban';
  const text = [
    `Xin chao ${safeName},`,
    '',
    'Ban da yeu cau dat lai mat khau cho tai khoan CMS Admin.',
    `Lien ket dat lai mat khau (hieu luc ${expiresMinutes} phut):`,
    resetUrl,
    '',
    'Neu ban khong thuc hien yeu cau nay, hay bo qua email nay.'
  ].join('\n');

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111;">
      <p>Xin chao <strong>${safeName}</strong>,</p>
      <p>Ban da yeu cau dat lai mat khau cho tai khoan CMS Admin.</p>
      <p>Lien ket dat lai mat khau (hieu luc ${expiresMinutes} phut):</p>
      <p><a href="${resetUrl}" target="_blank" rel="noopener noreferrer">${resetUrl}</a></p>
      <p>Neu ban khong thuc hien yeu cau nay, hay bo qua email nay.</p>
    </div>
  `;

  return sendMail({
    to,
    subject,
    text,
    html
  });
};

export default {
  sendMail,
  sendResetPasswordEmail,
  verifyMailConnection
};
