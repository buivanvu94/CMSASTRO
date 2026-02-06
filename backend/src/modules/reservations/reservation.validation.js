import { body, param, query, validationResult } from 'express-validator';

/**
 * Reservation Validation Rules
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
 * Get reservations validation
 */
export const getReservationsValidation = [
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
    .isIn(['pending', 'confirmed', 'cancelled', 'completed', 'no_show'])
    .withMessage('Status must be pending, confirmed, cancelled, completed, or no_show'),
  query('dateFrom')
    .optional()
    .isDate()
    .withMessage('dateFrom must be a valid date'),
  query('dateTo')
    .optional()
    .isDate()
    .withMessage('dateTo must be a valid date')
];

/**
 * Get reservation by ID validation
 */
export const getReservationByIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Reservation ID must be a positive integer')
];

/**
 * Create reservation validation
 */
export const createReservationValidation = [
  body('customer_name')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Customer name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Customer name must be between 2 and 100 characters'),
  body('customer_email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('customer_phone')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Customer phone is required')
    .isLength({ max: 20 })
    .withMessage('Phone number must not exceed 20 characters'),
  body('reservation_date')
    .isDate()
    .withMessage('Valid reservation date is required'),
  body('reservation_time')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Reservation time must be in HH:MM format'),
  body('party_size')
    .isInt({ min: 1, max: 50 })
    .withMessage('Party size must be between 1 and 50'),
  body('special_requests')
    .optional()
    .isString()
    .trim()
];

/**
 * Update reservation validation
 */
export const updateReservationValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Reservation ID must be a positive integer'),
  body('customer_name')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Customer name cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('Customer name must be between 2 and 100 characters'),
  body('customer_email')
    .optional()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('customer_phone')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Customer phone cannot be empty')
    .isLength({ max: 20 })
    .withMessage('Phone number must not exceed 20 characters'),
  body('reservation_date')
    .optional()
    .isDate()
    .withMessage('Valid reservation date is required'),
  body('reservation_time')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Reservation time must be in HH:MM format'),
  body('party_size')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Party size must be between 1 and 50'),
  body('special_requests')
    .optional()
    .isString()
    .trim(),
  body('notes')
    .optional()
    .isString()
    .trim()
];

/**
 * Update reservation status validation
 */
export const updateReservationStatusValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Reservation ID must be a positive integer'),
  body('status')
    .isIn(['pending', 'confirmed', 'cancelled', 'completed', 'no_show'])
    .withMessage('Status must be pending, confirmed, cancelled, completed, or no_show')
];

/**
 * Delete reservation validation
 */
export const deleteReservationValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Reservation ID must be a positive integer')
];

/**
 * Get calendar validation
 */
export const getCalendarValidation = [
  query('month')
    .optional()
    .matches(/^\d{4}-\d{2}$/)
    .withMessage('Month must be in YYYY-MM format')
];

export default {
  handleValidationErrors,
  getReservationsValidation,
  getReservationByIdValidation,
  createReservationValidation,
  updateReservationValidation,
  updateReservationStatusValidation,
  deleteReservationValidation,
  getCalendarValidation
};
