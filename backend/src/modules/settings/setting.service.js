import Setting from './setting.model.js';
import { NotFoundError, ValidationError } from '../../middlewares/errorHandler.js';
import { config as appConfig } from '../../config/index.js';

const BOOKING_EMAIL_CONFIG_KEY = 'booking_email_config';

const DEFAULT_BOOKING_EMAIL_TEMPLATES = {
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

const DEFAULT_BOOKING_EMAIL_CONFIG = {
  smtpHost: appConfig.mail.host || '',
  smtpPort: appConfig.mail.port || 587,
  smtpSecure: Boolean(appConfig.mail.secure),
  smtpUser: appConfig.mail.user || '',
  smtpPass: appConfig.mail.pass || '',
  smtpFrom: appConfig.mail.from || '',
  smtpReplyTo: '',
  adminBookingNotificationEnabled: false,
  adminBookingNotificationEmails: [],
  reminderEnabled: true,
  reminderLeadHours: 24,
  emailTemplates: DEFAULT_BOOKING_EMAIL_TEMPLATES
};

const parseEmailList = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || '').trim().toLowerCase())
      .filter(Boolean);
  }
  if (typeof value !== 'string') return [];
  return value
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
};

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());

const sanitizeTemplateString = (value, fallback) => {
  const str = typeof value === 'string' ? value : '';
  const normalized = str.replace(/\r\n/g, '\n').trim();
  return normalized || fallback;
};

const sanitizeBookingEmailTemplates = (rawTemplates = {}) => {
  const merged = {
    ...DEFAULT_BOOKING_EMAIL_TEMPLATES,
    ...(rawTemplates || {}),
    customerBookingCreated: {
      ...DEFAULT_BOOKING_EMAIL_TEMPLATES.customerBookingCreated,
      ...((rawTemplates || {}).customerBookingCreated || {})
    },
    adminBookingCreated: {
      ...DEFAULT_BOOKING_EMAIL_TEMPLATES.adminBookingCreated,
      ...((rawTemplates || {}).adminBookingCreated || {})
    },
    customerBookingReminder: {
      ...DEFAULT_BOOKING_EMAIL_TEMPLATES.customerBookingReminder,
      ...((rawTemplates || {}).customerBookingReminder || {})
    }
  };

  return {
    customerBookingCreated: {
      subject: sanitizeTemplateString(
        merged.customerBookingCreated.subject,
        DEFAULT_BOOKING_EMAIL_TEMPLATES.customerBookingCreated.subject
      ),
      body: sanitizeTemplateString(
        merged.customerBookingCreated.body,
        DEFAULT_BOOKING_EMAIL_TEMPLATES.customerBookingCreated.body
      )
    },
    adminBookingCreated: {
      subject: sanitizeTemplateString(
        merged.adminBookingCreated.subject,
        DEFAULT_BOOKING_EMAIL_TEMPLATES.adminBookingCreated.subject
      ),
      body: sanitizeTemplateString(
        merged.adminBookingCreated.body,
        DEFAULT_BOOKING_EMAIL_TEMPLATES.adminBookingCreated.body
      )
    },
    customerBookingReminder: {
      subject: sanitizeTemplateString(
        merged.customerBookingReminder.subject,
        DEFAULT_BOOKING_EMAIL_TEMPLATES.customerBookingReminder.subject
      ),
      body: sanitizeTemplateString(
        merged.customerBookingReminder.body,
        DEFAULT_BOOKING_EMAIL_TEMPLATES.customerBookingReminder.body
      )
    }
  };
};

const sanitizeBookingEmailConfig = (rawConfig = {}, { allowEmptyPassword = true } = {}) => {
  const merged = {
    ...DEFAULT_BOOKING_EMAIL_CONFIG,
    ...(rawConfig || {})
  };

  const smtpPort = parseInt(merged.smtpPort, 10);
  const reminderLeadHours = parseInt(merged.reminderLeadHours, 10);
  const smtpPass = merged.smtpPass == null ? '' : String(merged.smtpPass);

  return {
    smtpHost: String(merged.smtpHost || '').trim(),
    smtpPort: Number.isFinite(smtpPort) ? smtpPort : DEFAULT_BOOKING_EMAIL_CONFIG.smtpPort,
    smtpSecure: Boolean(merged.smtpSecure),
    smtpUser: String(merged.smtpUser || '').trim(),
    smtpPass: allowEmptyPassword ? smtpPass : smtpPass.trim(),
    smtpFrom: String(merged.smtpFrom || '').trim(),
    smtpReplyTo: String(merged.smtpReplyTo || '').trim(),
    adminBookingNotificationEnabled: Boolean(merged.adminBookingNotificationEnabled),
    adminBookingNotificationEmails: parseEmailList(merged.adminBookingNotificationEmails),
    reminderEnabled: Boolean(merged.reminderEnabled),
    reminderLeadHours: Number.isFinite(reminderLeadHours)
      ? Math.max(1, Math.min(168, reminderLeadHours))
      : DEFAULT_BOOKING_EMAIL_CONFIG.reminderLeadHours,
    emailTemplates: sanitizeBookingEmailTemplates(merged.emailTemplates)
  };
};

