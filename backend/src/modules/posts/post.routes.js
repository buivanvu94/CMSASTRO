import express from 'express';
import * as postController from './post.controller.js';
import * as postValidation from './post.validation.js';
import { authenticate } from '../../middlewares/auth.js';
import { authorize } from '../../middlewares/authorize.js';

const router = express.Router();

/**
 * Post Routes
 * All routes require authentication
 */

/**
 * GET /posts/stats
 * Get post statistics
 */
router.get(
  '/stats',
  authenticate,
  postController.getStats
);

/**
 * GET /posts/slug/:slug
 * Get post by slug
 */
router.get(
  '/slug/:slug',
  authenticate,
  postValidation.getPostBySlugValidation,
  postValidation.handleValidationErrors,
  postController.getPostBySlug
);

/**
 * GET /posts/public
 * Public list for frontend pages (published posts only)
 */
router.get(
  '/public',
  postValidation.getPostsValidation,
  postValidation.handleValidationErrors,
  postController.getPublicPosts
);

/**
 * GET /posts/public/slug/:slug
 * Public post by slug for frontend pages
 */
router.get(
  '/public/slug/:slug',
  postValidation.getPostBySlugValidation,
  postValidation.handleValidationErrors,
  postController.getPublicPostBySlug
);

/**
 * GET /posts
 * List all posts with role-based filtering
 */
router.get(
  '/',
  authenticate,
  postValidation.getPostsValidation,
  postValidation.handleValidationErrors,
  postController.getPosts
);

/**
 * GET /posts/:id
 * Get post by ID
 */
router.get(
  '/:id',
  authenticate,
  postValidation.getPostByIdValidation,
  postValidation.handleValidationErrors,
  postController.getPostById
);

/**
 * POST /posts
 * Create new post
 */
router.post(
  '/',
  authenticate,
  authorize(['admin', 'editor', 'author']),
  postValidation.createPostValidation,
  postValidation.handleValidationErrors,
  postController.createPost
);

/**
 * PUT /posts/:id/status
 * Update post status
 */
router.put(
  '/:id/status',
  authenticate,
  authorize(['admin', 'editor', 'author']),
  postValidation.updatePostStatusValidation,
  postValidation.handleValidationErrors,
  postController.updatePostStatus
);

/**
 * PUT /posts/:id
 * Update post with ownership check
 */
router.put(
  '/:id',
  authenticate,
  authorize(['admin', 'editor', 'author']),
  postValidation.updatePostValidation,
  postValidation.handleValidationErrors,
  postController.updatePost
);

/**
 * DELETE /posts/:id
 * Delete post with ownership check
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['admin', 'editor', 'author']),
  postValidation.deletePostValidation,
  postValidation.handleValidationErrors,
  postController.deletePost
);

export default router;
