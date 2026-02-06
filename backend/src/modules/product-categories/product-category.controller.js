import * as categoryService from './category.service.js';
import {
  successResponse,
  createdResponse,
  paginatedResponse,
  noContentResponse
} from '../../utils/response.js';
import { asyncHandler } from '../../middlewares/errorHandler.js';

/**
 * Category Controller
 * Handles HTTP requests for category management
 */

/**
 * Get all categories with pagination
 * GET /categories
 */
export const getCategories = asyncHandler(async (req, res) => {
  const { page, limit, search, type, status, parentId } = req.query;

  const result = await categoryService.findAll({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    search,
    type,
    status,
    parentId: parentId ? parseInt(parentId) : null
  });

  return paginatedResponse(
    res,
    result.categories,
    result.total,
    result.page,
    result.limit,
    'Categories retrieved successfully'
  );
});

/**
 * Get categories in tree structure
 * GET /categories/tree
 */
export const getCategoryTree = asyncHandler(async (req, res) => {
  const { type } = req.query;
  const tree = await categoryService.findTree(type);

  return successResponse(res, tree, 'Category tree retrieved successfully');
});

/**
 * Get category by ID
 * GET /categories/:id
 */
export const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await categoryService.findById(parseInt(id));

  return successResponse(res, category, 'Category retrieved successfully');
});

/**
 * Get category by slug
 * GET /categories/slug/:slug
 */
export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const category = await categoryService.findBySlug(slug);

  return successResponse(res, category, 'Category retrieved successfully');
});

/**
 * Create new category
 * POST /categories
 */
export const createCategory = asyncHandler(async (req, res) => {
  const data = req.body;
  const category = await categoryService.create(data);

  return createdResponse(res, category, 'Category created successfully');
});

/**
 * Update category
 * PUT /categories/:id
 */
export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const category = await categoryService.update(parseInt(id), data);

  return successResponse(res, category, 'Category updated successfully');
});

/**
 * Delete category
 * DELETE /categories/:id
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await categoryService.deleteCategory(parseInt(id));

  return noContentResponse(res);
});

/**
 * Reorder categories
 * PUT /categories/reorder
 */
export const reorderCategories = asyncHandler(async (req, res) => {
  const { items } = req.body;
  
  if (!items || !Array.isArray(items)) {
    return res.status(400).json({
      success: false,
      message: 'Items array is required'
    });
  }

  await categoryService.reorder(items);

  return successResponse(res, null, 'Categories reordered successfully');
});

/**
 * Get category statistics
 * GET /categories/stats
 */
export const getStats = asyncHandler(async (req, res) => {
  const stats = await categoryService.getStats();

  return successResponse(res, stats, 'Statistics retrieved successfully');
});

export default {
  getCategories,
  getCategoryTree,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  getStats
};
