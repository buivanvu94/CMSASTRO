import express from 'express';
import * as productController from './product.controller.js';
import * as productValidation from './product.validation.js';
import { authenticate } from '../../middlewares/auth.js';
import { authorize } from '../../middlewares/authorize.js';

const router = express.Router();

/**
 * Product Routes
 * All routes require authentication
 */

/**
 * GET /products/stats
 * Get product statistics
 */
router.get(
  '/stats',
  authenticate,
  productController.getStats
);

/**
 * GET /products/slug/:slug
 * Get product by slug
 */
router.get(
  '/slug/:slug',
  authenticate,
  productValidation.getProductBySlugValidation,
  productValidation.handleValidationErrors,
  productController.getProductBySlug
);

/**
 * GET /products
 * List all products
 */
router.get(
  '/',
  authenticate,
  productValidation.getProductsValidation,
  productValidation.handleValidationErrors,
  productController.getProducts
);

/**
 * GET /products/public
 * Public list for frontend pages (published products only)
 */
router.get(
  '/public',
  productValidation.getProductsValidation,
  productValidation.handleValidationErrors,
  productController.getPublicProducts
);

/**
 * GET /products/:id
 * Get product by ID
 */
router.get(
  '/:id',
  authenticate,
  productValidation.getProductByIdValidation,
  productValidation.handleValidationErrors,
  productController.getProductById
);

/**
 * POST /products
 * Create new product
 */
router.post(
  '/',
  authenticate,
  authorize(['admin', 'editor']),
  productValidation.createProductValidation,
  productValidation.handleValidationErrors,
  productController.createProduct
);

/**
 * PUT /products/:id
 * Update product
 */
router.put(
  '/:id',
  authenticate,
  authorize(['admin', 'editor']),
  productValidation.updateProductValidation,
  productValidation.handleValidationErrors,
  productController.updateProduct
);

/**
 * DELETE /products/:id
 * Delete product
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['admin', 'editor']),
  productValidation.deleteProductValidation,
  productValidation.handleValidationErrors,
  productController.deleteProduct
);

/**
 * POST /products/:id/prices
 * Add price variant to product
 */
router.post(
  '/:id/prices',
  authenticate,
  authorize(['admin', 'editor']),
  productValidation.addPriceVariantValidation,
  productValidation.handleValidationErrors,
  productController.addPriceVariant
);

/**
 * PUT /products/:id/prices/:priceId
 * Update price variant
 */
router.put(
  '/:id/prices/:priceId',
  authenticate,
  authorize(['admin', 'editor']),
  productValidation.updatePriceVariantValidation,
  productValidation.handleValidationErrors,
  productController.updatePriceVariant
);

/**
 * DELETE /products/:id/prices/:priceId
 * Delete price variant
 */
router.delete(
  '/:id/prices/:priceId',
  authenticate,
  authorize(['admin', 'editor']),
  productValidation.deletePriceVariantValidation,
  productValidation.handleValidationErrors,
  productController.deletePriceVariant
);

export default router;
