import { body, param, query, validationResult } from 'express-validator';

/**
 * Product Validation Rules
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
 * Get products validation
 */
export const getProductsValidation = [
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
  query('productCategoryId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Product category ID must be a positive integer'),
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
    .withMessage('isFeatured must be a boolean')
];

/**
 * Get product by ID validation
 */
export const getProductByIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer')
];

/**
 * Get product by slug validation
 */
export const getProductBySlugValidation = [
  param('slug')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Slug is required')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens')
];

/**
 * Price variant validation schema
 */
const priceVariantSchema = [
  body('prices.*.variant_name')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Variant name must not exceed 100 characters'),
  body('prices.*.price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number'),
  body('prices.*.sale_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Sale price must be a non-negative number'),
  body('prices.*.is_default')
    .optional()
    .isBoolean()
    .withMessage('is_default must be a boolean'),
  body('prices.*.status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be active or inactive')
];

/**
 * Create product validation
 */
export const createProductValidation = [
  body('name')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 255 })
    .withMessage('Product name must not exceed 255 characters'),
  body('description')
    .optional()
    .isString(),
  body('short_description')
    .optional()
    .isString()
    .trim(),
  body('product_category_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Product category ID must be a positive integer'),
  body('featured_image_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Featured image ID must be a positive integer'),
  body('gallery')
    .optional()
    .isArray()
    .withMessage('Gallery must be an array'),
  body('gallery.*')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Gallery items must be valid media IDs'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be draft, published, or archived'),
  body('is_featured')
    .optional()
    .isBoolean()
    .withMessage('is_featured must be a boolean'),
  body('sort_order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
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
    .withMessage('SEO description must not exceed 160 characters'),
  body('prices')
    .optional()
    .isArray()
    .withMessage('Prices must be an array'),
  ...priceVariantSchema
];

/**
 * Update product validation
 */
export const updateProductValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer'),
  body('name')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Product name cannot be empty')
    .isLength({ max: 255 })
    .withMessage('Product name must not exceed 255 characters'),
  body('slug')
    .optional()
    .isString()
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
  body('description')
    .optional()
    .isString(),
  body('short_description')
    .optional()
    .isString()
    .trim(),
  body('product_category_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Product category ID must be a positive integer'),
  body('featured_image_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Featured image ID must be a positive integer'),
  body('gallery')
    .optional()
    .isArray()
    .withMessage('Gallery must be an array'),
  body('gallery.*')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Gallery items must be valid media IDs'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be draft, published, or archived'),
  body('is_featured')
    .optional()
    .isBoolean()
    .withMessage('is_featured must be a boolean'),
  body('sort_order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
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
 * Delete product validation
 */
export const deleteProductValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer')
];

/**
 * Add price variant validation
 */
export const addPriceVariantValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer'),
  body('variant_name')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Variant name must not exceed 100 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number'),
  body('sale_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Sale price must be a non-negative number'),
  body('is_default')
    .optional()
    .isBoolean()
    .withMessage('is_default must be a boolean'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be active or inactive')
];

/**
 * Update price variant validation
 */
export const updatePriceVariantValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer'),
  param('priceId')
    .isInt({ min: 1 })
    .withMessage('Price ID must be a positive integer'),
  body('variant_name')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Variant name must not exceed 100 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number'),
  body('sale_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Sale price must be a non-negative number'),
  body('is_default')
    .optional()
    .isBoolean()
    .withMessage('is_default must be a boolean'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be active or inactive')
];

/**
 * Delete price variant validation
 */
export const deletePriceVariantValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer'),
  param('priceId')
    .isInt({ min: 1 })
    .withMessage('Price ID must be a positive integer')
];

export default {
  handleValidationErrors,
  getProductsValidation,
  getProductByIdValidation,
  getProductBySlugValidation,
  createProductValidation,
  updateProductValidation,
  deleteProductValidation,
  addPriceVariantValidation,
  updatePriceVariantValidation,
  deletePriceVariantValidation
};
