import { jest, describe, beforeAll, beforeEach, afterAll, it, expect } from '@jest/globals';
import fc from 'fast-check';
import sequelize from '../../../config/database.js';
import { setupAssociations } from '../../../config/associations.js';
import Category from '../category.model.js';
import * as categoryService from '../category.service.js';

/**
 * Property-Based Tests for Category Parent-Child Relationships
 * Feature: cms-system, Property 13: Parent-child relationships are established
 * Validates: Requirements 3.2
 */

describe('Category Parent-Child Relationships - Property Tests', () => {
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
   * Property 13: Parent-child relationships are established
   * For any valid parent category and new child category,
   * when creating the child with a parent_id, the relationship
   * should be established and retrievable.
   */
  describe('Property 13: Parent-child relationships are established', () => {
    it('should establish parent-child relationship when creating child with parent_id', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            parentName: fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
            childName: fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
            type: fc.constantFrom('post', 'product')
          }),
          async ({ parentName, childName, type }) => {
            // Create parent category
            const parent = await Category.create({
              name: parentName,
              slug: `parent-${Date.now()}`,
              type
            });

            // Create child category with parent_id
            const child = await Category.create({
              name: childName,
              slug: `child-${Date.now()}`,
              type,
              parent_id: parent.id
            });

            // Verify relationship is established
            expect(child.parent_id).toBe(parent.id);

            // Retrieve child and verify parent relationship
            const retrievedChild = await categoryService.findById(child.id);
            expect(retrievedChild.parent_id).toBe(parent.id);
            expect(retrievedChild.parent).toBeDefined();
            expect(retrievedChild.parent.id).toBe(parent.id);

            // Retrieve parent and verify children relationship
            const retrievedParent = await categoryService.findById(parent.id);
            expect(retrievedParent.children).toBeDefined();
            expect(retrievedParent.children.length).toBe(1);
            expect(retrievedParent.children[0].id).toBe(child.id);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain parent-child relationship across multiple children', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            parentName: fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
            childrenNames: fc.array(
              fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
              { minLength: 2, maxLength: 5 }
            ),
            type: fc.constantFrom('post', 'product')
          }),
          async ({ parentName, childrenNames, type }) => {
            // Create parent category
            const parent = await Category.create({
              name: parentName,
              slug: `parent-${Date.now()}`,
              type
            });

            // Create multiple children
            const children = [];
            for (let i = 0; i < childrenNames.length; i++) {
              const child = await Category.create({
                name: childrenNames[i],
                slug: `child-${Date.now()}-${i}`,
                type,
                parent_id: parent.id
              });
              children.push(child);
            }

            // Verify all children reference the parent
            for (const child of children) {
              expect(child.parent_id).toBe(parent.id);
            }

            // Retrieve parent and verify all children are listed
            const retrievedParent = await categoryService.findById(parent.id);
            expect(retrievedParent.children.length).toBe(children.length);

            const childIds = children.map(c => c.id).sort();
            const retrievedChildIds = retrievedParent.children.map(c => c.id).sort();
            expect(retrievedChildIds).toEqual(childIds);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should allow null parent_id for root categories', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            name: fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
            type: fc.constantFrom('post', 'product')
          }),
          async ({ name, type }) => {
            // Create category without parent_id
            const category = await Category.create({
              name,
              slug: `root-${Date.now()}`,
              type
            });

            // Verify parent_id is null
            expect(category.parent_id).toBeNull();

            // Retrieve and verify
            const retrieved = await categoryService.findById(category.id);
            expect(retrieved.parent_id).toBeNull();
            expect(retrieved.parent).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain relationship when parent is updated', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            parentName: fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
            newParentName: fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
            childName: fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
            type: fc.constantFrom('post', 'product')
          }),
          async ({ parentName, newParentName, childName, type }) => {
            // Create parent and child
            const parent = await Category.create({
              name: parentName,
              slug: `parent-${Date.now()}`,
              type
            });

            const child = await Category.create({
              name: childName,
              slug: `child-${Date.now()}`,
              type,
              parent_id: parent.id
            });

            // Update parent
            await categoryService.update(parent.id, { name: newParentName });

            // Verify child still references parent
            const retrievedChild = await categoryService.findById(child.id);
            expect(retrievedChild.parent_id).toBe(parent.id);
            expect(retrievedChild.parent.name).toBe(newParentName);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should allow changing parent of a category', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            parent1Name: fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
            parent2Name: fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
            childName: fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
            type: fc.constantFrom('post', 'product')
          }),
          async ({ parent1Name, parent2Name, childName, type }) => {
            // Create two parents
            const parent1 = await Category.create({
              name: parent1Name,
              slug: `parent1-${Date.now()}`,
              type
            });

            const parent2 = await Category.create({
              name: parent2Name,
              slug: `parent2-${Date.now()}`,
              type
            });

            // Create child under parent1
            const child = await Category.create({
              name: childName,
              slug: `child-${Date.now()}`,
              type,
              parent_id: parent1.id
            });

            // Verify initial relationship
            expect(child.parent_id).toBe(parent1.id);

            // Change parent to parent2
            await categoryService.update(child.id, { parent_id: parent2.id });

            // Verify new relationship
            const updatedChild = await categoryService.findById(child.id);
            expect(updatedChild.parent_id).toBe(parent2.id);
            expect(updatedChild.parent.id).toBe(parent2.id);

            // Verify parent1 no longer has this child
            const updatedParent1 = await categoryService.findById(parent1.id);
            expect(updatedParent1.children.length).toBe(0);

            // Verify parent2 now has this child
            const updatedParent2 = await categoryService.findById(parent2.id);
            expect(updatedParent2.children.length).toBe(1);
            expect(updatedParent2.children[0].id).toBe(child.id);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should enforce type consistency between parent and child', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            parentName: fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
            childName: fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
            parentType: fc.constantFrom('post', 'product'),
            childType: fc.constantFrom('post', 'product')
          }),
          async ({ parentName, childName, parentType, childType }) => {
            // Create parent
            const parent = await Category.create({
              name: parentName,
              slug: `parent-${Date.now()}`,
              type: parentType
            });

            if (parentType === childType) {
              // Should succeed when types match
              const child = await Category.create({
                name: childName,
                slug: `child-${Date.now()}`,
                type: childType,
                parent_id: parent.id
              });

              expect(child.parent_id).toBe(parent.id);
              expect(child.type).toBe(parent.type);
            } else {
              // Should fail when types don't match
              await expect(
                Category.create({
                  name: childName,
                  slug: `child-${Date.now()}`,
                  type: childType,
                  parent_id: parent.id
                })
              ).rejects.toThrow();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should retrieve parent information when fetching child', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            parentName: fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
            parentSlug: fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
            childName: fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
            type: fc.constantFrom('post', 'product')
          }),
          async ({ parentName, parentSlug, childName, type }) => {
            // Create parent with specific attributes
            const parent = await Category.create({
              name: parentName,
              slug: `${parentSlug}-${Date.now()}`,
              type,
              description: 'Parent description'
            });

            // Create child
            const child = await Category.create({
              name: childName,
              slug: `child-${Date.now()}`,
              type,
              parent_id: parent.id
            });

            // Retrieve child with parent info
            const retrieved = await categoryService.findById(child.id);

            // Verify parent information is included
            expect(retrieved.parent).toBeDefined();
            expect(retrieved.parent.id).toBe(parent.id);
            expect(retrieved.parent.name).toBe(parentName);
            expect(retrieved.parent.slug).toContain(parentSlug);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle multi-level parent-child hierarchies', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 2, max: 5 }), // Number of levels
          async (levels) => {
            const categories = [];
            let parent = null;

            // Create hierarchy
            for (let i = 0; i < levels; i++) {
              const category = await Category.create({
                name: `Level ${i}`,
                slug: `level-${i}-${Date.now()}`,
                type: 'post',
                parent_id: parent ? parent.id : null
              });
              categories.push(category);
              parent = category;
            }

            // Verify each level
            for (let i = 0; i < levels; i++) {
              const retrieved = await categoryService.findById(categories[i].id);

              if (i === 0) {
                // Root level
                expect(retrieved.parent_id).toBeNull();
              } else {
                // Child level
                expect(retrieved.parent_id).toBe(categories[i - 1].id);
                expect(retrieved.parent.id).toBe(categories[i - 1].id);
              }

              if (i < levels - 1) {
                // Has children
                expect(retrieved.children.length).toBeGreaterThan(0);
                expect(retrieved.children[0].id).toBe(categories[i + 1].id);
              } else {
                // Leaf node
                expect(retrieved.children.length).toBe(0);
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
