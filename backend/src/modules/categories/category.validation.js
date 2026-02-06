import { body, param, query, validationResult } from 'express-validator';

/**
 * Category Validation Rules
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
      errors: errors.array()
    });
  }
  next();
};

/**
 * Validation for getting categories
 */
export const getCategoriesValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('type')
    .optional()
    .isIn(['post', 'product'])
    .withMessage('Type must be either post or product'),
  query('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive'),
  query('parentId')
    .optional()
    .isInt()
    .withMessage('Parent ID must be an integer')
];

/**
 * Validation for getting category tree
 */
export const getCategoryTreeValidation = [
  query('type')
    .optional()
    .isIn(['post', 'product'])
    .withMessage('Type must be either post or product')
];

/**
 * Validation for getting category by ID
 */
export const getCategoryByIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer')
];

/**
 * Validation for getting category by slug
 */
export const getCategoryBySlugValidation = [
  param('slug')
    .notEmpty()
    .withMessage('Slug is required')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug must be lowercase alphanumeric with hyphens')
];

/**
 * Validation for creating category
 */
export const createCategoryValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  body('slug')
    .optional()
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug must be lowercase alphanumeric with hyphens'),
  body('description')
    .optional()
    .trim(),
  body('parent_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Parent ID must be a positive integer'),
  body('image_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Image ID must be a positive integer'),
  body('type')
    .optional()
    .isIn(['post', 'product'])
    .withMessage('Type must be either post or product'),
  body('sort_order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive'),
  body('seo_title')
    .optional()
    .trim()
    .isLength({ max: 70 })
    .withMessage('SEO title must not exceed 70 characters'),
  body('seo_description')
    .optional()
    .trim()
    .isLength({ max: 160 })
    .withMessage('SEO description must not exceed 160 characters')
];

/**
 * Validation for updating category
 */
export const updateCategoryValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category name cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  body('slug')
    .optional()
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug must be lowercase alphanumeric with hyphens'),
  body('description')
    .optional()
    .trim(),
  body('parent_id')
    .optional()
    .custom((value) => value === null || (Number.isInteger(value) && value > 0))
    .withMessage('Parent ID must be null or a positive integer'),
  body('image_id')
    .optional()
    .custom((value) => value === null || (Number.isInteger(value) && value > 0))
    .withMessage('Image ID must be null or a positive integer'),
  body('type')
    .optional()
    .isIn(['post', 'product'])
    .withMessage('Type must be either post or product'),
  body('sort_order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive'),
  body('seo_title')
    .optional()
    .trim()
    .isLength({ max: 70 })
    .withMessage('SEO title must not exceed 70 characters'),
  body('seo_description')
    .optional()
    .trim()
    .isLength({ max: 160 })
    .withMessage('SEO description must not exceed 160 characters')
];

/**
 * Validation for deleting category
 */
export const deleteCategoryValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer')
];

/**
 * Validation for reordering categories
 */
export const reorderCategoriesValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items must be a non-empty array'),
  body('items.*.id')
    .isInt({ min: 1 })
    .withMessage('Each item must have a valid ID'),
  body('items.*.sort_order')
    .isInt({ min: 0 })
    .withMessage('Each item must have a valid sort order'),
  body('items.*.parent_id')
    .optional()
    .custom((value) => value === null || (Number.isInteger(value) && value > 0))
    .withMessage('Parent ID must be null or a positive integer')
];

export default {
  handleValidationErrors,
  getCategoriesValidation,
  getCategoryTreeValidation,
  getCategoryByIdValidation,
  getCategoryBySlugValidation,
  createCategoryValidation,
  updateCategoryValidation,
  deleteCategoryValidation,
  reorderCategoriesValidation
};
