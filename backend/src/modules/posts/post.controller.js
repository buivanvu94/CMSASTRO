import * as postService from './post.service.js';
import {
  successResponse,
  createdResponse,
  paginatedResponse,
  noContentResponse
} from '../../utils/response.js';
import { asyncHandler } from '../../middlewares/errorHandler.js';

/**
 * Post Controller
 * Handles HTTP requests for post management
 */

/**
 * Get all posts with role-based filtering
 * GET /posts
 */
export const getPosts = asyncHandler(async (req, res) => {
  const { page, limit, search, categoryId, status, isFeatured, authorId } = req.query;

  const result = await postService.findAll({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    search,
    categoryId: categoryId ? parseInt(categoryId) : null,
    status,
    isFeatured: isFeatured !== undefined ? isFeatured === 'true' : null,
    authorId: authorId ? parseInt(authorId) : null
  }, req.user);

  return paginatedResponse(
    res,
    result.posts,
    result.total,
    result.page,
    result.limit,
    'Posts retrieved successfully'
  );
});

/**
 * Get post by ID
 * GET /posts/:id
 */
export const getPostById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await postService.findById(parseInt(id));

  return successResponse(res, post, 'Post retrieved successfully');
});

/**
 * Get post by slug
 * GET /posts/slug/:slug
 */
export const getPostBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const post = await postService.findBySlug(slug);

  return successResponse(res, post, 'Post retrieved successfully');
});

/**
 * Create new post
 * POST /posts
 */
export const createPost = asyncHandler(async (req, res) => {
  const data = req.body;
  const post = await postService.create(data, req.user.id);

  return createdResponse(res, post, 'Post created successfully');
});

/**
 * Update post with ownership check
 * PUT /posts/:id
 */
export const updatePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const post = await postService.update(parseInt(id), data, req.user);

  return successResponse(res, post, 'Post updated successfully');
});

/**
 * Delete post with ownership check
 * DELETE /posts/:id
 */
export const deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await postService.deletePost(parseInt(id), req.user);

  return noContentResponse(res);
});

/**
 * Update post status
 * PUT /posts/:id/status
 */
export const updatePostStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const post = await postService.updateStatus(parseInt(id), status, req.user);

  return successResponse(res, post, 'Post status updated successfully');
});

/**
 * Get post statistics
 * GET /posts/stats
 */
export const getStats = asyncHandler(async (req, res) => {
  const stats = await postService.getStats();

  return successResponse(res, stats, 'Statistics retrieved successfully');
});

export default {
  getPosts,
  getPostById,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  updatePostStatus,
  getStats
};
