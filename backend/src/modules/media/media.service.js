import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { Op } from 'sequelize';
import Media from './media.model.js';
import { NotFoundError } from '../../middlewares/errorHandler.js';
import { 
  generateUniqueFilename, 
  getUploadDirectory, 
  isImage 
} from '../../middlewares/upload.js';

/**
 * Media Service
 * Business logic for media management
 */

/**
 * Ensure directory exists, create if not
 * @param {string} dirPath - Directory path
 */
const ensureDirectoryExists = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

/**
 * Generate thumbnail for image
 * @param {Buffer} buffer - Image buffer
 * @param {string} outputPath - Output path for thumbnail
 * @param {number} size - Thumbnail size (default 300x300)
 */
const generateThumbnail = async (buffer, outputPath, size = 300) => {
  await sharp(buffer)
    .resize(size, size, {
      fit: 'cover',
      position: 'center'
    })
    .jpeg({ quality: 80 })
    .toFile(outputPath);
};

/**
 * Upload single file
 * @param {Object} file - Multer file object
 * @param {number} userId - ID of user uploading the file
 * @param {string} folder - Folder to organize file
 * @returns {Promise<Object>} - Created media record
 */
export const upload = async (file, userId, folder = 'general') => {
  // Generate unique filename
  const filename = generateUniqueFilename(file.originalname);
  
  // Get upload directory (year/month structure)
  const uploadDir = getUploadDirectory();
  await ensureDirectoryExists(uploadDir);
  
  // Full file path
  const filePath = path.join(uploadDir, filename);
  
  // Save file to disk
  await fs.writeFile(filePath, file.buffer);
  
  // Generate thumbnail if image
  let thumbnailPath = null;
  if (isImage(file.mimetype)) {
    const thumbnailFilename = `thumb-${filename}`;
    thumbnailPath = path.join(uploadDir, thumbnailFilename);
    await generateThumbnail(file.buffer, thumbnailPath);
  }
  
  // Create media record
  const media = await Media.create({
    uploaded_by: userId,
    filename,
    original_name: file.originalname,
    mime_type: file.mimetype,
    size: file.size,
    path: filePath.replace(/\\/g, '/'), // Normalize path for Windows
    thumbnail_path: thumbnailPath ? thumbnailPath.replace(/\\/g, '/') : null,
    folder
  });
  
  return media;
};

/**
 * Upload multiple files
 * @param {Array} files - Array of Multer file objects
 * @param {number} userId - ID of user uploading the files
 * @param {string} folder - Folder to organize files
 * @returns {Promise<Array>} - Array of created media records
 */
export const uploadMultiple = async (files, userId, folder = 'general') => {
  const uploadPromises = files.map(file => upload(file, userId, folder));
  return Promise.all(uploadPromises);
};

/**
 * Find all media with pagination and filtering
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Media and pagination info
 */
export const findAll = async ({ 
  page = 1, 
  limit = 20, 
  search = '', 
  folder = null,
  mimeType = null 
} = {}) => {
  const offset = (page - 1) * limit;
  
  // Build where clause
  const where = {};
  
  if (search) {
    where[Op.or] = [
      { filename: { [Op.like]: `%${search}%` } },
      { original_name: { [Op.like]: `%${search}%` } },
      { alt_text: { [Op.like]: `%${search}%` } }
    ];
  }
  
  if (folder) {
    where.folder = folder;
  }
  
  if (mimeType) {
    where.mime_type = { [Op.like]: `${mimeType}%` };
  }

  const { count, rows } = await Media.findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']],
    include: [
      {
        association: 'uploader',
        attributes: ['id', 'full_name', 'email']
      }
    ]
  });

  return {
    media: rows,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit)
  };
};

/**
 * Find media by ID
 * @param {number} id - Media ID
 * @returns {Promise<Object>} - Media object
 * @throws {NotFoundError} - If media not found
 */
export const findById = async (id) => {
  const media = await Media.findByPk(id, {
    include: [
      {
        association: 'uploader',
        attributes: ['id', 'full_name', 'email']
      }
    ]
  });

  if (!media) {
    throw new NotFoundError('Media not found');
  }

  return media;
};

/**
 * Update media metadata
 * @param {number} id - Media ID
 * @param {Object} data - Update data (alt_text, caption, folder)
 * @returns {Promise<Object>} - Updated media
 */
export const update = async (id, data) => {
  const media = await findById(id);
  
  // Only allow updating metadata fields
  const allowedFields = ['alt_text', 'caption', 'folder'];
  const updateData = {};
  
  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  });
  
  await media.update(updateData);
  
  return media;
};

/**
 * Delete media file and record
 * @param {number} id - Media ID
 * @returns {Promise<void>}
 */
export const deleteMedia = async (id) => {
  const media = await findById(id);
  
  // Delete files from disk
  try {
    await fs.unlink(media.path);
    
    if (media.thumbnail_path) {
      await fs.unlink(media.thumbnail_path);
    }
  } catch (error) {
    console.error('Error deleting files:', error);
    // Continue with database deletion even if file deletion fails
  }
  
  // Delete database record
  await media.destroy();
};

/**
 * Delete multiple media files
 * @param {Array} ids - Array of media IDs
 * @returns {Promise<void>}
 */
export const deleteMultiple = async (ids) => {
  const deletePromises = ids.map(id => deleteMedia(id));
  await Promise.all(deletePromises);
};

/**
 * Get list of folders
 * @returns {Promise<Array>} - Array of folder names with counts
 */
export const getFolders = async () => {
  const folders = await Media.findAll({
    attributes: [
      'folder',
      [Media.sequelize.fn('COUNT', Media.sequelize.col('id')), 'count']
    ],
    group: ['folder'],
    order: [['folder', 'ASC']]
  });

  return folders.map(f => ({
    name: f.folder,
    count: parseInt(f.get('count'))
  }));
};

/**
 * Get media statistics
 * @returns {Promise<Object>} - Statistics
 */
export const getStats = async () => {
  const total = await Media.count();
  
  const byType = await Media.findAll({
    attributes: [
      'mime_type',
      [Media.sequelize.fn('COUNT', Media.sequelize.col('id')), 'count']
    ],
    group: ['mime_type']
  });
  
  const totalSize = await Media.sum('size');
  
  return {
    total,
    byType: byType.map(t => ({
      type: t.mime_type,
      count: parseInt(t.get('count'))
    })),
    totalSize
  };
};

export default {
  upload,
  uploadMultiple,
  findAll,
  findById,
  update,
  deleteMedia,
  deleteMultiple,
  getFolders,
  getStats
};
