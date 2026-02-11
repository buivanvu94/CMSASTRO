import express from 'express';
import * as categoryController from './category.controller.js';
import * as categoryValidation from './category.validation.js';
import { authenticate } from '../../middlewares/auth.js';
import { authorize } from '../../middlewares/authorize.js';

const router = express.Router();

/**
 * Category Routes
 * All routes require authentication
 */

/**
 * GET /categories/public
 * Get public categories for frontend pages
 */
router.get(
  '/public',
  categoryValidation.getPublicCategoriesValidation,
  categoryValidation.handleValidationErrors,
  categoryController.getPublicCategories
);

/**
 * GET /categories/stats
 * Get category statistics
 */
router.get(
  '/stats',
  authenticate,
  categoryController.getStats
);

/**
 * GET /categories/tree
 * Get categories in tree structure
 */
router.get(
  '/tree',
  authenticate,
  categoryValidation.getCategoryTreeValidation,
  categoryValidation.handleValidationErrors,
  categoryController.getCategoryTree
);

/**
 * PUT /categories/reorder
 * Reorder categories
 */
router.put(
  '/reorder',
  authenticate,
  authorize(['admin', 'editor']),
  categoryValidation.reorderCategoriesValidation,
  categoryValidation.handleValidationErrors,
  categoryController.reorderCategories
);

/**
 * GET /categories/slug/:slug
 * Get category by slug
 */
router.get(
  '/slug/:slug',
  authenticate,
  categoryValidation.getCategoryBySlugValidation,
  categoryValidation.handleValidationErrors,
  categoryController.getCategoryBySlug
);

/**
 * GET /categories
 * List all categories with pagination
 */
router.get(
  '/',
  authenticate,
  categoryValidation.getCategoriesValidation,
  categoryValidation.handleValidationErrors,
  categoryController.getCategories
);

/**
 * GET /categories/:id
 * Get category by ID
 */
router.get(
  '/:id',
  authenticate,
  categoryValidation.getCategoryByIdValidation,
  categoryValidation.handleValidationErrors,
  categoryController.getCategoryById
);

/**
 * POST /categories
 * Create new category
 */
router.post(
  '/',
  authenticate,
  authorize(['admin', 'editor']),
  categoryValidation.createCategoryValidation,
  categoryValidation.handleValidationErrors,
  categoryController.createCategory
);

/**
 * PUT /categories/:id
 * Update category
 */
router.put(
  '/:id',
  authenticate,
  authorize(['admin', 'editor']),
  categoryValidation.updateCategoryValidation,
  categoryValidation.handleValidationErrors,
  categoryController.updateCategory
);

/**
 * DELETE /categories/:id
 * Delete category
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['admin']),
  categoryValidation.deleteCategoryValidation,
  categoryValidation.handleValidationErrors,
  categoryController.deleteCategory
);

export default router;
