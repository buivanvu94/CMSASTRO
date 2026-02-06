import { body, param, validationResult } from 'express-validator';

/**
 * Menu Validation Rules
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
 * Get menu by ID validation
 */
export const getMenuByIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Menu ID must be a positive integer')
];

/**
 * Get menu by location validation
 */
export const getMenuByLocationValidation = [
  param('location')
    .isIn(['header', 'footer', 'sidebar', 'mobile'])
    .withMessage('Location must be header, footer, sidebar, or mobile')
];

/**
 * Create menu validation
 */
export const createMenuValidation = [
  body('name')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Menu name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Menu name must be between 2 and 100 characters'),
  body('location')
    .isIn(['header', 'footer', 'sidebar', 'mobile'])
    .withMessage('Location must be header, footer, sidebar, or mobile'),
  body('description')
    .optional()
    .isString()
    .trim()
];

/**
 * Update menu validation
 */
export const updateMenuValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Menu ID must be a positive integer'),
  body('name')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Menu name cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('Menu name must be between 2 and 100 characters'),
  body('location')
    .optional()
    .isIn(['header', 'footer', 'sidebar', 'mobile'])
    .withMessage('Location must be header, footer, sidebar, or mobile'),
  body('description')
    .optional()
    .isString()
    .trim()
];

/**
 * Delete menu validation
 */
export const deleteMenuValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Menu ID must be a positive integer')
];

/**
 * Add menu item validation
 */
export const addMenuItemValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Menu ID must be a positive integer'),
  body('title')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('url')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 255 })
    .withMessage('URL must not exceed 255 characters'),
  body('link_type')
    .optional()
    .isIn(['internal', 'custom'])
    .withMessage('Link type must be internal or custom'),
  body('target')
    .optional()
    .isIn(['_self', '_blank'])
    .withMessage('Target must be _self or _blank'),
  body('parent_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Parent ID must be a positive integer'),
  body('css_class')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('CSS class must not exceed 100 characters'),
  body('icon')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Icon must not exceed 50 characters'),
  body('sort_order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean')
];

/**
 * Update menu item validation
 */
export const updateMenuItemValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Menu ID must be a positive integer'),
  param('itemId')
    .isInt({ min: 1 })
    .withMessage('Item ID must be a positive integer'),
  body('title')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('url')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 255 })
    .withMessage('URL must not exceed 255 characters'),
  body('link_type')
    .optional()
    .isIn(['internal', 'custom'])
    .withMessage('Link type must be internal or custom'),
  body('target')
    .optional()
    .isIn(['_self', '_blank'])
    .withMessage('Target must be _self or _blank'),
  body('parent_id')
    .optional({ nullable: true })
    .custom((value) => value === null || (Number.isInteger(value) && value > 0))
    .withMessage('Parent ID must be null or a positive integer'),
  body('css_class')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('CSS class must not exceed 100 characters'),
  body('icon')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Icon must not exceed 50 characters'),
  body('sort_order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean')
];

/**
 * Delete menu item validation
 */
export const deleteMenuItemValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Menu ID must be a positive integer'),
  param('itemId')
    .isInt({ min: 1 })
    .withMessage('Item ID must be a positive integer')
];

/**
 * Reorder menu items validation
 */
export const reorderItemsValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Menu ID must be a positive integer'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items must be a non-empty array'),
  body('items.*.id')
    .isInt({ min: 1 })
    .withMessage('Each item ID must be a positive integer'),
  body('items.*.sort_order')
    .isInt({ min: 0 })
    .withMessage('Each sort order must be a non-negative integer')
];

export default {
  handleValidationErrors,
  getMenuByIdValidation,
  getMenuByLocationValidation,
  createMenuValidation,
  updateMenuValidation,
  deleteMenuValidation,
  addMenuItemValidation,
  updateMenuItemValidation,
  deleteMenuItemValidation,
  reorderItemsValidation
};
