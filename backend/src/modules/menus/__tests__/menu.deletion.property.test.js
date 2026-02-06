import { describe, beforeAll, beforeEach, afterAll, it, expect } from '@jest/globals';
import fc from 'fast-check';
import sequelize from '../../../config/database.js';
import { setupAssociations } from '../../../config/associations.js';
import Menu from '../menu.model.js';
import MenuItem from '../menu-item.model.js';
import * as menuService from '../menu.service.js';

/**
 * Property-Based Tests for Menu Deletion
 * Feature: cms-system, Property 45: Menu deletion cascades to items
 * Feature: cms-system, Property 46: Menu item deletion cascades to children
 * Validates: Requirements 8.6, 8.7
 */

describe('Menu Deletion - Property Tests', () => {
  beforeAll(async () => {
    setupAssociations();
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await MenuItem.destroy({ where: {}, truncate: true });
    await Menu.destroy({ where: {}, truncate: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  // Configure fast-check to run 100 iterations minimum
  const fcConfig = { numRuns: 100 };

  /**
   * Property 45: Menu deletion cascades to items
   * For any menu with menu items, when the menu is deleted,
   * all associated menu items should also be deleted.
   */
  describe('Property 45: Menu deletion cascades to items', () => {
    // Generator for valid menu names
    const menuNameArb = fc.string({ minLength: 2, maxLength: 100 })
      .filter(s => s.trim().length >= 2);

    // Generator for menu locations
    const locationArb = fc.constantFrom('header', 'footer', 'sidebar', 'mobile');

    // Generator for menu item titles
    const titleArb = fc.string({ minLength: 1, maxLength: 100 })
      .filter(s => s.trim().length >= 1);

    it('should delete all menu items when menu is deleted', async () => {
      await fc.assert(
        fc.asyncProperty(
          menuNameArb,
          locationArb,
          fc.array(titleArb, { minLength: 1, maxLength: 10 }),
          async (menuName, location, itemTitles) => {
            // Create menu
            const menu = await Menu.create({
              name: menuName,
              location,
              description: 'Test menu'
            });

            // Create menu items
            const items = [];
            for (let i = 0; i < itemTitles.length; i++) {
              const item = await MenuItem.create({
                menu_id: menu.id,
                title: itemTitles[i],
                url: `/item-${i}`,
                link_type: 'custom',
                sort_order: i
              });
              items.push(item);
            }

            // Verify items exist
            const itemCountBefore = await MenuItem.count({ where: { menu_id: menu.id } });
            expect(itemCountBefore).toBe(itemTitles.length);

            // Delete menu
            await menuService.deleteMenu(menu.id);

            // Property: all menu items should be deleted
            const itemCountAfter = await MenuItem.count({ where: { menu_id: menu.id } });
            expect(itemCountAfter).toBe(0);

            // Property: menu should not exist
            const menuExists = await Menu.findByPk(menu.id);
            expect(menuExists).toBeNull();

            // Property: none of the item IDs should exist
            for (const item of items) {
              const itemExists = await MenuItem.findByPk(item.id);
              expect(itemExists).toBeNull();
            }

            return true;
          }
        ),
        fcConfig
      );
    }, 120000);

    it('should delete nested menu items when menu is deleted', async () => {
      await fc.assert(
        fc.asyncProperty(
          menuNameArb,
          locationArb,
          fc.integer({ min: 1, max: 5 }),
          fc.integer({ min: 1, max: 3 }),
          async (menuName, location, parentCount, childrenPerParent) => {
            // Create menu
            const menu = await Menu.create({
              name: menuName,
              location,
              description: 'Test menu with nested items'
            });

            let totalItems = 0;

            // Create parent items with children
            for (let i = 0; i < parentCount; i++) {
              const parent = await MenuItem.create({
                menu_id: menu.id,
                title: `Parent ${i}`,
                url: `/parent-${i}`,
                link_type: 'custom',
                sort_order: i
              });
              totalItems++;

              // Create children for this parent
              for (let j = 0; j < childrenPerParent; j++) {
                await MenuItem.create({
                  menu_id: menu.id,
                  parent_id: parent.id,
                  title: `Child ${i}-${j}`,
                  url: `/child-${i}-${j}`,
                  link_type: 'custom',
                  sort_order: j
                });
                totalItems++;
              }
            }

            // Verify all items exist
            const itemCountBefore = await MenuItem.count({ where: { menu_id: menu.id } });
            expect(itemCountBefore).toBe(totalItems);

            // Delete menu
            await menuService.deleteMenu(menu.id);

            // Property: all items (parents and children) should be deleted
            const itemCountAfter = await MenuItem.count({ where: { menu_id: menu.id } });
            expect(itemCountAfter).toBe(0);

            return true;
          }
        ),
        { numRuns: 50 }
      );
    }, 120000);

    it('should only delete items from the deleted menu', async () => {
      await fc.assert(
        fc.asyncProperty(
          menuNameArb,
          menuNameArb,
          fc.array(titleArb, { minLength: 1, maxLength: 5 }),
          fc.array(titleArb, { minLength: 1, maxLength: 5 }),
          async (menu1Name, menu2Name, items1Titles, items2Titles) => {
            // Create two menus with different locations
            const menu1 = await Menu.create({
              name: menu1Name,
              location: 'header',
              description: 'Menu 1'
            });

            const menu2 = await Menu.create({
              name: menu2Name,
              location: 'footer',
              description: 'Menu 2'
            });

            // Create items for menu 1
            for (const title of items1Titles) {
              await MenuItem.create({
                menu_id: menu1.id,
                title,
                url: `/${title}`,
                link_type: 'custom'
              });
            }

            // Create items for menu 2
            for (const title of items2Titles) {
              await MenuItem.create({
                menu_id: menu2.id,
                title,
                url: `/${title}`,
                link_type: 'custom'
              });
            }

            // Delete menu 1
            await menuService.deleteMenu(menu1.id);

            // Property: menu 1 items should be deleted
            const menu1ItemsCount = await MenuItem.count({ where: { menu_id: menu1.id } });
            expect(menu1ItemsCount).toBe(0);

            // Property: menu 2 items should still exist
            const menu2ItemsCount = await MenuItem.count({ where: { menu_id: menu2.id } });
            expect(menu2ItemsCount).toBe(items2Titles.length);

            // Property: menu 2 should still exist
            const menu2Exists = await Menu.findByPk(menu2.id);
            expect(menu2Exists).not.toBeNull();

            return true;
          }
        ),
        { numRuns: 50 }
      );
    }, 120000);
  });

  /**
   * Property 46: Menu item deletion cascades to children
   * For any menu item with child items, when the item is deleted,
   * all child items should also be deleted.
   */
  describe('Property 46: Menu item deletion cascades to children', () => {
    let testMenu;

    beforeEach(async () => {
      testMenu = await Menu.create({
        name: 'Test Menu',
        location: 'header',
        description: 'Test menu for property tests'
      });
    });

    // Generator for menu item titles
    const titleArb = fc.string({ minLength: 1, maxLength: 100 })
      .filter(s => s.trim().length >= 1);

    it('should delete all children when parent item is deleted', async () => {
      await fc.assert(
        fc.asyncProperty(
          titleArb,
          fc.array(titleArb, { minLength: 1, maxLength: 10 }),
          async (parentTitle, childTitles) => {
            // Create parent item
            const parent = await MenuItem.create({
              menu_id: testMenu.id,
              title: parentTitle,
              url: '/parent',
              link_type: 'custom'
            });

            // Create child items
            const children = [];
            for (let i = 0; i < childTitles.length; i++) {
              const child = await MenuItem.create({
                menu_id: testMenu.id,
                parent_id: parent.id,
                title: childTitles[i],
                url: `/child-${i}`,
                link_type: 'custom',
                sort_order: i
              });
              children.push(child);
            }

            // Verify children exist
            const childCountBefore = await MenuItem.count({ where: { parent_id: parent.id } });
            expect(childCountBefore).toBe(childTitles.length);

            // Delete parent
            await menuService.deleteMenuItem(testMenu.id, parent.id);

            // Property: all children should be deleted
            const childCountAfter = await MenuItem.count({ where: { parent_id: parent.id } });
            expect(childCountAfter).toBe(0);

            // Property: parent should not exist
            const parentExists = await MenuItem.findByPk(parent.id);
            expect(parentExists).toBeNull();

            // Property: none of the child IDs should exist
            for (const child of children) {
              const childExists = await MenuItem.findByPk(child.id);
              expect(childExists).toBeNull();
            }

            return true;
          }
        ),
        fcConfig
      );
    }, 120000);

    it('should delete nested descendants when ancestor is deleted', async () => {
      await fc.assert(
        fc.asyncProperty(
          titleArb,
          titleArb,
          titleArb,
          async (grandparentTitle, parentTitle, childTitle) => {
            // Create three-level hierarchy
            const grandparent = await MenuItem.create({
              menu_id: testMenu.id,
              title: grandparentTitle,
              url: '/grandparent',
              link_type: 'custom'
            });

            const parent = await MenuItem.create({
              menu_id: testMenu.id,
              parent_id: grandparent.id,
              title: parentTitle,
              url: '/parent',
              link_type: 'custom'
            });

            const child = await MenuItem.create({
              menu_id: testMenu.id,
              parent_id: parent.id,
              title: childTitle,
              url: '/child',
              link_type: 'custom'
            });

            // Delete grandparent
            await menuService.deleteMenuItem(testMenu.id, grandparent.id);

            // Property: all descendants should be deleted
            const grandparentExists = await MenuItem.findByPk(grandparent.id);
            const parentExists = await MenuItem.findByPk(parent.id);
            const childExists = await MenuItem.findByPk(child.id);

            expect(grandparentExists).toBeNull();
            expect(parentExists).toBeNull();
            expect(childExists).toBeNull();

            return true;
          }
        ),
        fcConfig
      );
    }, 120000);

    it('should only delete children of deleted item, not siblings', async () => {
      await fc.assert(
        fc.asyncProperty(
          titleArb,
          fc.array(titleArb, { minLength: 2, maxLength: 5 }),
          fc.integer({ min: 0, max: 4 }),
          async (parentTitle, childTitles, deleteIndex) => {
            // Ensure deleteIndex is valid
            const actualDeleteIndex = deleteIndex % childTitles.length;

            // Create parent
            const parent = await MenuItem.create({
              menu_id: testMenu.id,
              title: parentTitle,
              url: '/parent',
              link_type: 'custom'
            });

            // Create children
            const children = [];
            for (let i = 0; i < childTitles.length; i++) {
              const child = await MenuItem.create({
                menu_id: testMenu.id,
                parent_id: parent.id,
                title: childTitles[i],
                url: `/child-${i}`,
                link_type: 'custom',
                sort_order: i
              });
              children.push(child);
            }

            // Create grandchildren for the child we'll delete
            const targetChild = children[actualDeleteIndex];
            const grandchild = await MenuItem.create({
              menu_id: testMenu.id,
              parent_id: targetChild.id,
              title: 'Grandchild',
              url: '/grandchild',
              link_type: 'custom'
            });

            // Delete one child
            await menuService.deleteMenuItem(testMenu.id, targetChild.id);

            // Property: deleted child should not exist
            const deletedChildExists = await MenuItem.findByPk(targetChild.id);
            expect(deletedChildExists).toBeNull();

            // Property: grandchild should also be deleted
            const grandchildExists = await MenuItem.findByPk(grandchild.id);
            expect(grandchildExists).toBeNull();

            // Property: siblings should still exist
            for (let i = 0; i < children.length; i++) {
              if (i !== actualDeleteIndex) {
                const siblingExists = await MenuItem.findByPk(children[i].id);
                expect(siblingExists).not.toBeNull();
              }
            }

            // Property: parent should still exist
            const parentExists = await MenuItem.findByPk(parent.id);
            expect(parentExists).not.toBeNull();

            return true;
          }
        ),
        { numRuns: 50 }
      );
    }, 120000);

    it('should handle deletion of items with multiple levels of descendants', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 2, max: 4 }),
          async (depth) => {
            // Create a chain of nested items
            let previousItem = null;
            const allItems = [];

            for (let i = 0; i < depth; i++) {
              const item = await MenuItem.create({
                menu_id: testMenu.id,
                parent_id: previousItem ? previousItem.id : null,
                title: `Level ${i}`,
                url: `/level-${i}`,
                link_type: 'custom'
              });
              allItems.push(item);
              previousItem = item;
            }

            // Delete the root item
            await menuService.deleteMenuItem(testMenu.id, allItems[0].id);

            // Property: all items in the chain should be deleted
            for (const item of allItems) {
              const itemExists = await MenuItem.findByPk(item.id);
              expect(itemExists).toBeNull();
            }

            return true;
          }
        ),
        fcConfig
      );
    }, 120000);
  });

  describe('Edge cases for menu deletion', () => {
    it('should handle deletion of menu with no items', async () => {
      const menu = await Menu.create({
        name: 'Empty Menu',
        location: 'header',
        description: 'Menu with no items'
      });

      await menuService.deleteMenu(menu.id);

      const menuExists = await Menu.findByPk(menu.id);
      expect(menuExists).toBeNull();
    });

    it('should handle deletion of menu with single item', async () => {
      const menu = await Menu.create({
        name: 'Single Item Menu',
        location: 'footer',
        description: 'Menu with one item'
      });

      const item = await MenuItem.create({
        menu_id: menu.id,
        title: 'Single Item',
        url: '/single',
        link_type: 'custom'
      });

      await menuService.deleteMenu(menu.id);

      const menuExists = await Menu.findByPk(menu.id);
      const itemExists = await MenuItem.findByPk(item.id);

      expect(menuExists).toBeNull();
      expect(itemExists).toBeNull();
    });

    it('should handle deletion of menu with many items', async () => {
      const menu = await Menu.create({
        name: 'Large Menu',
        location: 'sidebar',
        description: 'Menu with many items'
      });

      const items = [];
      for (let i = 0; i < 50; i++) {
        const item = await MenuItem.create({
          menu_id: menu.id,
          title: `Item ${i}`,
          url: `/item-${i}`,
          link_type: 'custom',
          sort_order: i
        });
        items.push(item);
      }

      await menuService.deleteMenu(menu.id);

      const menuExists = await Menu.findByPk(menu.id);
      expect(menuExists).toBeNull();

      const itemCount = await MenuItem.count({ where: { menu_id: menu.id } });
      expect(itemCount).toBe(0);
    });
  });

  describe('Edge cases for menu item deletion', () => {
    let testMenu;

    beforeEach(async () => {
      testMenu = await Menu.create({
        name: 'Test Menu',
        location: 'header',
        description: 'Test menu'
      });
    });

    it('should handle deletion of item with no children', async () => {
      const item = await MenuItem.create({
        menu_id: testMenu.id,
        title: 'Childless Item',
        url: '/childless',
        link_type: 'custom'
      });

      await menuService.deleteMenuItem(testMenu.id, item.id);

      const itemExists = await MenuItem.findByPk(item.id);
      expect(itemExists).toBeNull();
    });

    it('should handle deletion of item with single child', async () => {
      const parent = await MenuItem.create({
        menu_id: testMenu.id,
        title: 'Parent',
        url: '/parent',
        link_type: 'custom'
      });

      const child = await MenuItem.create({
        menu_id: testMenu.id,
        parent_id: parent.id,
        title: 'Child',
        url: '/child',
        link_type: 'custom'
      });

      await menuService.deleteMenuItem(testMenu.id, parent.id);

      const parentExists = await MenuItem.findByPk(parent.id);
      const childExists = await MenuItem.findByPk(child.id);

      expect(parentExists).toBeNull();
      expect(childExists).toBeNull();
    });

    it('should handle deletion of item with many children', async () => {
      const parent = await MenuItem.create({
        menu_id: testMenu.id,
        title: 'Parent',
        url: '/parent',
        link_type: 'custom'
      });

      const children = [];
      for (let i = 0; i < 20; i++) {
        const child = await MenuItem.create({
          menu_id: testMenu.id,
          parent_id: parent.id,
          title: `Child ${i}`,
          url: `/child-${i}`,
          link_type: 'custom',
          sort_order: i
        });
        children.push(child);
      }

      await menuService.deleteMenuItem(testMenu.id, parent.id);

      const parentExists = await MenuItem.findByPk(parent.id);
      expect(parentExists).toBeNull();

      const childCount = await MenuItem.count({ where: { parent_id: parent.id } });
      expect(childCount).toBe(0);
    });

    it('should handle deletion of middle item in chain', async () => {
      const grandparent = await MenuItem.create({
        menu_id: testMenu.id,
        title: 'Grandparent',
        url: '/grandparent',
        link_type: 'custom'
      });

      const parent = await MenuItem.create({
        menu_id: testMenu.id,
        parent_id: grandparent.id,
        title: 'Parent',
        url: '/parent',
        link_type: 'custom'
      });

      const child = await MenuItem.create({
        menu_id: testMenu.id,
        parent_id: parent.id,
        title: 'Child',
        url: '/child',
        link_type: 'custom'
      });

      // Delete middle item
      await menuService.deleteMenuItem(testMenu.id, parent.id);

      const grandparentExists = await MenuItem.findByPk(grandparent.id);
      const parentExists = await MenuItem.findByPk(parent.id);
      const childExists = await MenuItem.findByPk(child.id);

      expect(grandparentExists).not.toBeNull(); // Grandparent should remain
      expect(parentExists).toBeNull(); // Parent should be deleted
      expect(childExists).toBeNull(); // Child should be deleted (cascade)
    });
  });

  describe('Validation for deletion', () => {
    it('should throw error when deleting non-existent menu', async () => {
      await expect(
        menuService.deleteMenu(99999)
      ).rejects.toThrow('Menu not found');
    });

    it('should throw error when deleting non-existent menu item', async () => {
      const menu = await Menu.create({
        name: 'Test Menu',
        location: 'header'
      });

      await expect(
        menuService.deleteMenuItem(menu.id, 99999)
      ).rejects.toThrow('Menu item not found');
    });

    it('should throw error when deleting item from wrong menu', async () => {
      const menu1 = await Menu.create({
        name: 'Menu 1',
        location: 'header'
      });

      const menu2 = await Menu.create({
        name: 'Menu 2',
        location: 'footer'
      });

      const item = await MenuItem.create({
        menu_id: menu2.id,
        title: 'Item',
        url: '/item',
        link_type: 'custom'
      });

      await expect(
        menuService.deleteMenuItem(menu1.id, item.id)
      ).rejects.toThrow('Menu item not found');
    });
  });

  describe('Idempotence of deletion', () => {
    it('should handle double deletion of menu gracefully', async () => {
      const menu = await Menu.create({
        name: 'Test Menu',
        location: 'header'
      });

      await menuService.deleteMenu(menu.id);

      // Second deletion should throw error
      await expect(
        menuService.deleteMenu(menu.id)
      ).rejects.toThrow('Menu not found');
    });

    it('should handle double deletion of menu item gracefully', async () => {
      const menu = await Menu.create({
        name: 'Test Menu',
        location: 'header'
      });

      const item = await MenuItem.create({
        menu_id: menu.id,
        title: 'Item',
        url: '/item',
        link_type: 'custom'
      });

      await menuService.deleteMenuItem(menu.id, item.id);

      // Second deletion should throw error
      await expect(
        menuService.deleteMenuItem(menu.id, item.id)
      ).rejects.toThrow('Menu item not found');
    });
  });
});
