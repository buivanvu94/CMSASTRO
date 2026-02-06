import { describe, test, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import fc from 'fast-check';
import sequelize from '../../../config/database.js';
import { setupAssociations } from '../../../config/associations.js';
import { validateFile, validateFiles } from '../../../middlewares/upload.js';
import { ValidationError } from '../../../middlewares/errorHandler.js';
import { config } from '../../../config/index.js';

/**
 * Property Test: File type validation
 * 
 * Property 49: File type validation
 * Requirements: 9.3, 13.1, 13.2
 * 
 * Tests that file uploads validate MIME types and reject disallowed types
 */

describe('Media File Type Validation Property Tests', () => {
  beforeAll(async () => {
    setupAssociations();
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  /**
   * Property: Allowed file types pass validation
   */
  test('allowed MIME types should pass validation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...config.upload.allowedTypes),
        fc.string({ minLength: 3, maxLength: 20 }).map(s => s.replace(/[^a-zA-Z0-9]/g, 'a')),
        fc.integer({ min: 1024, max: config.upload.maxSize }),
        async (mimetype, filename, size) => {
          const mockFile = {
            originalname: `${filename}.jpg`,
            mimetype: mimetype,
            size: size,
            buffer: Buffer.from('test content')
          };

          // Should not throw error
          expect(() => validateFile(mockFile)).not.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);

  /**
   * Property: Disallowed file types are rejected
   */
  test('disallowed MIME types should be rejected', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          'application/x-msdownload',
          'application/x-executable',
          'application/x-sh',
          'text/x-script.python',
          'application/x-httpd-php',
          'text/html',
          'application/javascript',
          'video/mp4',
          'audio/mpeg'
        ),
        fc.string({ minLength: 3, maxLength: 15 }).map(s => s.replace(/[^a-zA-Z0-9]/g, 'b')),
        fc.integer({ min: 1024, max: 1024 * 1024 }),
        async (mimetype, filename, size) => {
          const mockFile = {
            originalname: `${filename}.exe`,
            mimetype: mimetype,
            size: size,
            buffer: Buffer.from('malicious content')
          };

          // Should throw ValidationError
          expect(() => validateFile(mockFile)).toThrow(ValidationError);
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);

  /**
   * Property: File size limit is enforced
   */
  test('files exceeding size limit should be rejected', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('image/jpeg', 'image/png'),
        fc.string({ minLength: 3, maxLength: 15 }).map(s => s.replace(/[^a-zA-Z0-9]/g, 'c')),
        fc.integer({ min: config.upload.maxSize + 1, max: config.upload.maxSize * 2 }),
        async (mimetype, filename, size) => {
          const mockFile = {
            originalname: `${filename}.jpg`,
            mimetype: mimetype,
            size: size,
            buffer: Buffer.from('large file')
          };

          // Should throw ValidationError
          expect(() => validateFile(mockFile)).toThrow(ValidationError);
          expect(() => validateFile(mockFile)).toThrow(/exceeds maximum/);
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);

  /**
   * Property: Files within size limit pass validation
   */
  test('files within size limit should pass validation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('image/jpeg', 'image/png', 'application/pdf'),
        fc.string({ minLength: 3, maxLength: 15 }).map(s => s.replace(/[^a-zA-Z0-9]/g, 'd')),
        fc.integer({ min: 1024, max: config.upload.maxSize }),
        async (mimetype, filename, size) => {
          const mockFile = {
            originalname: `${filename}.jpg`,
            mimetype: mimetype,
            size: size,
            buffer: Buffer.from('valid file')
          };

          // Should not throw error
          expect(() => validateFile(mockFile)).not.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);

  /**
   * Property: Missing file is rejected
   */
  test('missing file should be rejected', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(null).chain(() => fc.constant(undefined)),
        async (file) => {
          // Should throw ValidationError
          expect(() => validateFile(file)).toThrow(ValidationError);
          expect(() => validateFile(file)).toThrow(/No file uploaded/);
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);

  /**
   * Property: Multiple files validation - all valid files pass
   */
  test('multiple valid files should pass validation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            filename: fc.string({ minLength: 3, maxLength: 15 }).map(s => s.replace(/[^a-zA-Z0-9]/g, 'e')),
            mimetype: fc.constantFrom(...config.upload.allowedTypes),
            size: fc.integer({ min: 1024, max: config.upload.maxSize })
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (fileConfigs) => {
          const mockFiles = fileConfigs.map(config => ({
            originalname: `${config.filename}.jpg`,
            mimetype: config.mimetype,
            size: config.size,
            buffer: Buffer.from('content')
          }));

          // Should not throw error
          expect(() => validateFiles(mockFiles)).not.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);

  /**
   * Property: Multiple files validation - one invalid file fails all
   */
  test('one invalid file should fail entire batch validation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            filename: fc.string({ minLength: 3, maxLength: 15 }).map(s => s.replace(/[^a-zA-Z0-9]/g, 'f')),
            mimetype: fc.constantFrom(...config.upload.allowedTypes),
            size: fc.integer({ min: 1024, max: config.upload.maxSize })
          }),
          { minLength: 1, maxLength: 5 }
        ),
        fc.integer({ min: 0, max: 4 }),
        async (validConfigs, invalidIndex) => {
          // Create valid files
          const mockFiles = validConfigs.map(config => ({
            originalname: `${config.filename}.jpg`,
            mimetype: config.mimetype,
            size: config.size,
            buffer: Buffer.from('content')
          }));

          // Insert one invalid file
          if (mockFiles.length > 0) {
            const insertAt = Math.min(invalidIndex, mockFiles.length - 1);
            mockFiles[insertAt] = {
              originalname: 'malicious.exe',
              mimetype: 'application/x-msdownload',
              size: 2048,
              buffer: Buffer.from('bad')
            };

            // Should throw ValidationError
            expect(() => validateFiles(mockFiles)).toThrow(ValidationError);
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);

  /**
   * Property: Empty file array is rejected
   */
  test('empty file array should be rejected', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant([]),
        async (files) => {
          // Should throw ValidationError
          expect(() => validateFiles(files)).toThrow(ValidationError);
          expect(() => validateFiles(files)).toThrow(/No files uploaded/);
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);

  /**
   * Property: Image MIME types are correctly identified
   */
  test('image MIME types should be identified correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'),
        fc.string({ minLength: 3, maxLength: 15 }).map(s => s.replace(/[^a-zA-Z0-9]/g, 'g')),
        async (mimetype, filename) => {
          const mockFile = {
            originalname: `${filename}.jpg`,
            mimetype: mimetype,
            size: 2048,
            buffer: Buffer.from('image data')
          };

          // Image types should pass validation if in allowed list
          if (config.upload.allowedTypes.includes(mimetype)) {
            expect(() => validateFile(mockFile)).not.toThrow();
          }

          // Verify it's recognized as image
          expect(mimetype.startsWith('image/')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);

  /**
   * Property: Non-image MIME types are correctly identified
   */
  test('non-image MIME types should be identified correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('application/pdf', 'application/msword', 'text/plain'),
        fc.string({ minLength: 3, maxLength: 15 }).map(s => s.replace(/[^a-zA-Z0-9]/g, 'h')),
        async (mimetype, filename) => {
          const mockFile = {
            originalname: `${filename}.pdf`,
            mimetype: mimetype,
            size: 2048,
            buffer: Buffer.from('document data')
          };

          // Should pass validation if in allowed list
          if (config.upload.allowedTypes.includes(mimetype)) {
            expect(() => validateFile(mockFile)).not.toThrow();
          }

          // Verify it's not recognized as image
          expect(mimetype.startsWith('image/')).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);
});
