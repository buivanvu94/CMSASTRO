import { body, param, query, validationResult } from 'express-validator';

/**
 * Setting Validation Rules
 */

/**
 * Handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().reduce((acc, error) => {
        acc[error.path] = error.msg;
        return acc;
      }, {})
    });
  }
  next();
};

/**
 * Get setting by key validation
 */
export const getSettingByKeyValidation = [
  param('key')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Setting key is required')
];

/**
 * Get settings by group validation
 */
export const getSettingsByGroupValidation = [
  param('group')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Group is required')
];

/**
 * Update settings validation
 */
export const updateSettingsValidation = [
  body('settings')
    .isArray({ min: 1 })
    .withMessage('Settings must be a non-empty array'),
  body('settings.*.key')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Each setting must have a key')
    .isLength({ min: 2, max: 100 })
    .withMessage('Key must be between 2 and 100 characters'),
  body('settings.*.value')
    .exists()
    .withMessage('Each setting must have a value'),
  body('settings.*.group')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Group must not exceed 50 characters'),
  body('settings.*.type')
    .optional()
    .isIn(['string', 'number', 'boolean', 'json'])
    .withMessage('Type must be string, number, boolean, or json'),
  body('settings.*.description')
    .optional()
    .isString()
    .trim()
];

/**
 * Get settings as object validation
 */
export const getSettingsAsObjectValidation = [
  query('group')
    .optional()
    .isString()
    .trim()
];

export const updateBookingEmailConfigValidation = [
  body('smtpHost')
    .optional()
    .isString()
    .trim(),
  body('smtpPort')
    .optional()
    .isInt({ min: 1, max: 65535 })
    .withMessage('SMTP port must be between 1 and 65535'),
  body('smtpSecure')
    .optional()
    .isBoolean()
    .withMessage('smtpSecure must be boolean'),
  body('smtpUser')
    .optional()
    .isString()
    .trim(),
  body('smtpPass')
    .optional()
    .isString(),
  body('smtpFrom')
    .optional()
    .isString()
    .trim(),
  body('smtpReplyTo')
    .optional()
    .isString()
    .trim(),
  body('adminBookingNotificationEnabled')
    .optional()
    .isBoolean()
    .withMessage('adminBookingNotificationEnabled must be boolean'),
  body('adminBookingNotificationEmails')
    .optional()
    .custom((value) => {
      if (Array.isArray(value)) return true;
      if (typeof value === 'string') return true;
      throw new Error('adminBookingNotificationEmails must be string or array');
    }),
  body('reminderEnabled')
    .optional()
    .isBoolean()
    .withMessage('reminderEnabled must be boolean'),
  body('reminderLeadHours')
    .optional()
    .isInt({ min: 1, max: 168 })
    .withMessage('reminderLeadHours must be between 1 and 168'),
  body('emailTemplates')
    .optional()
    .isObject()
    .withMessage('emailTemplates must be an object'),
  body('emailTemplates.customerBookingCreated.subject')
    .optional()
    .isString()
    .isLength({ min: 1, max: 300 })
    .withMessage('customer booking subject must be between 1 and 300 characters'),
  body('emailTemplates.customerBookingCreated.body')
    .optional()
    .isString()
    .isLength({ min: 1, max: 10000 })
    .withMessage('customer booking body must be between 1 and 10000 characters'),
  body('emailTemplates.adminBookingCreated.subject')
    .optional()
    .isString()
    .isLength({ min: 1, max: 300 })
    .withMessage('admin booking subject must be between 1 and 300 characters'),
  body('emailTemplates.adminBookingCreated.body')
    .optional()
    .isString()
    .isLength({ min: 1, max: 10000 })
    .withMessage('admin booking body must be between 1 and 10000 characters'),
  body('emailTemplates.customerBookingReminder.subject')
    .optional()
    .isString()
    .isLength({ min: 1, max: 300 })
    .withMessage('reminder subject must be between 1 and 300 characters'),
  body('emailTemplates.customerBookingReminder.body')
    .optional()
    .isString()
    .isLength({ min: 1, max: 10000 })
    .withMessage('reminder body must be between 1 and 10000 characters')
];

export const testBookingSmtpValidation = [
  body('testTo')
    .isEmail()
    .withMessage('testTo must be a valid email')
];

export default {
  handleValidationErrors,
  getSettingByKeyValidation,
  getSettingsByGroupValidation,
  updateSettingsValidation,
  getSettingsAsObjectValidation,
  updateBookingEmailConfigValidation,
  testBookingSmtpValidation
};
