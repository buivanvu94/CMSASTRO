import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import fc from 'fast-check';
import sequelize from '../../../config/database.js';
import { setupAssociations } from '../../../config/associations.js';
import { generateUniqueFilename } from '../../../middlewares/upload.js';

/**
 * Property Test: Unique filename generation
 * 
 * Property 54: Unique filename generation
 * Requirements: 13.3
 * 
 * Tests that generated filenames are unique and properly formatted
 */

describe('Media Unique Filename Generation Property Tests', () => {
  beforeAll(async () => {
    setupAssociations();
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  /**
   * Property: Generated filenames are unique
   */
  test('generated filenames should be unique for same input', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 3, maxLength: 20 }).map(s => s.replace(/[^a-zA-Z0-9]/g, 'a')),
        fc.constantFrom('.jpg', '.png', '.pdf', '.gif'),
        async (basename, extension) => {
          const originalName = `${basename}${extension}`;

          // Generate multiple filenames from same input
          const filenames = [];
          for (let i = 0; i < 10; i++) {
            const filename = generateUniqueFilename(originalName);
            filenames.push(filename);
            
            // Small delay to ensure timestamp changes
            await new Promise(resolve => setTimeout(resolve, 2));
          }

          // All filenames should be unique
          const uniqueFilenames = new Set(filenames);
          expect(uniqueFilenames.size).toBe(filenames.length);

          // All should have the extension
          filenames.forEach(filename => {
            expect(filename.endsWith(extension)).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);

  /**
   * Property: Filenames are URL-safe (lowercase, hyphens, no special chars)
   */
  test('generated filenames should be URL-safe', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 30 }),
        fc.constantFrom('.jpg', '.png', '.pdf'),
        async (originalName, extension) => {
          const fullName = `${originalName}${extension}`;
          const filename = generateUniqueFilename(fullName);

          // Remove extension for checking
          const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));

          // Should be lowercase
          expect(nameWithoutExt).toBe(nameWithoutExt.toLowerCase());

          // Should only contain alphanumeric and hyphens
          expect(nameWithoutExt).toMatch(/^[a-z0-9-]+$/);

          // Should not have consecutive hyphens
          expect(nameWithoutExt).not.toMatch(/--+/);

          // Should not start or end with hyphen
          expect(nameWithoutExt.startsWith('-')).toBe(false);
          expect(nameWithoutExt.endsWith('-')).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);

  /**
   * Property: Special characters are removed or replaced
   */
  test('special characters should be removed or replaced with hyphens', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          'My Photo!.jpg',
          'document@2024.pdf',
          'file#name$.png',
          'test_file&more.jpg',
          'image (copy).png',
          'file[1].jpg'
        ),
        async (originalName) => {
          const filename = generateUniqueFilename(originalName);

          // Should not contain special characters
          expect(filename).not.toMatch(/[!@#$%^&*()[\]{}+=<>?/\\|`~]/);

          // Should contain only safe characters
          const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
          expect(nameWithoutExt).toMatch(/^[a-z0-9-]+$/);
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);

  /**
   * Property: Spaces are replaced with hyphens
   */
  test('spaces should be replaced with hyphens', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.string({ minLength: 1, maxLength: 10 }).map(s => s.replace(/[^a-zA-Z0-9]/g, 'a')), { minLength: 2, maxLength: 5 }),
        fc.constantFrom('.jpg', '.png'),
        async (words, extension) => {
          const originalName = words.join(' ') + extension;
          const filename = generateUniqueFilename(originalName);

          // Should not contain spaces
          expect(filename).not.toContain(' ');

          // Should contain hyphens (from spaces)
          const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
          if (words.length > 1) {
            expect(nameWithoutExt).toContain('-');
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);

  /**
   * Property: Filename includes timestamp component
   */
  test('generated filenames should include timestamp', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 3, maxLength: 15 }).map(s => s.replace(/[^a-zA-Z0-9]/g, 'b')),
        fc.constantFrom('.jpg', '.png'),
        async (basename, extension) => {
          const originalName = `${basename}${extension}`;
          const beforeTimestamp = Date.now();
          
          const filename = generateUniqueFilename(originalName);
          
          const afterTimestamp = Date.now();

          // Extract timestamp from filename (format: name-timestamp-random.ext)
          const parts = filename.split('-');
          
          // Should have at least 3 parts (name, timestamp, random)
          expect(parts.length).toBeGreaterThanOrEqual(3);

          // Second to last part should be timestamp
          const timestampPart = parts[parts.length - 2];
          const timestamp = parseInt(timestampPart);

          // Timestamp should be a valid number
          expect(isNaN(timestamp)).toBe(false);

          // Timestamp should be within reasonable range
          expect(timestamp).toBeGreaterThanOrEqual(beforeTimestamp - 1000);
          expect(timestamp).toBeLessThanOrEqual(afterTimestamp + 1000);
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);

  /**
   * Property: Filename includes random component
   */
  test('generated filenames should include random component', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 3, maxLength: 15 }).map(s => s.replace(/[^a-zA-Z0-9]/g, 'c')),
        fc.constantFrom('.jpg', '.png'),
        async (basename, extension) => {
          const originalName = `${basename}${extension}`;
          
          const filename = generateUniqueFilename(originalName);

          // Extract random part (last part before extension)
          const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
          const parts = nameWithoutExt.split('-');
          
          // Last part should be random number
          const randomPart = parts[parts.length - 1];
          const randomNum = parseInt(randomPart);

          // Should be a valid number
          expect(isNaN(randomNum)).toBe(false);

          // Should be within expected range (0-9999)
          expect(randomNum).toBeGreaterThanOrEqual(0);
          expect(randomNum).toBeLessThan(10000);
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);

  /**
   * Property: Extension is preserved
   */
  test('file extension should be preserved', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 3, maxLength: 20 }).map(s => s.replace(/[^a-zA-Z0-9]/g, 'd')),
        fc.constantFrom('.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.txt'),
        async (basename, extension) => {
          const originalName = `${basename}${extension}`;
          const filename = generateUniqueFilename(originalName);

          // Extension should be preserved
          expect(filename.endsWith(extension)).toBe(true);

          // Extension should be lowercase
          const actualExt = filename.substring(filename.lastIndexOf('.'));
          expect(actualExt).toBe(actualExt.toLowerCase());
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);

  /**
   * Property: Vietnamese characters are handled
   */
  test('Vietnamese characters should be converted to ASCII', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          'ảnh đẹp.jpg',
          'tài liệu.pdf',
          'hình ảnh việt nam.png',
          'báo cáo.doc'
        ),
        async (originalName) => {
          const filename = generateUniqueFilename(originalName);

          // Should not contain Vietnamese characters
          expect(filename).not.toMatch(/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i);

          // Should only contain safe ASCII characters
          const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
          expect(nameWithoutExt).toMatch(/^[a-z0-9-]+$/);
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);

  /**
   * Property: Empty or very short names are handled
   */
  test('empty or very short names should be handled gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('.jpg', 'a.jpg', '..jpg', '-.jpg'),
        async (originalName) => {
          const filename = generateUniqueFilename(originalName);

          // Should generate a valid filename
          expect(filename.length).toBeGreaterThan(10); // At least timestamp + random + extension

          // Should have valid format
          expect(filename).toMatch(/^[a-z0-9-]+\.[a-z]+$/);

          // Should have extension
          expect(filename).toContain('.');
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);

  /**
   * Property: Long filenames are handled
   */
  test('long filenames should be handled correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 50, maxLength: 200 }).map(s => s.replace(/[^a-zA-Z0-9 ]/g, 'a')),
        fc.constantFrom('.jpg', '.png'),
        async (longName, extension) => {
          const originalName = `${longName}${extension}`;
          const filename = generateUniqueFilename(originalName);

          // Should generate a valid filename
          expect(filename.length).toBeGreaterThan(0);

          // Should have valid format
          expect(filename).toMatch(/^[a-z0-9-]+\.[a-z]+$/);

          // Should preserve extension
          expect(filename.endsWith(extension)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);
});
