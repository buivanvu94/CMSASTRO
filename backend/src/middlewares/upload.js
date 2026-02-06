import multer from 'multer';
import path from 'path';
import { config } from '../config/index.js';
import { ValidationError } from './errorHandler.js';

/**
 * File Upload Middleware using Multer
 */

/**
 * Allowed file types
 */
const ALLOWED_MIME_TYPES = config.upload.allowedTypes;

/**
 * Maximum file size (10MB)
 */
const MAX_FILE_SIZE = config.upload.maxSize;

/**
 * File filter function
 * Validates file type based on MIME type
 */
const fileFilter = (req, file, cb) => {
  // Check if MIME type is allowed
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationError(
      `File type ${file.mimetype} is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
    ), false);
  }
};

/**
 * Multer configuration with memory storage
 * Files are stored in memory as Buffer objects
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: fileFilter
});

/**
 * Middleware for single file upload
 * @param {string} fieldName - Name of the form field
 */
export const uploadSingle = (fieldName = 'file') => {
  return upload.single(fieldName);
};

/**
 * Middleware for multiple file upload
 * @param {string} fieldName - Name of the form field
 * @param {number} maxCount - Maximum number of files
 */
export const uploadMultiple = (fieldName = 'files', maxCount = 10) => {
  return upload.array(fieldName, maxCount);
};

/**
 * Middleware for multiple fields with files
 * @param {Array} fields - Array of field configurations
 */
export const uploadFields = (fields) => {
  return upload.fields(fields);
};

/**
 * Validate uploaded file
 * @param {Object} file - Multer file object
 * @throws {ValidationError} - If file is invalid
 */
export const validateFile = (file) => {
  if (!file) {
    throw new ValidationError('No file uploaded');
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new ValidationError(
      `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`
    );
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new ValidationError(
      `File type ${file.mimetype} is not allowed`
    );
  }

  return true;
};

/**
 * Validate multiple uploaded files
 * @param {Array} files - Array of Multer file objects
 * @throws {ValidationError} - If any file is invalid
 */
export const validateFiles = (files) => {
  if (!files || files.length === 0) {
    throw new ValidationError('No files uploaded');
  }

  files.forEach((file, index) => {
    try {
      validateFile(file);
    } catch (error) {
      throw new ValidationError(`File ${index + 1}: ${error.message}`);
    }
  });

  return true;
};

/**
 * Get file extension from filename
 * @param {string} filename - Original filename
 * @returns {string} - File extension
 */
export const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase();
};

/**
 * Check if file is an image
 * @param {string} mimetype - File MIME type
 * @returns {boolean}
 */
export const isImage = (mimetype) => {
  return mimetype.startsWith('image/');
};

/**
 * Generate unique filename
 * @param {string} originalName - Original filename
 * @returns {string} - Unique filename
 */
export const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const ext = getFileExtension(originalName);
  const nameWithoutExt = path.basename(originalName, ext);
  
  // Sanitize filename: remove special characters, replace spaces with hyphens
  const sanitized = nameWithoutExt
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  return `${sanitized}-${timestamp}-${random}${ext}`;
};

/**
 * Get upload directory path based on date
 * @returns {string} - Directory path (e.g., "uploads/2024/01")
 */
export const getUploadDirectory = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  return `${config.upload.dir}/${year}/${month}`;
};

export default {
  uploadSingle,
  uploadMultiple,
  uploadFields,
  validateFile,
  validateFiles,
  getFileExtension,
  isImage,
  generateUniqueFilename,
  getUploadDirectory
};
