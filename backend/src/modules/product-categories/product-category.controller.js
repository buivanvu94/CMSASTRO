import * as productCategoryService from './product-category.service.js';
import {
  successResponse,
  createdResponse,
  paginatedResponse,
  noContentResponse
} from '../../utils/response.js';
import { asyncHandler } from '../../middlewares/errorHandler.js';

export const getProductCategories = asyncHandler(async (req, res) => {
  const { page, limit, search, status, parentId } = req.query;

  const result = await productCategoryService.findAll({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    search,
    status,
    parentId: parentId ? parseInt(parentId) : null
  });

  return paginatedResponse(
    res,
    result.categories,
    result.total,
    result.page,
    result.limit,
    'Product categories retrieved successfully'
  );
});

export const getProductCategoryTree = asyncHandler(async (req, res) => {
  const tree = await productCategoryService.findTree();

  return successResponse(res, tree, 'Product category tree retrieved successfully');
});

export const getProductCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await productCategoryService.findById(parseInt(id));

  return successResponse(res, category, 'Product category retrieved successfully');
});

export const getProductCategoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const category = await productCategoryService.findBySlug(slug);

  return successResponse(res, category, 'Product category retrieved successfully');
});

export const createProductCategory = asyncHandler(async (req, res) => {
  const category = await productCategoryService.create(req.body);

  return createdResponse(res, category, 'Product category created successfully');
});

export const updateProductCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await productCategoryService.update(parseInt(id), req.body);

  return successResponse(res, category, 'Product category updated successfully');
});

export const deleteProductCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await productCategoryService.deleteCategory(parseInt(id));

  return noContentResponse(res);
});

export const reorderProductCategories = asyncHandler(async (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({
      success: false,
      message: 'Items array is required'
    });
  }

  await productCategoryService.reorder(items);

  return successResponse(res, null, 'Product categories reordered successfully');
});

export const getStats = asyncHandler(async (req, res) => {
  const stats = await productCategoryService.getStats();

  return successResponse(res, stats, 'Statistics retrieved successfully');
});

export default {
  getProductCategories,
  getProductCategoryTree,
  getProductCategoryById,
  getProductCategoryBySlug,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
  reorderProductCategories,
  getStats
};
