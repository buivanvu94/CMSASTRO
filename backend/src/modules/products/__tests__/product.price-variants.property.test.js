import { describe, beforeAll, beforeEach, afterAll, it, expect } from '@jest/globals';
import fc from 'fast-check';
import sequelize from '../../../config/database.js';
import { setupAssociations } from '../../../config/associations.js';
import Product from '../product.model.js';
import ProductPrice from '../product-price.model.js';
import Category from '../../categories/category.model.js';
import * as productService from '../product.service.js';

/**
 * Property-Based Tests for Product Price Variants
 * Feature: cms-system, Property 26: Product price variants storage
 * Validates: Requirements 5.2
 */

describe('Product Price Variants - Property Tests', () => {
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
   * Property 26: Product price variants storage
   * For any product with multiple price variants, when creating the product,
   * all variants should be stored with their respective price information
   * and retrievable with the product.
   */
  describe('Property 26: Product price variants storage', () => {
    it('should store and retrieve all price variants with product', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate 1-5 price variants
          fc.array(
            fc.record({
              variant_name: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null }),
              price: fc.float({ min: 0.01, max: 10000, noNaN: true }).map(p => parseFloat(p.toFixed(2))),
              sale_price: fc.option(
                fc.float({ min: 0.01, max: 5000, noNaN: true }).map(p => parseFloat(p.toFixed(2))),
                { nil: null }
              ),
              is_default: fc.boolean(),
              status: fc.constantFrom('active', 'inactive')
            }),
            { minLength: 1, maxLength: 5 }
          ),
          async (priceVariants) => {
            // Ensure at least one is default
            if (!priceVariants.some(p => p.is_default)) {
              priceVariants[0].is_default = true;
            }

            // Ensure sale_price is less than price if present
            const validPrices = priceVariants.map(p => ({
              ...p,
              sale_price: p.sale_price && p.sale_price >= p.price ? null : p.sale_price
            }));

            // Create product with price variants
            const product = await productService.create(
              {
                name: `Test Product ${Date.now()}`,
                status: 'draft'
              },
              validPrices
            );

            // Retrieve product with prices
            const retrieved = await productService.findById(product.id);

            // Verify all price variants are stored
            expect(retrieved.prices).toBeDefined();
            expect(retrieved.prices.length).toBe(validPrices.length);

            // Verify each price variant
            validPrices.forEach((expectedPrice, index) => {
              const actualPrice = retrieved.prices.find(
                p => p.variant_name === expectedPrice.variant_name &&
                     parseFloat(p.price) === expectedPrice.price
              );

              expect(actualPrice).toBeDefined();
              expect(parseFloat(actualPrice.price)).toBe(expectedPrice.price);
              
              if (expectedPrice.sale_price !== null) {
                expect(parseFloat(actualPrice.sale_price)).toBe(expectedPrice.sale_price);
              }
              
              expect(actualPrice.status).toBe(expectedPrice.status);
            });

            // Verify exactly one default price
            const defaultPrices = retrieved.prices.filter(p => p.is_default);
            expect(defaultPrices.length).toBe(1);
          }
        ),
        { numRuns: 20, timeout: 30000 }
      );
    }, 60000);

    it('should handle product with single price variant', async () => {
      const product = await productService.create(
        {
          name: 'Single Price Product',
          status: 'draft'
        },
        [
          {
            variant_name: 'Standard',
            price: 99.99,
            is_default: true,
            status: 'active'
          }
        ]
      );

      const retrieved = await productService.findById(product.id);

      expect(retrieved.prices.length).toBe(1);
      expect(parseFloat(retrieved.prices[0].price)).toBe(99.99);
      expect(retrieved.prices[0].is_default).toBe(true);
    }, 30000);
  });
});
