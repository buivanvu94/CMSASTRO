import express from 'express';
import * as mediaController from './media.controller.js';
import * as mediaValidation from './media.validation.js';
import { authenticate } from '../../middlewares/auth.js';
import { uploadSingle as uploadSingleMiddleware, uploadMultiple as uploadMultipleMiddleware } from '../../middlewares/upload.js';

const router = express.Router();

/**
 * Media Routes
 * All routes require authentication
 */

/**
 * GET /media/stats
 * Get media statistics
 */
router.get(
  '/stats',
  authenticate,
  mediaController.getStats
);

/**
 * GET /media/folders
 * Get list of folders
 */
router.get(
  '/folders',
  authenticate,
  mediaController.getFolders
);

/**
 * GET /media
 * List all media with pagination and filters
 */
router.get(
  '/',
  authenticate,
  mediaValidation.getMediaValidation,
  mediaValidation.handleValidationErrors,
  mediaController.getMedia
);

/**
 * GET /media/:id
 * Get media by ID
 */
router.get(
  '/:id',
  authenticate,
  mediaValidation.getMediaByIdValidation,
  mediaValidation.handleValidationErrors,
  mediaController.getMediaById
);

/**
 * POST /media/upload
 * Upload single file
 */
router.post(
  '/upload',
  authenticate,
  uploadSingleMiddleware('file'),
  mediaValidation.uploadValidation,
  mediaValidation.handleValidationErrors,
  mediaController.uploadSingle
);

/**
 * POST /media/upload/multiple
 * Upload multiple files
 */
router.post(
  '/upload/multiple',
  authenticate,
  uploadMultipleMiddleware('files', 10),
  mediaValidation.uploadValidation,
  mediaValidation.handleValidationErrors,
  mediaController.uploadMultiple
);

/**
 * PUT /media/:id
 * Update media metadata
 */
router.put(
  '/:id',
  authenticate,
  mediaValidation.updateMediaValidation,
  mediaValidation.handleValidationErrors,
  mediaController.updateMedia
);

/**
 * DELETE /media/bulk
 * Bulk delete media
 */
router.delete(
  '/bulk',
  authenticate,
  mediaValidation.bulkDeleteValidation,
  mediaValidation.handleValidationErrors,
  mediaController.bulkDelete
);

/**
 * DELETE /media/:id
 * Delete media
 */
router.delete(
  '/:id',
  authenticate,
  mediaValidation.deleteMediaValidation,
  mediaValidation.handleValidationErrors,
  mediaController.deleteMedia
);

export default router;
