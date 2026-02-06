import express from 'express';
import * as productCategoryController from './product-category.controller.js';
import * as productCategoryValidation from './product-category.validation.js';
import { authenticate } from '../../middlewares/auth.js';
import { authorize } from '../../middlewares/authorize.js';

const router = express.Router();

router.get(
  '/stats',
  authenticate,
  productCategoryController.getStats
);

router.get(
  '/tree',
  authenticate,
  productCategoryValidation.getProductCategoryTreeValidation,
  productCategoryValidation.handleValidationErrors,
  productCategoryController.getProductCategoryTree
);

router.put(
  '/reorder',
  authenticate,
  authorize(['admin', 'editor']),
  productCategoryValidation.reorderProductCategoriesValidation,
  productCategoryValidation.handleValidationErrors,
  productCategoryController.reorderProductCategories
);

router.get(
  '/slug/:slug',
  authenticate,
  productCategoryValidation.getProductCategoryBySlugValidation,
  productCategoryValidation.handleValidationErrors,
  productCategoryController.getProductCategoryBySlug
);

router.get(
  '/',
  authenticate,
  productCategoryValidation.getProductCategoriesValidation,
  productCategoryValidation.handleValidationErrors,
  productCategoryController.getProductCategories
);

router.get(
  '/:id',
  authenticate,
  productCategoryValidation.getProductCategoryByIdValidation,
  productCategoryValidation.handleValidationErrors,
  productCategoryController.getProductCategoryById
);

router.post(
  '/',
  authenticate,
  authorize(['admin', 'editor']),
  productCategoryValidation.createProductCategoryValidation,
  productCategoryValidation.handleValidationErrors,
  productCategoryController.createProductCategory
);

router.put(
  '/:id',
  authenticate,
  authorize(['admin', 'editor']),
  productCategoryValidation.updateProductCategoryValidation,
  productCategoryValidation.handleValidationErrors,
  productCategoryController.updateProductCategory
);

router.delete(
  '/:id',
  authenticate,
  authorize(['admin']),
  productCategoryValidation.deleteProductCategoryValidation,
  productCategoryValidation.handleValidationErrors,
  productCategoryController.deleteProductCategory
);

export default router;
