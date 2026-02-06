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

export default {
  handleValidationErrors,
  getSettingByKeyValidation,
  getSettingsByGroupValidation,
  updateSettingsValidation,
  getSettingsAsObjectValidation
};
