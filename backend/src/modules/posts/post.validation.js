import { body, param, query, validationResult } from 'express-validator';

/**
 * Post Validation Rules
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
 * Get posts validation
 */
export const getPostsValidation = [
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
  query('categoryId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer'),
  query('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be draft, published, or archived'),
  query('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean'),
  query('authorId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Author ID must be a positive integer')
];

/**
 * Get post by ID validation
 */
export const getPostByIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Post ID must be a positive integer')
];

/**
 * Get post by slug validation
 */
export const getPostBySlugValidation = [
  param('slug')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Slug is required')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens')
];

/**
 * Create post validation
 */
export const createPostValidation = [
  body('title')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title must not exceed 255 characters'),
  body('content')
    .optional()
    .isString(),
  body('excerpt')
    .optional()
    .isString()
    .trim(),
  body('category_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer'),
  body('featured_image_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Featured image ID must be a positive integer'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be draft, published, or archived'),
  body('is_featured')
    .optional()
    .isBoolean()
    .withMessage('is_featured must be a boolean'),
  body('seo_title')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 70 })
    .withMessage('SEO title must not exceed 70 characters'),
  body('seo_description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 160 })
    .withMessage('SEO description must not exceed 160 characters')
];

/**
 * Update post validation
 */
export const updatePostValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Post ID must be a positive integer'),
  body('title')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 255 })
    .withMessage('Title must not exceed 255 characters'),
  body('slug')
    .optional()
    .isString()
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
  body('content')
    .optional()
    .isString(),
  body('excerpt')
    .optional()
    .isString()
    .trim(),
  body('category_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer'),
  body('featured_image_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Featured image ID must be a positive integer'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be draft, published, or archived'),
  body('is_featured')
    .optional()
    .isBoolean()
    .withMessage('is_featured must be a boolean'),
  body('seo_title')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 70 })
    .withMessage('SEO title must not exceed 70 characters'),
  body('seo_description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 160 })
    .withMessage('SEO description must not exceed 160 characters')
];

/**
 * Delete post validation
 */
export const deletePostValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Post ID must be a positive integer')
];

/**
 * Update post status validation
 */
export const updatePostStatusValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Post ID must be a positive integer'),
  body('status')
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be draft, published, or archived')
];

export default {
  handleValidationErrors,
  getPostsValidation,
  getPostByIdValidation,
  getPostBySlugValidation,
  createPostValidation,
  updatePostValidation,
  deletePostValidation,
  updatePostStatusValidation
};
