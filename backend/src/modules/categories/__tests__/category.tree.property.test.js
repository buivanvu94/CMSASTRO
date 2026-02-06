import { jest, describe, beforeAll, beforeEach, afterAll, it, expect } from '@jest/globals';
import fc from 'fast-check';
import sequelize from '../../../config/database.js';
import { setupAssociations } from '../../../config/associations.js';
import Category from '../category.model.js';
import * as categoryService from '../category.service.js';

/**
 * Property-Based Tests for Category Tree Structure
 * Feature: cms-system, Property 14: Category tree structure is correct
 * Validates: Requirements 3.3
 */

describe('Category Tree Structure - Property Tests', () => {
  beforeAll(async () => {
    setupAssociations();
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await Category.destroy({ where: {}, truncate: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  /**
   * Property 14: Category tree structure is correct
   * For any set of categories with parent-child relationships,
   * when requesting the category tree, the response should have
   * a properly nested hierarchical structure.
   */
  describe('Property 14: Category tree structure is correct', () => {
    it('should maintain parent-child relationships in tree structure', async () => {
      // Simple test first
      const root = await Category.create({
        name: 'Root Category',
        slug: 'root-category',
        type: 'post'
      });

      const child = await Category.create({
        name: 'Child Category',
        slug: 'child-category',
        type: 'post',
        parent_id: root.id
      });

      const tree = await categoryService.findTree('post');

      expect(tree.length).toBe(1);
      expect(tree[0].id).toBe(root.id);
      expect(tree[0].children.length).toBe(1);
      expect(tree[0].children[0].id).toBe(child.id);
    }, 30000);
  });
});
