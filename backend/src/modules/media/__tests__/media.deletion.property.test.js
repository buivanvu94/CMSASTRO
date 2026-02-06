import { describe, test, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import fc from 'fast-check';
import sequelize from '../../../config/database.js';
import { setupAssociations } from '../../../config/associations.js';
import * as mediaService from '../media.service.js';
import User from '../../users/user.model.js';
import Media from '../media.model.js';
import fs from 'fs/promises';

/**
 * Property Test: Media deletion removes files
 * 
 * Property 51: Media deletion removes files
 * Requirements: 9.6
 * 
 * Tests that deleting media records also removes physical files from disk
 */

describe('Media Deletion Property Tests', () => {
  let testUser;

  beforeAll(async () => {
    setupAssociations();
    await sequelize.sync({ force: true });

    // Create test user
    testUser = await User.create({
      full_name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword123',
      role: 'admin',
      status: 'active'
    });
  });

  beforeEach(async () => {
    await Media.destroy({ where: {}, truncate: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  /**
   * Property: Deleting media removes the original file
   */
  test('deleting media should remove original file from disk', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 3, maxLength: 20 }).map(s => s.replace(/[^a-zA-Z0-9]/g, 'a')),
        fc.constantFrom('image/jpeg', 'image/png', 'application/pdf'),
        fc.integer({ min: 1024, max: 1024 * 100 }),
        async (filename, mimetype, size) => {
          // Create and upload file
          const mockFile = {
            originalname: `${filename}.jpg`,
            mimetype: mimetype,
            size: size,
            buffer: Buffer.from('test file content')
          };

          const media = await mediaService.upload(mockFile, testUser.id, 'test-delete');

          // Verify file exists
          const fileExistsBefore = await fs.access(media.path)
            .then(() => true)
            .catch(() => false);
          expect(fileExistsBefore).toBe(true);

          // Delete media
          await mediaService.deleteMedia(media.id);

          // Verify file is removed
          const fileExistsAfter = await fs.access(media.path)
            .then(() => true)
            .catch(() => false);
          expect(fileExistsAfter).toBe(false);

          // Verify database record is removed
          const dbRecord = await Media.findByPk(media.id);
          expect(dbRecord).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);

  /**
   * Property: Deleting image media removes both original and thumbnail
   */
  test('deleting image media should remove both original and thumbnail', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 3, maxLength: 20 }).map(s => s.replace(/[^a-zA-Z0-9]/g, 'b')),
        fc.constantFrom('image/jpeg', 'image/png', 'image/gif'),
        fc.integer({ min: 2048, max: 1024 * 100 }),
        async (filename, mimetype, size) => {
          // Create and upload image file
          const mockFile = {
            originalname: `${filename}.jpg`,
            mimetype: mimetype,
            size: size,
            buffer: Buffer.from('image file content')
          };

          const media = await mediaService.upload(mockFile, testUser.id, 'test-thumb-delete');

          // Verify both files exist
          const originalExists = await fs.access(media.path)
            .then(() => true)
            .catch(() => false);
          expect(originalExists).toBe(true);

          if (media.thumbnail_path) {
            const thumbExists = await fs.access(media.thumbnail_path)
              .then(() => true)
              .catch(() => false);
            expect(thumbExists).toBe(true);
          }

          // Delete media
          await mediaService.deleteMedia(media.id);

          // Verify both files are removed
          const originalExistsAfter = await fs.access(media.path)
            .then(() => true)
            .catch(() => false);
          expect(originalExistsAfter).toBe(false);

          if (media.thumbnail_path) {
            const thumbExistsAfter = await fs.access(media.thumbnail_path)
              .then(() => true)
              .catch(() => false);
            expect(thumbExistsAfter).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);

  /**
   * Property: Bulk deletion removes all specified files
   */
  test('bulk deletion should remove all specified media files', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            filename: fc.string({ minLength: 3, maxLength: 15 }).map(s => s.replace(/[^a-zA-Z0-9]/g, 'c')),
            mimetype: fc.constantFrom('image/jpeg', 'image/png', 'application/pdf'),
            size: fc.integer({ min: 1024, max: 1024 * 50 })
          }),
          { minLength: 2, maxLength: 5 }
        ),
        async (fileConfigs) => {
          // Upload multiple files
          const uploadedMedia = [];
          for (const config of fileConfigs) {
            const mockFile = {
              originalname: `${config.filename}.jpg`,
              mimetype: config.mimetype,
              size: config.size,
              buffer: Buffer.from('content')
            };

            const media = await mediaService.upload(mockFile, testUser.id, 'bulk-delete');
            uploadedMedia.push(media);
          }

          // Verify all files exist
          for (const media of uploadedMedia) {
            const exists = await fs.access(media.path)
              .then(() => true)
              .catch(() => false);
            expect(exists).toBe(true);
          }

          // Bulk delete
          const ids = uploadedMedia.map(m => m.id);
          await mediaService.deleteMultiple(ids);

          // Verify all files are removed
          for (const media of uploadedMedia) {
            const existsAfter = await fs.access(media.path)
              .then(() => true)
              .catch(() => false);
            expect(existsAfter).toBe(false);

            // Verify database record is removed
            const dbRecord = await Media.findByPk(media.id);
            expect(dbRecord).toBeNull();
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);

  /**
   * Property: Deleting non-existent media throws error
   */
  test('deleting non-existent media should throw error', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 99999, max: 999999 }),
        async (nonExistentId) => {
          // Attempt to delete non-existent media
          await expect(mediaService.deleteMedia(nonExistentId)).rejects.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);

  /**
   * Property: Database record is removed even if file deletion fails
   */
  test('database record should be removed even if file is already missing', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 3, maxLength: 20 }).map(s => s.replace(/[^a-zA-Z0-9]/g, 'd')),
        fc.constantFrom('image/jpeg', 'application/pdf'),
        async (filename, mimetype) => {
          // Create and upload file
          const mockFile = {
            originalname: `${filename}.jpg`,
            mimetype: mimetype,
            size: 2048,
            buffer: Buffer.from('content')
          };

          const media = await mediaService.upload(mockFile, testUser.id, 'missing-file');

          // Manually delete the file (simulate missing file)
          try {
            await fs.unlink(media.path);
            if (media.thumbnail_path) {
              await fs.unlink(media.thumbnail_path);
            }
          } catch (error) {
            // Ignore if already deleted
          }

          // Delete media (file is already gone)
          await mediaService.deleteMedia(media.id);

          // Verify database record is still removed
          const dbRecord = await Media.findByPk(media.id);
          expect(dbRecord).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);

  /**
   * Property: Deleting media with same filename doesn't affect other files
   */
  test('deleting one media should not affect other media files', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            filename: fc.string({ minLength: 3, maxLength: 15 }).map(s => s.replace(/[^a-zA-Z0-9]/g, 'e')),
            mimetype: fc.constantFrom('image/jpeg', 'image/png'),
            size: fc.integer({ min: 1024, max: 1024 * 50 })
          }),
          { minLength: 3, maxLength: 5 }
        ),
        fc.integer({ min: 0, max: 2 }),
        async (fileConfigs, deleteIndex) => {
          // Upload multiple files
          const uploadedMedia = [];
          for (const config of fileConfigs) {
            const mockFile = {
              originalname: `${config.filename}.jpg`,
              mimetype: config.mimetype,
              size: config.size,
              buffer: Buffer.from('content')
            };

            const media = await mediaService.upload(mockFile, testUser.id, 'selective-delete');
            uploadedMedia.push(media);
          }

          // Delete one file
          const indexToDelete = Math.min(deleteIndex, uploadedMedia.length - 1);
          const mediaToDelete = uploadedMedia[indexToDelete];
          await mediaService.deleteMedia(mediaToDelete.id);

          // Verify deleted file is gone
          const deletedExists = await fs.access(mediaToDelete.path)
            .then(() => true)
            .catch(() => false);
          expect(deletedExists).toBe(false);

          // Verify other files still exist
          for (let i = 0; i < uploadedMedia.length; i++) {
            if (i !== indexToDelete) {
              const media = uploadedMedia[i];
              const exists = await fs.access(media.path)
                .then(() => true)
                .catch(() => false);
              expect(exists).toBe(true);

              // Verify database record still exists
              const dbRecord = await Media.findByPk(media.id);
              expect(dbRecord).not.toBeNull();
            }
          }

          // Clean up remaining files
          for (let i = 0; i < uploadedMedia.length; i++) {
            if (i !== indexToDelete) {
              try {
                await mediaService.deleteMedia(uploadedMedia[i].id);
              } catch (error) {
                // Ignore
              }
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);

  /**
   * Property: Media metadata is accessible before deletion
   */
  test('media metadata should be accessible before deletion', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 3, maxLength: 20 }).map(s => s.replace(/[^a-zA-Z0-9]/g, 'f')),
        fc.constantFrom('image/jpeg', 'application/pdf'),
        fc.string({ minLength: 5, maxLength: 30 }),
        async (filename, mimetype, altText) => {
          // Create and upload file
          const mockFile = {
            originalname: `${filename}.jpg`,
            mimetype: mimetype,
            size: 2048,
            buffer: Buffer.from('content')
          };

          const media = await mediaService.upload(mockFile, testUser.id, 'metadata-test');

          // Update metadata
          await mediaService.update(media.id, { alt_text: altText });

          // Retrieve and verify metadata
          const retrieved = await mediaService.findById(media.id);
          expect(retrieved.alt_text).toBe(altText);
          expect(retrieved.original_name).toBe(mockFile.originalname);
          expect(retrieved.mime_type).toBe(mimetype);

          // Delete media
          await mediaService.deleteMedia(media.id);

          // Verify it's gone
          await expect(mediaService.findById(media.id)).rejects.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);
});