const toPublicBookingEmailConfig = (configData) => {
  const safeConfig = sanitizeBookingEmailConfig(configData);
  const { smtpPass, ...rest } = safeConfig;
  return {
    ...rest,
    smtpHasPassword: Boolean(String(smtpPass || '').trim())
  };
};

const mapSettingWithParsedValue = (setting) => {
  const plain = setting.toJSON();
  let parsedValue = setting.getParsedValue();
  let value = plain.value;

  if (setting.key === BOOKING_EMAIL_CONFIG_KEY && parsedValue && typeof parsedValue === 'object') {
    parsedValue = toPublicBookingEmailConfig(parsedValue);
    value = JSON.stringify(parsedValue);
  }

  return {
    ...plain,
    value,
    parsedValue
  };
};

export const findAll = async () => {
  const settings = await Setting.findAll({
    order: [['group', 'ASC'], ['key', 'ASC']]
  });
  return settings.map(mapSettingWithParsedValue);
};

export const findByKey = async (key) => {
  const setting = await Setting.findOne({ where: { key } });
  if (!setting) {
    throw new NotFoundError(`Setting not found: ${key}`);
  }
  return mapSettingWithParsedValue(setting);
};

export const findByGroup = async (group) => {
  const settings = await Setting.findAll({
    where: { group },
    order: [['key', 'ASC']]
  });
  return settings.map(mapSettingWithParsedValue);
};

export const upsert = async (key, value, options = {}) => {
  const { group = 'general', type = 'string', description = null } = options;
  let setting = await Setting.findOne({ where: { key } });

  if (setting) {
    await setting.setValue(value);
    if (options.group) setting.group = group;
    if (options.type) setting.type = type;
    if (options.description !== undefined) setting.description = description;
    await setting.save();
  } else {
    let stringValue;
    switch (type) {
      case 'json':
        stringValue = JSON.stringify(value);
        break;
      case 'boolean':
        stringValue = value ? 'true' : 'false';
        break;
      case 'number':
        stringValue = String(value);
        break;
      case 'string':
      default:
        stringValue = String(value);
    }

    setting = await Setting.create({
      key,
      value: stringValue,
      group,
      type,
      description
    });
  }

  return mapSettingWithParsedValue(setting);
};

export const updateMultiple = async (settings) => {
  const results = [];
  for (const settingData of settings) {
    const { key, value, ...options } = settingData;
    const result = await upsert(key, value, options);
    results.push(result);
  }
  return results;
};

export const deleteSetting = async (key) => {
  const setting = await Setting.findOne({ where: { key } });
  if (!setting) {
    throw new NotFoundError(`Setting not found: ${key}`);
  }
  await setting.destroy();
};

export const getAsObject = async (group = null) => {
  const where = group ? { group } : {};
  const settings = await Setting.findAll({ where });
  const result = {};

  settings.forEach((setting) => {
    if (setting.key === BOOKING_EMAIL_CONFIG_KEY) {
      result[setting.key] = toPublicBookingEmailConfig(setting.getParsedValue() || {});
      return;
    }
    result[setting.key] = setting.getParsedValue();
  });

  return result;
};

export const getBookingEmailRuntimeConfig = async () => {
  const setting = await Setting.findOne({ where: { key: BOOKING_EMAIL_CONFIG_KEY } });
  if (!setting) {
    return sanitizeBookingEmailConfig(DEFAULT_BOOKING_EMAIL_CONFIG);
  }
  return sanitizeBookingEmailConfig(setting.getParsedValue() || {});
};

export const getBookingEmailConfig = async () => {
  const runtimeConfig = await getBookingEmailRuntimeConfig();
  return toPublicBookingEmailConfig(runtimeConfig);
};

export const updateBookingEmailConfig = async (payload = {}) => {
  const current = await getBookingEmailRuntimeConfig();
  const next = {
    ...current,
    ...payload
  };

  // Keep old password when user leaves password empty in update payload
  if (payload.smtpPass === undefined || payload.smtpPass === '') {
    next.smtpPass = current.smtpPass;
  }

  const normalized = sanitizeBookingEmailConfig(next);

  if (normalized.smtpFrom && !isValidEmail(normalized.smtpFrom)) {
    throw new ValidationError('smtpFrom must be a valid email');
  }

  if (normalized.smtpReplyTo && !isValidEmail(normalized.smtpReplyTo)) {
    throw new ValidationError('smtpReplyTo must be a valid email');
  }

  const invalidAdminEmails = normalized.adminBookingNotificationEmails.filter((email) => !isValidEmail(email));
  if (invalidAdminEmails.length > 0) {
    throw new ValidationError('Invalid email found in admin booking notification list');
  }

  if (normalized.adminBookingNotificationEnabled && normalized.adminBookingNotificationEmails.length === 0) {
    throw new ValidationError('Admin booking notification emails are required when notification is enabled');
  }

  await upsert(
    BOOKING_EMAIL_CONFIG_KEY,
    normalized,
    {
      group: 'booking',
      type: 'json',
      description: 'SMTP and booking email notification settings'
    }
  );

  return toPublicBookingEmailConfig(normalized);
};

export default {
  findAll,
  findByKey,
  findByGroup,
  upsert,
  updateMultiple,
  deleteSetting,
  getAsObject,
  getBookingEmailConfig,
  getBookingEmailRuntimeConfig,
  updateBookingEmailConfig
};
