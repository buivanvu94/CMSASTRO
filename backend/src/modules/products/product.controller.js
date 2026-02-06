import * as productService from './product.service.js';
import {
  successResponse,
  createdResponse,
  paginatedResponse,
  noContentResponse
} from '../../utils/response.js';
import { asyncHandler } from '../../middlewares/errorHandler.js';

/**
 * Product Controller
 * Handles HTTP requests for product management
 */

/**
 * Get all products
 * GET /products
 */
export const getProducts = asyncHandler(async (req, res) => {
  const { page, limit, search, productCategoryId, categoryId, status, isFeatured } = req.query;

  const result = await productService.findAll({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    search,
    productCategoryId: productCategoryId
      ? parseInt(productCategoryId)
      : (categoryId ? parseInt(categoryId) : null),
    status,
    isFeatured: isFeatured !== undefined ? isFeatured === 'true' : null
  });

  return paginatedResponse(
    res,
    result.products,
    result.total,
    result.page,
    result.limit,
    'Products retrieved successfully'
  );
});

/**
 * Get public products for website pages
 * GET /products/public
 */
export const getPublicProducts = asyncHandler(async (req, res) => {
  const { page, limit, search, productCategoryId, categoryId, isFeatured } = req.query;

  const result = await productService.findAll({
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 12,
    search,
    productCategoryId: productCategoryId
      ? parseInt(productCategoryId, 10)
      : (categoryId ? parseInt(categoryId, 10) : null),
    status: 'published',
    isFeatured: isFeatured !== undefined ? isFeatured === 'true' : null
  });

  return paginatedResponse(
    res,
    result.products,
    result.total,
    result.page,
    result.limit,
    'Public products retrieved successfully'
  );
});

/**
 * Get product by ID
 * GET /products/:id
 */
export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await productService.findById(parseInt(id));

  return successResponse(res, product, 'Product retrieved successfully');
});

/**
 * Get product by slug
 * GET /products/slug/:slug
 */
export const getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const product = await productService.findBySlug(slug);

  return successResponse(res, product, 'Product retrieved successfully');
});

/**
 * Create new product with prices
 * POST /products
 */
export const createProduct = asyncHandler(async (req, res) => {
  const { prices, ...productData } = req.body;
  const product = await productService.create(productData, prices);

  return createdResponse(res, product, 'Product created successfully');
});

/**
 * Update product
 * PUT /products/:id
 */
export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { prices, ...data } = req.body;

  const product = await productService.update(parseInt(id, 10), data, prices);

  return successResponse(res, product, 'Product updated successfully');
});

/**
 * Delete product
 * DELETE /products/:id
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await productService.deleteProduct(parseInt(id));

  return noContentResponse(res);
});

/**
 * Add price variant to product
 * POST /products/:id/prices
 */
export const addPriceVariant = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const priceData = req.body;

  const price = await productService.addPriceVariant(parseInt(id), priceData);

  return createdResponse(res, price, 'Price variant added successfully');
});

/**
 * Update price variant
 * PUT /products/:id/prices/:priceId
 */
export const updatePriceVariant = asyncHandler(async (req, res) => {
  const { id, priceId } = req.params;
  const priceData = req.body;

  const price = await productService.updatePriceVariant(
    parseInt(id),
    parseInt(priceId),
    priceData
  );

  return successResponse(res, price, 'Price variant updated successfully');
});

/**
 * Delete price variant
 * DELETE /products/:id/prices/:priceId
 */
export const deletePriceVariant = asyncHandler(async (req, res) => {
  const { id, priceId } = req.params;

  await productService.deletePriceVariant(parseInt(id), parseInt(priceId));

  return noContentResponse(res);
});

/**
 * Get product statistics
 * GET /products/stats
 */
export const getStats = asyncHandler(async (req, res) => {
  const stats = await productService.getStats();

  return successResponse(res, stats, 'Statistics retrieved successfully');
});

export default {
  getProducts,
  getPublicProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  addPriceVariant,
  updatePriceVariant,
  deletePriceVariant,
  getStats
};
