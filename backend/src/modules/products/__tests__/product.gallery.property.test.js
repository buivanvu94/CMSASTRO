import { describe, beforeAll, beforeEach, afterAll, it, expect } from '@jest/globals';
import fc from 'fast-check';
import sequelize from '../../../config/database.js';
import { setupAssociations } from '../../../config/associations.js';
import Product from '../product.model.js';
import ProductPrice from '../product-price.model.js';
import Category from '../../categories/category.model.js';
import * as productService from '../product.service.js';

/**
 * Property-Based Tests for Product Gallery Storage
 * Feature: cms-system, Property 28: Gallery stored as JSON array
 * Validates: Requirements 5.4, 18.1
 */

describe('Product Gallery Storage - Property Tests', () => {
  beforeAll(async () => {
    setupAssociations();
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await ProductPrice.destroy({ where: {}, truncate: true, cascade: true });
    await Product.destroy({ where: {}, truncate: true, cascade: true });
    await Category.destroy({ where: {}, truncate: true, cascade: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  /**
   * Property 28: Gallery stored as JSON array
   * For any product with gallery images, the media IDs should be stored
   * as a JSON array and retrievable as an array.
   */
  describe('Property 28: Gallery stored as JSON array', () => {
    it('should store and retrieve gallery as JSON array', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate array of media IDs (1-10 images)
          fc.array(
            fc.integer({ min: 1, max: 1000 }),
            { minLength: 1, maxLength: 10 }
          ),
          async (mediaIds) => {
            // Create product with gallery
            const product = await productService.create(
              {
                name: `Test Product ${Date.now()}`,
                gallery: mediaIds,
                status: 'draft'
              },
              [{ price: 10.00, is_default: true, status: 'active' }]
            );

            // Retrieve product
            const retrieved = await productService.findById(product.id);

            // Verify gallery is an array
            expect(Array.isArray(retrieved.gallery)).toBe(true);
            
            // Verify all media IDs are present
            expect(retrieved.gallery.length).toBe(mediaIds.length);
            
            // Verify order is preserved
            mediaIds.forEach((id, index) => {
              expect(retrieved.gallery[index]).toBe(id);
            });
          }
        ),
        { numRuns: 20, timeout: 30000 }
      );
    }, 60000);

    it('should handle empty gallery', async () => {
      const product = await productService.create(
        {
          name: 'Product without gallery',
          gallery: null,
          status: 'draft'
        },
        [{ price: 10.00, is_default: true, status: 'active' }]
      );

      const retrieved = await productService.findById(product.id);
      expect(retrieved.gallery).toBeNull();
    }, 30000);

    it('should update gallery array', async () => {
      // Create product with initial gallery
      const product = await productService.create(
        {
          name: 'Test Product',
          gallery: [1, 2, 3],
          status: 'draft'
        },
        [{ price: 10.00, is_default: true, status: 'active' }]
      );

      // Update gallery
      const updated = await productService.update(product.id, {
        gallery: [4, 5, 6, 7]
      });

      expect(Array.isArray(updated.gallery)).toBe(true);
      expect(updated.gallery.length).toBe(4);
      expect(updated.gallery).toEqual([4, 5, 6, 7]);
    }, 30000);

    it('should handle gallery with duplicate IDs', async () => {
      const product = await productService.create(
        {
          name: 'Test Product',
          gallery: [1, 2, 2, 3, 3, 3],
          status: 'draft'
        },
        [{ price: 10.00, is_default: true, status: 'active' }]
      );

      const retrieved = await productService.findById(product.id);
      
      expect(Array.isArray(retrieved.gallery)).toBe(true);
      expect(retrieved.gallery.length).toBe(6);
      expect(retrieved.gallery).toEqual([1, 2, 2, 3, 3, 3]);
    }, 30000);

    it('should reject non-array gallery', async () => {
      await expect(
        productService.create(
          {
            name: 'Test Product',
            gallery: 'not-an-array',
            status: 'draft'
          },
          [{ price: 10.00, is_default: true, status: 'active' }]
        )
      ).rejects.toThrow();
    }, 30000);

    it('should reject gallery with invalid media IDs', async () => {
      await expect(
        productService.create(
          {
            name: 'Test Product',
            gallery: [1, 'invalid', 3],
            status: 'draft'
          },
          [{ price: 10.00, is_default: true, status: 'active' }]
        )
      ).rejects.toThrow();
    }, 30000);

    it('should clear gallery when set to null', async () => {
      // Create product with gallery
      const product = await productService.create(
        {
          name: 'Test Product',
          gallery: [1, 2, 3],
          status: 'draft'
        },
        [{ price: 10.00, is_default: true, status: 'active' }]
      );

      // Clear gallery
      const updated = await productService.update(product.id, {
        gallery: null
      });

      expect(updated.gallery).toBeNull();
    }, 30000);
  });
});
