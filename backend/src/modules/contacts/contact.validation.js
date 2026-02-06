import { body, param, query, validationResult } from 'express-validator';

/**
 * Contact Validation Rules
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
 * Get contacts validation
 */
export const getContactsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .isString()
    .trim(),
  query('status')
    .optional()
    .isIn(['new', 'read', 'replied', 'spam'])
    .withMessage('Status must be new, read, replied, or spam'),
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('dateFrom must be a valid date'),
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('dateTo must be a valid date')
];

/**
 * Get contact by ID validation
 */
export const getContactByIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Contact ID must be a positive integer')
];

/**
 * Create contact validation
 */
export const createContactValidation = [
  body('name')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('phone')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number must not exceed 20 characters'),
  body('subject')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Subject must be between 2 and 255 characters'),
  body('message')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10 })
    .withMessage('Message must be at least 10 characters')
];

/**
 * Update contact status validation
 */
export const updateContactStatusValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Contact ID must be a positive integer'),
  body('status')
    .isIn(['new', 'read', 'replied', 'spam'])
    .withMessage('Status must be new, read, replied, or spam')
];

/**
 * Delete contact validation
 */
export const deleteContactValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Contact ID must be a positive integer')
];

/**
 * Bulk delete contacts validation
 */
export const bulkDeleteContactsValidation = [
  body('ids')
    .isArray({ min: 1 })
    .withMessage('IDs must be a non-empty array'),
  body('ids.*')
    .isInt({ min: 1 })
    .withMessage('Each ID must be a positive integer')
];

export default {
  handleValidationErrors,
  getContactsValidation,
  getContactByIdValidation,
  createContactValidation,
  updateContactStatusValidation,
  deleteContactValidation,
  bulkDeleteContactsValidation
};
