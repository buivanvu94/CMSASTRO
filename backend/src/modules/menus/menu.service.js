import { Op } from 'sequelize';
import Menu from './menu.model.js';
import MenuItem from './menu-item.model.js';
import { NotFoundError, ValidationError } from '../../middlewares/errorHandler.js';

/**
 * Menu Service
 * Business logic for menu management
 */

/**
 * Build nested menu structure from flat array
 * @param {Array} items - Flat array of menu items
 * @param {number} parentId - Parent ID to filter by
 * @returns {Array} - Nested menu structure
 */
const buildNestedStructure = (items, parentId = null) => {
  return items
    .filter(item => item.parent_id === parentId)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(item => ({
      ...item.toJSON(),
      children: buildNestedStructure(items, item.id)
    }));
};

/**
 * Find all menus
 * @returns {Promise<Array>} - Array of menus
 */
export const findAll = async () => {
  const menus = await Menu.findAll({
    order: [['name', 'ASC']]
  });

  return menus;
};

/**
 * Find menu by ID with nested items
 * @param {number} id - Menu ID
 * @returns {Promise<Object>} - Menu object with nested items
 * @throws {NotFoundError} - If menu not found
 */
export const findById = async (id) => {
  const menu = await Menu.findByPk(id, {
    include: [
      {
        model: MenuItem,
        as: 'items',
        order: [['sort_order', 'ASC']]
      }
    ]
  });

  if (!menu) {
    throw new NotFoundError('Menu not found');
  }

  // Build nested structure
  const menuData = menu.toJSON();
  menuData.items = buildNestedStructure(menuData.items);

  return menuData;
};

/**
 * Find menu by location with nested items
 * @param {string} location - Menu location
 * @returns {Promise<Object>} - Menu object with nested items
 * @throws {NotFoundError} - If menu not found
 */
export const findByLocation = async (location) => {
  const menu = await Menu.findOne({
    where: { location },
    include: [
      {
        model: MenuItem,
        as: 'items',
        where: { is_active: true },
        required: false,
        order: [['sort_order', 'ASC']]
      }
    ]
  });

  if (!menu) {
    throw new NotFoundError(`Menu not found for location: ${location}`);
  }

  // Build nested structure
  const menuData = menu.toJSON();
  menuData.items = buildNestedStructure(menuData.items);

  return menuData;
};

/**
 * Create new menu
 * @param {Object} data - Menu data
 * @returns {Promise<Object>} - Created menu
 */
export const create = async (data) => {
  // Check if menu already exists for this location
  const existing = await Menu.findOne({ where: { location: data.location } });
  if (existing) {
    throw new ValidationError(`A menu already exists for location: ${data.location}`);
  }

  const menu = await Menu.create(data);
  return menu;
};

/**
 * Update menu
 * @param {number} id - Menu ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} - Updated menu
 */
export const update = async (id, data) => {
  const menu = await Menu.findByPk(id);

  if (!menu) {
    throw new NotFoundError('Menu not found');
  }

  // If location is being changed, check uniqueness
  if (data.location && data.location !== menu.location) {
    const existing = await Menu.findOne({ where: { location: data.location } });
    if (existing) {
      throw new ValidationError(`A menu already exists for location: ${data.location}`);
    }
  }

  await menu.update(data);
  return menu;
};

/**
 * Delete menu (cascades to items)
 * @param {number} id - Menu ID
 * @returns {Promise<void>}
 */
export const deleteMenu = async (id) => {
  const menu = await Menu.findByPk(id);

  if (!menu) {
    throw new NotFoundError('Menu not found');
  }

  await menu.destroy();
};

/**
 * Add menu item
 * @param {number} menuId - Menu ID
 * @param {Object} data - Menu item data
 * @returns {Promise<Object>} - Created menu item
 */
export const addMenuItem = async (menuId, data) => {
  // Verify menu exists
  const menu = await Menu.findByPk(menuId);
  if (!menu) {
    throw new NotFoundError('Menu not found');
  }

  // If parent_id is provided, verify it exists and belongs to same menu
  if (data.parent_id) {
    const parent = await MenuItem.findOne({
      where: {
        id: data.parent_id,
        menu_id: menuId
      }
    });

    if (!parent) {
      throw new NotFoundError('Parent menu item not found or belongs to different menu');
    }
  }

  const menuItem = await MenuItem.create({
    ...data,
    menu_id: menuId
  });

  return menuItem;
};

/**
 * Update menu item
 * @param {number} menuId - Menu ID
 * @param {number} itemId - Menu item ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} - Updated menu item
 */
export const updateMenuItem = async (menuId, itemId, data) => {
  const menuItem = await MenuItem.findOne({
    where: {
      id: itemId,
      menu_id: menuId
    }
  });

  if (!menuItem) {
    throw new NotFoundError('Menu item not found');
  }

  // If parent_id is being changed, verify it exists and prevent circular reference
  if (data.parent_id !== undefined) {
    if (data.parent_id === itemId) {
      throw new ValidationError('Menu item cannot be its own parent');
    }

    if (data.parent_id) {
      const parent = await MenuItem.findOne({
        where: {
          id: data.parent_id,
          menu_id: menuId
        }
      });

      if (!parent) {
        throw new NotFoundError('Parent menu item not found or belongs to different menu');
      }

      // Check if new parent is a descendant (would create circular reference)
      const descendants = await getDescendants(itemId);
      if (descendants.includes(data.parent_id)) {
        throw new ValidationError('Cannot set a descendant as parent (circular reference)');
      }
    }
  }

  await menuItem.update(data);
  return menuItem;
};

/**
 * Delete menu item (cascades to children)
 * @param {number} menuId - Menu ID
 * @param {number} itemId - Menu item ID
 * @returns {Promise<void>}
 */
export const deleteMenuItem = async (menuId, itemId) => {
  const menuItem = await MenuItem.findOne({
    where: {
      id: itemId,
      menu_id: menuId
    }
  });

  if (!menuItem) {
    throw new NotFoundError('Menu item not found');
  }

  await menuItem.destroy();
};

/**
 * Reorder menu items
 * @param {number} menuId - Menu ID
 * @param {Array} items - Array of {id, sort_order}
 * @returns {Promise<void>}
 */
export const reorderItems = async (menuId, items) => {
  // Verify menu exists
  const menu = await Menu.findByPk(menuId);
  if (!menu) {
    throw new NotFoundError('Menu not found');
  }

  // Update sort order for each item
  const updates = items.map(item =>
    MenuItem.update(
      { sort_order: item.sort_order },
      {
        where: {
          id: item.id,
          menu_id: menuId
        }
      }
    )
  );

  await Promise.all(updates);
};

/**
 * Get all descendants of a menu item
 * @param {number} itemId - Menu item ID
 * @returns {Promise<Array>} - Array of descendant IDs
 */
const getDescendants = async (itemId) => {
  const children = await MenuItem.findAll({
    where: { parent_id: itemId },
    attributes: ['id']
  });

  let descendants = children.map(c => c.id);

  for (const child of children) {
    const childDescendants = await getDescendants(child.id);
    descendants = descendants.concat(childDescendants);
  }

  return descendants;
};

export default {
  findAll,
  findById,
  findByLocation,
  create,
  update,
  deleteMenu,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  reorderItems
};
