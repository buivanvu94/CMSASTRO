import express from 'express';
import * as menuController from './menu.controller.js';
import * as menuValidation from './menu.validation.js';
import { authenticate } from '../../middlewares/auth.js';
import { authorize } from '../../middlewares/authorize.js';

const router = express.Router();

/**
 * Menu Routes
 * All routes require authentication (admin/editor)
 */

/**
 * GET /menus/location/:location
 * Get menu by location (public for frontend)
 */
router.get(
  '/location/:location',
  menuValidation.getMenuByLocationValidation,
  menuValidation.handleValidationErrors,
  menuController.getMenuByLocation
);

/**
 * GET /menus
 * List all menus
 */
router.get(
  '/',
  authenticate,
  authorize(['admin', 'editor']),
  menuController.getMenus
);

/**
 * GET /menus/:id
 * Get menu by ID with nested items
 */
router.get(
  '/:id',
  authenticate,
  authorize(['admin', 'editor']),
  menuValidation.getMenuByIdValidation,
  menuValidation.handleValidationErrors,
  menuController.getMenuById
);

/**
 * POST /menus
 * Create new menu
 */
router.post(
  '/',
  authenticate,
  authorize(['admin', 'editor']),
  menuValidation.createMenuValidation,
  menuValidation.handleValidationErrors,
  menuController.createMenu
);

/**
 * PUT /menus/:id
 * Update menu
 */
router.put(
  '/:id',
  authenticate,
  authorize(['admin', 'editor']),
  menuValidation.updateMenuValidation,
  menuValidation.handleValidationErrors,
  menuController.updateMenu
);

/**
 * DELETE /menus/:id
 * Delete menu
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['admin', 'editor']),
  menuValidation.deleteMenuValidation,
  menuValidation.handleValidationErrors,
  menuController.deleteMenu
);

/**
 * PUT /menus/:id/items/reorder
 * Reorder menu items
 */
router.put(
  '/:id/items/reorder',
  authenticate,
  authorize(['admin', 'editor']),
  menuValidation.reorderItemsValidation,
  menuValidation.handleValidationErrors,
  menuController.reorderItems
);

/**
 * POST /menus/:id/items
 * Add menu item
 */
router.post(
  '/:id/items',
  authenticate,
  authorize(['admin', 'editor']),
  menuValidation.addMenuItemValidation,
  menuValidation.handleValidationErrors,
  menuController.addMenuItem
);

/**
 * PUT /menus/:id/items/:itemId
 * Update menu item
 */
router.put(
  '/:id/items/:itemId',
  authenticate,
  authorize(['admin', 'editor']),
  menuValidation.updateMenuItemValidation,
  menuValidation.handleValidationErrors,
  menuController.updateMenuItem
);

/**
 * DELETE /menus/:id/items/:itemId
 * Delete menu item
 */
router.delete(
  '/:id/items/:itemId',
  authenticate,
  authorize(['admin', 'editor']),
  menuValidation.deleteMenuItemValidation,
  menuValidation.handleValidationErrors,
  menuController.deleteMenuItem
);

export default router;
