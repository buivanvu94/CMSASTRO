import { describe, beforeAll, beforeEach, afterAll, it, expect } from '@jest/globals';
import fc from 'fast-check';
import sequelize from '../../../config/database.js';
import { setupAssociations } from '../../../config/associations.js';
import Menu from '../menu.model.js';
import MenuItem from '../menu-item.model.js';
import * as menuService from '../menu.service.js';

/**
 * Property-Based Tests for Menu Item Nesting
 * Feature: cms-system, Property 42: Menu item nesting
 * Validates: Requirements 8.3
 */

describe('Menu Item Nesting - Property Tests', () => {
  let testMenu;

  beforeAll(async () => {
    setupAssociations();
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await MenuItem.destroy({ where: {}, truncate: true });
    await Menu.destroy({ where: {}, truncate: true });

    // Create a test menu
    testMenu = await Menu.create({
      name: 'Test Menu',
      location: 'header',
      description: 'Test menu for property tests'
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  // Configure fast-check to run 100 iterations minimum
  const fcConfig = { numRuns: 100 };

  /**
   * Property 42: Menu item nesting
   * For any valid parent menu item and child menu item,
   * when creating the child with a parent_id, the nested
   * relationship should be established.
   */
  describe('Property 42: Menu item nesting', () => {
    // Generator for valid menu item titles
    const titleArb = fc.string({ minLength: 1, maxLength: 100 })
      .filter(s => s.trim().length >= 1);

    // Generator for valid URLs
    const urlArb = fc.option(
      fc.webUrl(),
      { nil: null }
    );

    // Generator for link types
    const linkTypeArb = fc.constantFrom('internal', 'custom');

    // Generator for targets
    const targetArb = fc.constantFrom('_self', '_blank');

    it('should establish parent-child relationship for any valid items', async () => {
      await fc.assert(
        fc.asyncProperty(
          titleArb,
          titleArb,
          urlArb,
          urlArb,
          async (parentTitle, childTitle, parentUrl, childUrl) => {
            // Create parent item
            const parent = await menuService.addMenuItem(testMenu.id, {
              title: parentTitle,
              url: parentUrl,
              link_type: 'custom'
            });

            // Create child item with parent_id
            const child = await menuService.addMenuItem(testMenu.id, {
              title: childTitle,
              url: childUrl,
              link_type: 'custom',
              parent_id: parent.id
            });

            // Property: child should have parent_id set
            expect(child.parent_id).toBe(parent.id);
            expect(child.hasParent()).toBe(true);
            expect(child.isTopLevel()).toBe(false);

            // Property: parent should be top level
            expect(parent.parent_id).toBeNull();
            expect(parent.isTopLevel()).toBe(true);
            expect(parent.hasParent()).toBe(false);

            // Property: relationship should be retrievable
            const fetchedChild = await MenuItem.findByPk(child.id);
            expect(fetchedChild.parent_id).toBe(parent.id);

            return true;
          }
        ),
        fcConfig
      );
    }, 120000);

    it('should support multiple levels of nesting', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(titleArb, { minLength: 2, maxLength: 5 }),
          async (titles) => {
            let previousItem = null;

            // Create nested chain
            for (const title of titles) {
              const item = await menuService.addMenuItem(testMenu.id, {
                title,
                url: `/${title.toLowerCase().replace(/\s+/g, '-')}`,
                link_type: 'custom',
                parent_id: previousItem ? previousItem.id : null
              });

              if (previousItem) {
                // Property: each item should reference its parent
                expect(item.parent_id).toBe(previousItem.id);
                expect(item.hasParent()).toBe(true);
              } else {
                // Property: first item should be top level
                expect(item.parent_id).toBeNull();
                expect(item.isTopLevel()).toBe(true);
              }

              previousItem = item;
            }

            return true;
          }
        ),
        { numRuns: 50 }
      );
    }, 120000);

    it('should support multiple children for same parent', async () => {
      await fc.assert(
        fc.asyncProperty(
          titleArb,
          fc.array(titleArb, { minLength: 1, maxLength: 10 }),
          async (parentTitle, childTitles) => {
            // Create parent
            const parent = await menuService.addMenuItem(testMenu.id, {
              title: parentTitle,
              url: '/parent',
              link_type: 'custom'
            });

            // Create multiple children
            const children = [];
            for (const childTitle of childTitles) {
              const child = await menuService.addMenuItem(testMenu.id, {
                title: childTitle,
                url: `/child-${childTitle}`,
                link_type: 'custom',
                parent_id: parent.id
              });
              children.push(child);
            }

            // Property: all children should reference same parent
            for (const child of children) {
              expect(child.parent_id).toBe(parent.id);
              expect(child.hasParent()).toBe(true);
            }

            // Property: all children should be retrievable
            const allChildren = await MenuItem.findAll({
              where: { parent_id: parent.id }
            });

            expect(allChildren.length).toBe(childTitles.length);

            return true;
          }
        ),
        { numRuns: 50 }
      );
    }, 120000);

    it('should maintain nesting in menu retrieval', async () => {
      await fc.assert(
        fc.asyncProperty(
          titleArb,
          titleArb,
          async (parentTitle, childTitle) => {
            // Create parent and child
            const parent = await menuService.addMenuItem(testMenu.id, {
              title: parentTitle,
              url: '/parent',
              link_type: 'custom',
              sort_order: 0
            });

            await menuService.addMenuItem(testMenu.id, {
              title: childTitle,
              url: '/child',
              link_type: 'custom',
              parent_id: parent.id,
              sort_order: 0
            });

            // Retrieve menu with nested structure
            const menu = await menuService.findById(testMenu.id);

            // Property: menu should have nested structure
            expect(menu.items).toBeDefined();
            expect(menu.items.length).toBe(1);
            expect(menu.items[0].title).toBe(parentTitle);
            expect(menu.items[0].children).toBeDefined();
            expect(menu.items[0].children.length).toBe(1);
            expect(menu.items[0].children[0].title).toBe(childTitle);

            return true;
          }
        ),
        fcConfig
      );
    }, 120000);
  });

  describe('Edge cases for menu item nesting', () => {
    it('should handle single level items (no nesting)', async () => {
      const item = await menuService.addMenuItem(testMenu.id, {
        title: 'Top Level Item',
        url: '/top',
        link_type: 'custom'
      });

      expect(item.parent_id).toBeNull();
      expect(item.isTopLevel()).toBe(true);
      expect(item.hasParent()).toBe(false);
    });

    it('should handle two-level nesting', async () => {
      const parent = await menuService.addMenuItem(testMenu.id, {
        title: 'Parent',
        url: '/parent',
        link_type: 'custom'
      });

      const child = await menuService.addMenuItem(testMenu.id, {
        title: 'Child',
        url: '/child',
        link_type: 'custom',
        parent_id: parent.id
      });

      expect(child.parent_id).toBe(parent.id);
      expect(parent.parent_id).toBeNull();
    });

    it('should handle three-level nesting', async () => {
      const grandparent = await menuService.addMenuItem(testMenu.id, {
        title: 'Grandparent',
        url: '/grandparent',
        link_type: 'custom'
      });

      const parent = await menuService.addMenuItem(testMenu.id, {
        title: 'Parent',
        url: '/parent',
        link_type: 'custom',
        parent_id: grandparent.id
      });

      const child = await menuService.addMenuItem(testMenu.id, {
        title: 'Child',
        url: '/child',
        link_type: 'custom',
        parent_id: parent.id
      });

      expect(child.parent_id).toBe(parent.id);
      expect(parent.parent_id).toBe(grandparent.id);
      expect(grandparent.parent_id).toBeNull();
    });

    it('should handle multiple siblings', async () => {
      const parent = await menuService.addMenuItem(testMenu.id, {
        title: 'Parent',
        url: '/parent',
        link_type: 'custom'
      });

      const child1 = await menuService.addMenuItem(testMenu.id, {
        title: 'Child 1',
        url: '/child1',
        link_type: 'custom',
        parent_id: parent.id
      });

      const child2 = await menuService.addMenuItem(testMenu.id, {
        title: 'Child 2',
        url: '/child2',
        link_type: 'custom',
        parent_id: parent.id
      });

      const child3 = await menuService.addMenuItem(testMenu.id, {
        title: 'Child 3',
        url: '/child3',
        link_type: 'custom',
        parent_id: parent.id
      });

      expect(child1.parent_id).toBe(parent.id);
      expect(child2.parent_id).toBe(parent.id);
      expect(child3.parent_id).toBe(parent.id);

      const siblings = await MenuItem.findAll({
        where: { parent_id: parent.id }
      });

      expect(siblings.length).toBe(3);
    });

    it('should handle mixed top-level and nested items', async () => {
      const topLevel1 = await menuService.addMenuItem(testMenu.id, {
        title: 'Top Level 1',
        url: '/top1',
        link_type: 'custom'
      });

      const topLevel2 = await menuService.addMenuItem(testMenu.id, {
        title: 'Top Level 2',
        url: '/top2',
        link_type: 'custom'
      });

      const child = await menuService.addMenuItem(testMenu.id, {
        title: 'Child of Top 1',
        url: '/child',
        link_type: 'custom',
        parent_id: topLevel1.id
      });

      expect(topLevel1.parent_id).toBeNull();
      expect(topLevel2.parent_id).toBeNull();
      expect(child.parent_id).toBe(topLevel1.id);

      const menu = await menuService.findById(testMenu.id);
      expect(menu.items.length).toBe(2); // Two top-level items
      expect(menu.items[0].children.length).toBe(1); // One has a child
    });
  });

  describe('Validation for menu item nesting', () => {
    it('should reject non-existent parent', async () => {
      await expect(
        menuService.addMenuItem(testMenu.id, {
          title: 'Child',
          url: '/child',
          link_type: 'custom',
          parent_id: 99999
        })
      ).rejects.toThrow('Parent menu item not found');
    });

    it('should reject parent from different menu', async () => {
      // Create another menu
      const otherMenu = await Menu.create({
        name: 'Other Menu',
        location: 'footer'
      });

      // Create item in other menu
      const otherItem = await menuService.addMenuItem(otherMenu.id, {
        title: 'Other Item',
        url: '/other',
        link_type: 'custom'
      });

      // Try to use it as parent in test menu
      await expect(
        menuService.addMenuItem(testMenu.id, {
          title: 'Child',
          url: '/child',
          link_type: 'custom',
          parent_id: otherItem.id
        })
      ).rejects.toThrow('Parent menu item not found or belongs to different menu');
    });

    it('should prevent circular reference (item as own parent)', async () => {
      const item = await menuService.addMenuItem(testMenu.id, {
        title: 'Item',
        url: '/item',
        link_type: 'custom'
      });

      await expect(
        menuService.updateMenuItem(testMenu.id, item.id, {
          parent_id: item.id
        })
      ).rejects.toThrow('Menu item cannot be its own parent');
    });

    it('should prevent circular reference (descendant as parent)', async () => {
      const grandparent = await menuService.addMenuItem(testMenu.id, {
        title: 'Grandparent',
        url: '/grandparent',
        link_type: 'custom'
      });

      const parent = await menuService.addMenuItem(testMenu.id, {
        title: 'Parent',
        url: '/parent',
        link_type: 'custom',
        parent_id: grandparent.id
      });

      const child = await menuService.addMenuItem(testMenu.id, {
        title: 'Child',
        url: '/child',
        link_type: 'custom',
        parent_id: parent.id
      });

      // Try to make grandparent a child of child (circular)
      await expect(
        menuService.updateMenuItem(testMenu.id, grandparent.id, {
          parent_id: child.id
        })
      ).rejects.toThrow('Cannot set a descendant as parent');
    });
  });

  describe('Nested structure retrieval', () => {
    it('should build correct nested structure', async () => {
      // Create complex structure
      const parent1 = await menuService.addMenuItem(testMenu.id, {
        title: 'Parent 1',
        url: '/p1',
        link_type: 'custom',
        sort_order: 0
      });

      const parent2 = await menuService.addMenuItem(testMenu.id, {
        title: 'Parent 2',
        url: '/p2',
        link_type: 'custom',
        sort_order: 1
      });

      await menuService.addMenuItem(testMenu.id, {
        title: 'Child 1.1',
        url: '/c11',
        link_type: 'custom',
        parent_id: parent1.id,
        sort_order: 0
      });

      await menuService.addMenuItem(testMenu.id, {
        title: 'Child 1.2',
        url: '/c12',
        link_type: 'custom',
        parent_id: parent1.id,
        sort_order: 1
      });

      await menuService.addMenuItem(testMenu.id, {
        title: 'Child 2.1',
        url: '/c21',
        link_type: 'custom',
        parent_id: parent2.id,
        sort_order: 0
      });

      const menu = await menuService.findById(testMenu.id);

      expect(menu.items.length).toBe(2);
      expect(menu.items[0].title).toBe('Parent 1');
      expect(menu.items[0].children.length).toBe(2);
      expect(menu.items[1].title).toBe('Parent 2');
      expect(menu.items[1].children.length).toBe(1);
    });
  });
});
