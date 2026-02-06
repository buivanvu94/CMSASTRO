import { describe, test, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import fc from 'fast-check';
import sequelize from '../../../config/database.js';
import { setupAssociations } from '../../../config/associations.js';
import * as mediaService from '../media.service.js';
import User from '../../users/user.model.js';
import Media from '../media.model.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Property Test: File organization by date
 * 
 * Property 48: File organization by date
 * Requirements: 9.2, 13.4
 * 
 * Tests that uploaded files are organized in year/month directory structure
 */

describe('Media File Organization Property Tests', () => {
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
   * Property: Files are organized in year/month directory structure
   */
  test('uploaded files should be stored in year/month directory structure', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 3, maxLength: 20 }).map(s => s.replace(/[^a-zA-Z0-9]/g, 'a')),
        fc.constantFrom('image/jpeg', 'image/png', 'image/gif', 'application/pdf'),
        fc.integer({ min: 1024, max: 1024 * 1024 }),
        async (filename, mimeType, size) => {
          // Create mock file
          const mockFile = {
            originalname: `${filename}.jpg`,
            mimetype: mimeType,
            size: size,
            buffer: Buffer.from('fake file content')
          };

          // Upload file
          const media = await mediaService.upload(mockFile, testUser.id, 'test-folder');

          // Get current date
          const now = new Date();
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, '0');

          // Expected directory pattern
          const expectedPattern = `uploads/${year}/${month}`;

          // Verify path contains year/month structure
          expect(media.path).toContain(expectedPattern);

          // Verify path format
          const pathParts = media.path.split('/');
          expect(pathParts).toContain('uploads');
          expect(pathParts).toContain(String(year));
          expect(pathParts).toContain(month);

          // Clean up created file
          try {
            await fs.unlink(media.path);
            if (media.thumbnail_path) {
              await fs.unlink(media.thumbnail_path);
            }
          } catch (error) {
            // Ignore cleanup errors
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);

  /**
   * Property: Files uploaded in different months are in different directories
   */
  test('files should be organized by upload date', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            filename: fc.string({ minLength: 3, maxLength: 15 }).map(s => s.replace(/[^a-zA-Z0-9]/g, 'a')),
            mimetype: fc.constantFrom('image/jpeg', 'image/png'),
            size: fc.integer({ min: 1024, max: 1024 * 100 })
          }),
          { minLength: 2, maxLength: 5 }
        ),
        async (fileConfigs) => {
          const uploadedMedia = [];

          // Upload all files
          for (const config of fileConfigs) {
            const mockFile = {
              originalname: `${config.filename}.jpg`,
              mimetype: config.mimetype,
              size: config.size,
              buffer: Buffer.from('fake content')
            };

            const media = await mediaService.upload(mockFile, testUser.id, 'test');
            uploadedMedia.push(media);
          }

          // All files should have the same year/month since uploaded at same time
          const paths = uploadedMedia.map(m => m.path);
          const directories = paths.map(p => {
            const parts = p.split('/');
            return `${parts[parts.length - 3]}/${parts[parts.length - 2]}`;
          });

          // All should be in same year/month directory
          const uniqueDirs = [...new Set(directories)];
          expect(uniqueDirs.length).toBe(1);

          // Verify format is YYYY/MM
          const dirParts = uniqueDirs[0].split('/');
          expect(dirParts[0]).toMatch(/^\d{4}$/); // Year
          expect(dirParts[1]).toMatch(/^(0[1-9]|1[0-2])$/); // Month

          // Clean up
          for (const media of uploadedMedia) {
            try {
              await fs.unlink(media.path);
              if (media.thumbnail_path) {
                await fs.unlink(media.thumbnail_path);
              }
            } catch (error) {
              // Ignore
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);

  /**
   * Property: Directory structure is created if it doesn't exist
   */
  test('directory structure should be created automatically', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 15 }).map(s => s.replace(/[^a-zA-Z0-9]/g, 'b')),
        async (filename) => {
          const mockFile = {
            originalname: `${filename}.jpg`,
            mimetype: 'image/jpeg',
            size: 2048,
            buffer: Buffer.from('test content')
          };

          // Upload file
          const media = await mediaService.upload(mockFile, testUser.id, 'auto-create');

          // Verify file exists at the path
          const fileExists = await fs.access(media.path)
            .then(() => true)
            .catch(() => false);

          expect(fileExists).toBe(true);

          // Verify directory structure
          const dirPath = path.dirname(media.path);
          const dirExists = await fs.access(dirPath)
            .then(() => true)
            .catch(() => false);

          expect(dirExists).toBe(true);

          // Clean up
          try {
            await fs.unlink(media.path);
            if (media.thumbnail_path) {
              await fs.unlink(media.thumbnail_path);
            }
          } catch (error) {
            // Ignore
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);

  /**
   * Property: Path is stored with forward slashes (cross-platform)
   */
  test('stored paths should use forward slashes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 4, maxLength: 12 }).map(s => s.replace(/[^a-zA-Z0-9]/g, 'c')),
        async (filename) => {
          const mockFile = {
            originalname: `${filename}.png`,
            mimetype: 'image/png',
            size: 1500,
            buffer: Buffer.from('png content')
          };

          const media = await mediaService.upload(mockFile, testUser.id, 'slash-test');

          // Path should not contain backslashes
          expect(media.path).not.toContain('\\');

          // Path should contain forward slashes
          expect(media.path).toContain('/');

          // Thumbnail path should also use forward slashes
          if (media.thumbnail_path) {
            expect(media.thumbnail_path).not.toContain('\\');
            expect(media.thumbnail_path).toContain('/');
          }

          // Clean up
          try {
            await fs.unlink(media.path);
            if (media.thumbnail_path) {
              await fs.unlink(media.thumbnail_path);
            }
          } catch (error) {
            // Ignore
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);
});
