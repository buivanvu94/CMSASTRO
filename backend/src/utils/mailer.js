import nodemailer from 'nodemailer';
import { config } from '../config/index.js';
import logger from './logger.js';

let transporter;

const hasMailConfig = () => {
  return Boolean(config.mail.host && config.mail.port && config.mail.from);
};

const getTransporter = () => {
  if (transporter) return transporter;

  const transportOptions = {
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.secure
  };

  if (config.mail.user && config.mail.pass) {
    transportOptions.auth = {
      user: config.mail.user,
      pass: config.mail.pass
    };
  }

  transporter = nodemailer.createTransport(transportOptions);
  return transporter;
};

export const sendMail = async ({ to, subject, html, text }) => {
  if (!hasMailConfig()) {
    logger.warn('SMTP is not configured. Skipping email send.');
    return { sent: false, reason: 'smtp_not_configured' };
  }

  try {
    const mailTransport = getTransporter();
    const info = await mailTransport.sendMail({
      from: config.mail.from,
      to,
      subject,
      html,
      text
    });

    logger.info('Email sent successfully', { messageId: info.messageId, to });
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Failed to send email', { message: error.message, to });
    return { sent: false, reason: 'send_failed' };
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
  sendResetPasswordEmail
};
