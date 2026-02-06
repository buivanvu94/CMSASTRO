import { jest, describe, beforeAll, beforeEach, afterAll, it, expect } from '@jest/globals';
import fc from 'fast-check';
import sequelize from '../../../config/database.js';
import { setupAssociations } from '../../../config/associations.js';
import Category from '../category.model.js';
import * as categoryService from '../category.service.js';

/**
 * Property-Based Tests for Category Deletion
 * Feature: cms-system, Property 15: Category deletion moves children
 * Validates: Requirements 3.6
 */

describe('Category Deletion - Property Tests', () => {
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
   * Property 15: Category deletion moves children
   * For any category with child categories, when the category is deleted,
   * all child categories should be moved to the deleted category's parent
   * (or become root categories if no parent exists).
   */
  describe('Property 15: Category deletion moves children', () => {
    it('should move children to parent when deleting category with parent', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            grandparentName: fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
            parentName: fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
            childrenCount: fc.integer({ min: 1, max: 5 }),
            type: fc.constantFrom('post', 'product')
          }),
          async ({ grandparentName, parentName, childrenCount, type }) => {
            // Create grandparent
            const grandparent = await Category.create({
              name: grandparentName,
              slug: `grandparent-${Date.now()}`,
              type
            });

            // Create parent under grandparent
            const parent = await Category.create({
              name: parentName,
              slug: `parent-${Date.now()}`,
              type,
              parent_id: grandparent.id
            });

            // Create children under parent
            const children = [];
            for (let i = 0; i < childrenCount; i++) {
              const child = await Category.create({
                name: `Child ${i}`,
                slug: `child-${Date.now()}-${i}`,
                type,
                parent_id: parent.id
              });
              children.push(child);
            }

            // Delete parent
            await categoryService.deleteCategory(parent.id);

            // Verify parent is deleted
            const deletedParent = await Category.findByPk(parent.id);
            expect(deletedParent).toBeNull();

            // Verify all children now have grandparent as parent
            for (const child of children) {
              const updatedChild = await Category.findByPk(child.id);
              expect(updatedChild).not.toBeNull();
              expect(updatedChild.parent_id).toBe(grandparent.id);
            }

            // Verify grandparent now has all children
            const updatedGrandparent = await categoryService.findById(grandparent.id);
            expect(updatedGrandparent.children.length).toBe(childrenCount);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should move children to root when deleting root category', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            parentName: fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
            childrenCount: fc.integer({ min: 1, max: 5 }),
            type: fc.constantFrom('post', 'product')
          }),
          async ({ parentName, childrenCount, type }) => {
            // Create root parent
            const parent = await Category.create({
              name: parentName,
              slug: `parent-${Date.now()}`,
              type
            });

            // Create children under parent
            const children = [];
            for (let i = 0; i < childrenCount; i++) {
              const child = await Category.create({
                name: `Child ${i}`,
                slug: `child-${Date.now()}-${i}`,
                type,
                parent_id: parent.id
              });
              children.push(child);
            }

            // Delete parent
            await categoryService.deleteCategory(parent.id);

            // Verify parent is deleted
            const deletedParent = await Category.findByPk(parent.id);
            expect(deletedParent).toBeNull();

            // Verify all children are now root categories (parent_id is null)
            for (const child of children) {
              const updatedChild = await Category.findByPk(child.id);
              expect(updatedChild).not.toBeNull();
              expect(updatedChild.parent_id).toBeNull();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should successfully delete leaf category without children', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            name: fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
            type: fc.constantFrom('post', 'product')
          }),
          async ({ name, type }) => {
            // Create category without children
            const category = await Category.create({
              name,
              slug: `leaf-${Date.now()}`,
              type
            });

            const categoryId = category.id;

            // Delete category
            await categoryService.deleteCategory(categoryId);

            // Verify category is deleted
            const deletedCategory = await Category.findByPk(categoryId);
            expect(deletedCategory).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve grandchildren relationships when deleting middle category', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            rootName: fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
            middleName: fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
            childName: fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
            grandchildName: fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
            type: fc.constantFrom('post', 'product')
          }),
          async ({ rootName, middleName, childName, grandchildName, type }) => {
            // Create 4-level hierarchy: root -> middle -> child -> grandchild
            const root = await Category.create({
              name: rootName,
              slug: `root-${Date.now()}`,
              type
            });

            const middle = await Category.create({
              name: middleName,
              slug: `middle-${Date.now()}`,
              type,
              parent_id: root.id
            });

            const child = await Category.create({
              name: childName,
              slug: `child-${Date.now()}`,
              type,
              parent_id: middle.id
            });

            const grandchild = await Category.create({
              name: grandchildName,
              slug: `grandchild-${Date.now()}`,
              type,
              parent_id: child.id
            });

            // Delete middle category
            await categoryService.deleteCategory(middle.id);

            // Verify middle is deleted
            expect(await Category.findByPk(middle.id)).toBeNull();

            // Verify child moved to root
            const updatedChild = await Category.findByPk(child.id);
            expect(updatedChild.parent_id).toBe(root.id);

            // Verify grandchild still under child
            const updatedGrandchild = await Category.findByPk(grandchild.id);
            expect(updatedGrandchild.parent_id).toBe(child.id);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle deletion of category with multiple levels of descendants', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            parentName: fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
            childrenCount: fc.integer({ min: 2, max: 4 }),
            type: fc.constantFrom('post', 'product')
          }),
          async ({ parentName, childrenCount, type }) => {
            // Create parent
            const parent = await Category.create({
              name: parentName,
              slug: `parent-${Date.now()}`,
              type
            });

            // Create children and grandchildren
            const children = [];
            const grandchildren = [];

            for (let i = 0; i < childrenCount; i++) {
              const child = await Category.create({
                name: `Child ${i}`,
                slug: `child-${Date.now()}-${i}`,
                type,
                parent_id: parent.id
              });
              children.push(child);

              // Create grandchild for each child
              const grandchild = await Category.create({
                name: `Grandchild ${i}`,
                slug: `grandchild-${Date.now()}-${i}`,
                type,
                parent_id: child.id
              });
              grandchildren.push(grandchild);
            }

            // Delete parent
            await categoryService.deleteCategory(parent.id);

            // Verify parent is deleted
            expect(await Category.findByPk(parent.id)).toBeNull();

            // Verify all children are now root
            for (const child of children) {
              const updatedChild = await Category.findByPk(child.id);
              expect(updatedChild.parent_id).toBeNull();
            }

            // Verify grandchildren still under their respective children
            for (let i = 0; i < grandchildren.length; i++) {
              const updatedGrandchild = await Category.findByPk(grandchildren[i].id);
              expect(updatedGrandchild.parent_id).toBe(children[i].id);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain sibling relationships after deletion', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            parentName: fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
            siblingsCount: fc.integer({ min: 3, max: 6 }),
            deleteIndex: fc.integer({ min: 0, max: 5 }),
            type: fc.constantFrom('post', 'product')
          }),
          async ({ parentName, siblingsCount, deleteIndex, type }) => {
            // Ensure deleteIndex is within bounds
            const actualDeleteIndex = deleteIndex % siblingsCount;

            // Create parent
            const parent = await Category.create({
              name: parentName,
              slug: `parent-${Date.now()}`,
              type
            });

            // Create siblings
            const siblings = [];
            for (let i = 0; i < siblingsCount; i++) {
              const sibling = await Category.create({
                name: `Sibling ${i}`,
                slug: `sibling-${Date.now()}-${i}`,
                type,
                parent_id: parent.id
              });
              siblings.push(sibling);
            }

            // Delete one sibling
            const toDelete = siblings[actualDeleteIndex];
            await categoryService.deleteCategory(toDelete.id);

            // Verify deleted sibling is gone
            expect(await Category.findByPk(toDelete.id)).toBeNull();

            // Verify remaining siblings still exist and have same parent
            for (let i = 0; i < siblings.length; i++) {
              if (i !== actualDeleteIndex) {
                const sibling = await Category.findByPk(siblings[i].id);
                expect(sibling).not.toBeNull();
                expect(sibling.parent_id).toBe(parent.id);
              }
            }

            // Verify parent has correct number of children
            const updatedParent = await categoryService.findById(parent.id);
            expect(updatedParent.children.length).toBe(siblingsCount - 1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle deletion in complex tree structures', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            type: fc.constantFrom('post', 'product')
          }),
          async ({ type }) => {
            // Create complex tree:
            //       root
            //      /    \
            //    A       B
            //   / \     / \
            //  A1 A2   B1 B2

            const root = await Category.create({
              name: 'Root',
              slug: `root-${Date.now()}`,
              type
            });

            const a = await Category.create({
              name: 'A',
              slug: `a-${Date.now()}`,
              type,
              parent_id: root.id
            });

            const b = await Category.create({
              name: 'B',
              slug: `b-${Date.now()}`,
              type,
              parent_id: root.id
            });

            const a1 = await Category.create({
              name: 'A1',
              slug: `a1-${Date.now()}`,
              type,
              parent_id: a.id
            });

            const a2 = await Category.create({
              name: 'A2',
              slug: `a2-${Date.now()}`,
              type,
              parent_id: a.id
            });

            const b1 = await Category.create({
              name: 'B1',
              slug: `b1-${Date.now()}`,
              type,
              parent_id: b.id
            });

            const b2 = await Category.create({
              name: 'B2',
              slug: `b2-${Date.now()}`,
              type,
              parent_id: b.id
            });

            // Delete category A
            await categoryService.deleteCategory(a.id);

            // Verify A is deleted
            expect(await Category.findByPk(a.id)).toBeNull();

            // Verify A's children (A1, A2) moved to root
            const updatedA1 = await Category.findByPk(a1.id);
            const updatedA2 = await Category.findByPk(a2.id);
            expect(updatedA1.parent_id).toBe(root.id);
            expect(updatedA2.parent_id).toBe(root.id);

            // Verify B and its children are unaffected
            const updatedB = await Category.findByPk(b.id);
            const updatedB1 = await Category.findByPk(b1.id);
            const updatedB2 = await Category.findByPk(b2.id);
            expect(updatedB.parent_id).toBe(root.id);
            expect(updatedB1.parent_id).toBe(b.id);
            expect(updatedB2.parent_id).toBe(b.id);

            // Verify root now has 4 direct children (B, A1, A2, and originally had B)
            const updatedRoot = await categoryService.findById(root.id);
            expect(updatedRoot.children.length).toBe(3); // B, A1, A2
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve category data when moving children', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            parentName: fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
            childName: fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
            childDescription: fc.string({ minLength: 5, maxLength: 50 }),
            type: fc.constantFrom('post', 'product')
          }),
          async ({ parentName, childName, childDescription, type }) => {
            // Create parent
            const parent = await Category.create({
              name: parentName,
              slug: `parent-${Date.now()}`,
              type
            });

            // Create child with additional data
            const child = await Category.create({
              name: childName,
              slug: `child-${Date.now()}`,
              description: childDescription,
              type,
              parent_id: parent.id,
              sort_order: 5,
              status: 'active'
            });

            // Delete parent
            await categoryService.deleteCategory(parent.id);

            // Verify child data is preserved (only parent_id changed)
            const updatedChild = await Category.findByPk(child.id);
            expect(updatedChild.name).toBe(childName);
            expect(updatedChild.description).toBe(childDescription);
            expect(updatedChild.sort_order).toBe(5);
            expect(updatedChild.status).toBe('active');
            expect(updatedChild.parent_id).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
