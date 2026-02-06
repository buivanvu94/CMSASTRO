import { body, param, query, validationResult } from 'express-validator';

/**
 * User Validation Rules
 */

/**
 * Validation for creating user
 */
export const createUserValidation = [
  body('full_name')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  body('role')
    .optional()
    .isIn(['admin', 'editor', 'author']).withMessage('Role must be admin, editor, or author'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
  
  body('avatar_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Avatar ID must be a positive integer')
];

/**
 * Validation for updating user
 */
export const updateUserValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('User ID must be a positive integer'),
  
  body('full_name')
    .optional()
    .trim()
    .notEmpty().withMessage('Full name cannot be empty')
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),
  
  body('email')
    .optional()
    .trim()
    .notEmpty().withMessage('Email cannot be empty')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  body('role')
    .optional()
    .isIn(['admin', 'editor', 'author']).withMessage('Role must be admin, editor, or author'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
  
  body('avatar_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Avatar ID must be a positive integer')
];

/**
 * Validation for getting user by ID
 */
export const getUserByIdValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('User ID must be a positive integer')
];

/**
 * Validation for deleting user
 */
export const deleteUserValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('User ID must be a positive integer')
];

/**
 * Validation for updating password
 */
export const updatePasswordValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('User ID must be a positive integer'),
  
  body('oldPassword')
    .notEmpty().withMessage('Current password is required'),
  
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];

/**
 * Validation for listing users
 */
export const getUsersValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  query('search')
    .optional()
    .trim(),
  
  query('role')
    .optional()
    .isIn(['admin', 'editor', 'author']).withMessage('Role must be admin, editor, or author'),
  
  query('status')
    .optional()
    .isIn(['active', 'inactive']).withMessage('Status must be active or inactive')
];

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = {};
    errors.array().forEach(error => {
      formattedErrors[error.path] = error.msg;
    });
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors
    });
  }
  
  next();
};

export default {
  createUserValidation,
  updateUserValidation,
  getUserByIdValidation,
  deleteUserValidation,
  updatePasswordValidation,
  getUsersValidation,
  handleValidationErrors
};
