import * as menuService from './menu.service.js';
import {
  successResponse,
  createdResponse,
  noContentResponse
} from '../../utils/response.js';
import { asyncHandler } from '../../middlewares/errorHandler.js';

/**
 * Menu Controller
 * Handles HTTP requests for menu management
 */

/**
 * Get all menus
 * GET /menus
 */
export const getMenus = asyncHandler(async (req, res) => {
  const menus = await menuService.findAll();

  return successResponse(res, menus, 'Menus retrieved successfully');
});

/**
 * Get menu by ID with nested items
 * GET /menus/:id
 */
export const getMenuById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const menu = await menuService.findById(parseInt(id));

  return successResponse(res, menu, 'Menu retrieved successfully');
});

/**
 * Get menu by location with nested items
 * GET /menus/location/:location
 */
export const getMenuByLocation = asyncHandler(async (req, res) => {
  const { location } = req.params;
  const menu = await menuService.findByLocation(location);

  return successResponse(res, menu, 'Menu retrieved successfully');
});

/**
 * Create new menu
 * POST /menus
 */
export const createMenu = asyncHandler(async (req, res) => {
  const data = req.body;
  const menu = await menuService.create(data);

  return createdResponse(res, menu, 'Menu created successfully');
});

/**
 * Update menu
 * PUT /menus/:id
 */
export const updateMenu = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const menu = await menuService.update(parseInt(id), data);

  return successResponse(res, menu, 'Menu updated successfully');
});

/**
 * Delete menu
 * DELETE /menus/:id
 */
export const deleteMenu = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await menuService.deleteMenu(parseInt(id));

  return noContentResponse(res);
});

/**
 * Add menu item
 * POST /menus/:id/items
 */
export const addMenuItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const menuItem = await menuService.addMenuItem(parseInt(id), data);

  return createdResponse(res, menuItem, 'Menu item added successfully');
});

/**
 * Update menu item
 * PUT /menus/:id/items/:itemId
 */
export const updateMenuItem = asyncHandler(async (req, res) => {
  const { id, itemId } = req.params;
  const data = req.body;

  const menuItem = await menuService.updateMenuItem(
    parseInt(id),
    parseInt(itemId),
    data
  );

  return successResponse(res, menuItem, 'Menu item updated successfully');
});

/**
 * Delete menu item
 * DELETE /menus/:id/items/:itemId
 */
export const deleteMenuItem = asyncHandler(async (req, res) => {
  const { id, itemId } = req.params;

  await menuService.deleteMenuItem(parseInt(id), parseInt(itemId));

  return noContentResponse(res);
});

/**
 * Reorder menu items
 * PUT /menus/:id/items/reorder
 */
export const reorderItems = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { items } = req.body;

  await menuService.reorderItems(parseInt(id), items);

  return successResponse(res, null, 'Menu items reordered successfully');
});

export default {
  getMenus,
  getMenuById,
  getMenuByLocation,
  createMenu,
  updateMenu,
  deleteMenu,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  reorderItems
};
