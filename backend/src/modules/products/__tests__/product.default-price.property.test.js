import { describe, beforeAll, beforeEach, afterAll, it, expect } from '@jest/globals';
import fc from 'fast-check';
import sequelize from '../../../config/database.js';
import { setupAssociations } from '../../../config/associations.js';
import Product from '../product.model.js';
import ProductPrice from '../product-price.model.js';
import ProductCategory from '../../product-categories/product-category.model.js';
import * as productService from '../product.service.js';

/**
 * Property-Based Tests for Single Default Price Variant
 * Feature: cms-system, Property 27: Single default price variant
 * Validates: Requirements 5.3
 */

describe('Product Default Price - Property Tests', () => {
  beforeAll(async () => {
    setupAssociations();
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await ProductPrice.destroy({ where: {}, truncate: true, cascade: true });
    await Product.destroy({ where: {}, truncate: true, cascade: true });
    await ProductCategory.destroy({ where: {}, truncate: true, cascade: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  /**
   * Property 27: Single default price variant
   * For any product with multiple price variants, when setting a variant as default,
   * only that variant should have is_default=true and all others should have is_default=false.
   */
  describe('Property 27: Single default price variant', () => {
    it('should ensure only one default price when creating product', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate 2-5 price variants with random default flags
          fc.array(
            fc.record({
              variant_name: fc.string({ minLength: 1, maxLength: 50 }),
              price: fc.float({ min: 0.01, max: 10000, noNaN: true }).map(p => parseFloat(p.toFixed(2))),
              is_default: fc.boolean(),
              status: fc.constantFrom('active', 'inactive')
            }),
            { minLength: 2, maxLength: 5 }
          ),
          async (priceVariants) => {
            // Create product with price variants
            const product = await productService.create(
              {
                name: `Test Product ${Date.now()}`,
                status: 'draft'
              },
              priceVariants
            );

            // Retrieve product with prices
            const retrieved = await productService.findById(product.id);

            // Verify exactly one default price
            const defaultPrices = retrieved.prices.filter(p => p.is_default);
            expect(defaultPrices.length).toBe(1);

            // Verify all other prices are not default
            const nonDefaultPrices = retrieved.prices.filter(p => !p.is_default);
            expect(nonDefaultPrices.length).toBe(retrieved.prices.length - 1);
          }
        ),
        { numRuns: 20, timeout: 30000 }
      );
    }, 60000);

    it('should maintain single default when adding new price variant', async () => {
      // Create product with initial prices
      const product = await productService.create(
        {
          name: 'Test Product',
          status: 'draft'
        },
        [
          { variant_name: 'Small', price: 10.00, is_default: true, status: 'active' },
          { variant_name: 'Medium', price: 15.00, is_default: false, status: 'active' }
        ]
      );

      // Add new price variant as default
      await productService.addPriceVariant(product.id, {
        variant_name: 'Large',
        price: 20.00,
        is_default: true,
        status: 'active'
      });

      // Retrieve and verify
      const retrieved = await productService.findById(product.id);
      const defaultPrices = retrieved.prices.filter(p => p.is_default);
      
      expect(defaultPrices.length).toBe(1);
      expect(defaultPrices[0].variant_name).toBe('Large');
    }, 30000);

    it('should maintain single default when updating price variant', async () => {
      // Create product with prices
      const product = await productService.create(
        {
          name: 'Test Product',
          status: 'draft'
        },
        [
          { variant_name: 'Small', price: 10.00, is_default: true, status: 'active' },
          { variant_name: 'Medium', price: 15.00, is_default: false, status: 'active' },
          { variant_name: 'Large', price: 20.00, is_default: false, status: 'active' }
        ]
      );

      const retrieved = await productService.findById(product.id);
      const mediumPrice = retrieved.prices.find(p => p.variant_name === 'Medium');

      // Update Medium to be default
      await productService.updatePriceVariant(product.id, mediumPrice.id, {
        is_default: true
      });

      // Retrieve and verify
      const updated = await productService.findById(product.id);
      const defaultPrices = updated.prices.filter(p => p.is_default);
      
      expect(defaultPrices.length).toBe(1);
      expect(defaultPrices[0].variant_name).toBe('Medium');
    }, 30000);

    it('should set new default when deleting current default price', async () => {
      // Create product with prices
      const product = await productService.create(
        {
          name: 'Test Product',
          status: 'draft'
        },
        [
          { variant_name: 'Small', price: 10.00, is_default: true, status: 'active' },
          { variant_name: 'Medium', price: 15.00, is_default: false, status: 'active' },
          { variant_name: 'Large', price: 20.00, is_default: false, status: 'active' }
        ]
      );

      const retrieved = await productService.findById(product.id);
      const defaultPrice = retrieved.prices.find(p => p.is_default);

      // Delete the default price
      await productService.deletePriceVariant(product.id, defaultPrice.id);

      // Retrieve and verify a new default was set
      const updated = await productService.findById(product.id);
      const defaultPrices = updated.prices.filter(p => p.is_default);
      
      expect(defaultPrices.length).toBe(1);
      expect(updated.prices.length).toBe(2);
    }, 30000);
  });
});

