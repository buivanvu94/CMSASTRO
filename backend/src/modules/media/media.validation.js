import { body, param, query, validationResult } from 'express-validator';

/**
 * Media Validation Rules
 */

/**
 * Validation for getting media by ID
 */
export const getMediaByIdValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Media ID must be a positive integer')
];

/**
 * Validation for updating media
 */
export const updateMediaValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Media ID must be a positive integer'),
  
  body('alt_text')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Alt text must not exceed 255 characters'),
  
  body('caption')
    .optional()
    .trim(),
  
  body('folder')
    .optional()
    .trim()
    .notEmpty().withMessage('Folder cannot be empty')
    .isLength({ max: 100 }).withMessage('Folder name must not exceed 100 characters')
];

/**
 * Validation for deleting media
 */
export const deleteMediaValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Media ID must be a positive integer')
];

/**
 * Validation for bulk delete
 */
export const bulkDeleteValidation = [
  body('ids')
    .isArray({ min: 1 }).withMessage('IDs must be a non-empty array')
    .custom((ids) => {
      if (!ids.every(id => Number.isInteger(id) && id > 0)) {
        throw new Error('All IDs must be positive integers');
      }
      return true;
    })
];

/**
 * Validation for listing media
 */
export const getMediaValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  query('search')
    .optional()
    .trim(),
  
  query('folder')
    .optional()
    .trim(),
  
  query('mimeType')
    .optional()
    .trim()
];

/**
 * Validation for upload
 */
export const uploadValidation = [
  body('folder')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Folder name must not exceed 100 characters')
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
  getMediaByIdValidation,
  updateMediaValidation,
  deleteMediaValidation,
  bulkDeleteValidation,
  getMediaValidation,
  uploadValidation,
  handleValidationErrors
};
