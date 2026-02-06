import * as mediaService from './media.service.js';
import { successResponse, createdResponse, paginatedResponse, noContentResponse } from '../../utils/response.js';
import { asyncHandler } from '../../middlewares/errorHandler.js';
import { validateFile, validateFiles } from '../../middlewares/upload.js';

/**
 * Media Controller
 * Handles HTTP requests for media management
 */

/**
 * Get all media with pagination
 * GET /media
 */
export const getMedia = asyncHandler(async (req, res) => {
  const { page, limit, search, folder, mimeType } = req.query;

  const result = await mediaService.findAll({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    search,
    folder,
    mimeType
  });

  return paginatedResponse(
    res,
    result.media,
    result.total,
    result.page,
    result.limit,
    'Media retrieved successfully'
  );
});

/**
 * Get media by ID
 * GET /media/:id
 */
export const getMediaById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const media = await mediaService.findById(parseInt(id));

  return successResponse(res, media, 'Media retrieved successfully');
});

/**
 * Upload single file
 * POST /media/upload
 */
export const uploadSingle = asyncHandler(async (req, res) => {
  const file = req.file;
  const { folder } = req.body;
  
  // Validate file
  validateFile(file);
  
  // Upload file
  const media = await mediaService.upload(file, req.user.id, folder);

  return createdResponse(res, media, 'File uploaded successfully');
});

/**
 * Upload multiple files
 * POST /media/upload/multiple
 */
export const uploadMultiple = asyncHandler(async (req, res) => {
  const files = req.files;
  const { folder } = req.body;
  
  // Validate files
  validateFiles(files);
  
  // Upload files
  const media = await mediaService.uploadMultiple(files, req.user.id, folder);

  return createdResponse(res, media, 'Files uploaded successfully');
});

/**
 * Update media metadata
 * PUT /media/:id
 */
export const updateMedia = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const media = await mediaService.update(parseInt(id), data);

  return successResponse(res, media, 'Media updated successfully');
});

/**
 * Delete media
 * DELETE /media/:id
 */
export const deleteMedia = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await mediaService.deleteMedia(parseInt(id));

  return noContentResponse(res);
});

/**
 * Bulk delete media
 * DELETE /media/bulk
 */
export const bulkDelete = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'IDs array is required'
    });
  }

  await mediaService.deleteMultiple(ids.map(id => parseInt(id)));

  return successResponse(res, null, 'Media deleted successfully');
});

/**
 * Get folders
 * GET /media/folders
 */
export const getFolders = asyncHandler(async (req, res) => {
  const folders = await mediaService.getFolders();

  return successResponse(res, folders, 'Folders retrieved successfully');
});

/**
 * Get media statistics
 * GET /media/stats
 */
export const getStats = asyncHandler(async (req, res) => {
  const stats = await mediaService.getStats();

  return successResponse(res, stats, 'Statistics retrieved successfully');
});

export default {
  getMedia,
  getMediaById,
  uploadSingle,
  uploadMultiple,
  updateMedia,
  deleteMedia,
  bulkDelete,
  getFolders,
  getStats
};
