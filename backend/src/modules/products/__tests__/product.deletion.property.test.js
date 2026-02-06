import { describe, beforeAll, beforeEach, afterAll, it, expect } from '@jest/globals';
import fc from 'fast-check';
import sequelize from '../../../config/database.js';
import { setupAssociations } from '../../../config/associations.js';
import Product from '../product.model.js';
import ProductPrice from '../product-price.model.js';
import Category from '../../categories/category.model.js';
import * as productService from '../product.service.js';

/**
 * Property-Based Tests for Product Deletion Cascade
 * Feature: cms-system, Property 30: Product deletion cascades to prices
 * Validates: Requirements 5.6
 */

describe('Product Deletion Cascade - Property Tests', () => {
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
   * Property 30: Product deletion cascades to prices
   * For any product with price variants, when the product is deleted,
   * all associated price variants should also be deleted.
   */
  describe('Property 30: Product deletion cascades to prices', () => {
    it('should delete all price variants when product is deleted', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate 1-10 price variants
          fc.array(
            fc.record({
              variant_name: fc.string({ minLength: 1, maxLength: 50 }),
              price: fc.float({ min: 0.01, max: 10000, noNaN: true }).map(p => parseFloat(p.toFixed(2))),
              is_default: fc.boolean(),
              status: fc.constantFrom('active', 'inactive')
            }),
            { minLength: 1, maxLength: 10 }
          ),
          async (priceVariants) => {
            // Ensure at least one is default
            if (!priceVariants.some(p => p.is_default)) {
              priceVariants[0].is_default = true;
            }

            // Create product with price variants
            const product = await productService.create(
              {
                name: `Test Product ${Date.now()}`,
                status: 'draft'
              },
              priceVariants
            );

            // Verify prices were created
            const pricesBeforeDelete = await ProductPrice.findAll({
              where: { product_id: product.id }
            });
            expect(pricesBeforeDelete.length).toBe(priceVariants.length);

            // Delete product
            await productService.deleteProduct(product.id);

            // Verify product is deleted
            const deletedProduct = await Product.findByPk(product.id);
            expect(deletedProduct).toBeNull();

            // Verify all price variants are deleted (cascade)
            const pricesAfterDelete = await ProductPrice.findAll({
              where: { product_id: product.id }
            });
            expect(pricesAfterDelete.length).toBe(0);
          }
        ),
        { numRuns: 20, timeout: 30000 }
      );
    }, 60000);

    it('should cascade delete with single price variant', async () => {
      const product = await productService.create(
        {
          name: 'Single Price Product',
          status: 'draft'
        },
        [
          { variant_name: 'Standard', price: 99.99, is_default: true, status: 'active' }
        ]
      );

      const priceId = (await ProductPrice.findOne({ where: { product_id: product.id } })).id;

      // Delete product
      await productService.deleteProduct(product.id);

      // Verify price is deleted
      const deletedPrice = await ProductPrice.findByPk(priceId);
      expect(deletedPrice).toBeNull();
    }, 30000);

    it('should cascade delete with multiple price variants', async () => {
      const product = await productService.create(
        {
          name: 'Multi Price Product',
          status: 'draft'
        },
        [
          { variant_name: 'Small', price: 10.00, is_default: true, status: 'active' },
          { variant_name: 'Medium', price: 15.00, is_default: false, status: 'active' },
          { variant_name: 'Large', price: 20.00, is_default: false, status: 'active' },
          { variant_name: 'XL', price: 25.00, is_default: false, status: 'inactive' }
        ]
      );

      // Get all price IDs
      const prices = await ProductPrice.findAll({ where: { product_id: product.id } });
      expect(prices.length).toBe(4);
      const priceIds = prices.map(p => p.id);

      // Delete product
      await productService.deleteProduct(product.id);

      // Verify all prices are deleted
      for (const priceId of priceIds) {
        const deletedPrice = await ProductPrice.findByPk(priceId);
        expect(deletedPrice).toBeNull();
      }
    }, 30000);

    it('should not affect prices of other products', async () => {
      // Create two products
      const product1 = await productService.create(
        {
          name: 'Product 1',
          status: 'draft'
        },
        [
          { variant_name: 'P1 Small', price: 10.00, is_default: true, status: 'active' },
          { variant_name: 'P1 Large', price: 20.00, is_default: false, status: 'active' }
        ]
      );

      const product2 = await productService.create(
        {
          name: 'Product 2',
          status: 'draft'
        },
        [
          { variant_name: 'P2 Small', price: 15.00, is_default: true, status: 'active' },
          { variant_name: 'P2 Large', price: 25.00, is_default: false, status: 'active' }
        ]
      );

      // Get product2 prices
      const product2Prices = await ProductPrice.findAll({ where: { product_id: product2.id } });
      expect(product2Prices.length).toBe(2);

      // Delete product1
      await productService.deleteProduct(product1.id);

      // Verify product1 prices are deleted
      const product1PricesAfter = await ProductPrice.findAll({ where: { product_id: product1.id } });
      expect(product1PricesAfter.length).toBe(0);

      // Verify product2 prices still exist
      const product2PricesAfter = await ProductPrice.findAll({ where: { product_id: product2.id } });
      expect(product2PricesAfter.length).toBe(2);
    }, 30000);
  });
});
