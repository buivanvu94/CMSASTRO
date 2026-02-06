import express from 'express';
import * as userController from './user.controller.js';
import * as userValidation from './user.validation.js';
import { authenticate } from '../../middlewares/auth.js';
import { adminOnly, canAccessProfile } from '../../middlewares/authorize.js';

const router = express.Router();

/**
 * User Routes
 * All routes require authentication
 */

/**
 * GET /users/stats
 * Get user statistics (admin only)
 */
router.get(
  '/stats',
  authenticate,
  adminOnly,
  userController.getUserStats
);

/**
 * GET /users
 * List all users with pagination and filters (admin only)
 */
router.get(
  '/',
  authenticate,
  adminOnly,
  userValidation.getUsersValidation,
  userValidation.handleValidationErrors,
  userController.getUsers
);

/**
 * GET /users/:id
 * Get user by ID (admin or self)
 */
router.get(
  '/:id',
  authenticate,
  canAccessProfile('id'),
  userValidation.getUserByIdValidation,
  userValidation.handleValidationErrors,
  userController.getUserById
);

/**
 * POST /users
 * Create new user (admin only)
 */
router.post(
  '/',
  authenticate,
  adminOnly,
  userValidation.createUserValidation,
  userValidation.handleValidationErrors,
  userController.createUser
);

/**
 * PUT /users/:id
 * Update user (admin or self)
 */
router.put(
  '/:id',
  authenticate,
  canAccessProfile('id'),
  userValidation.updateUserValidation,
  userValidation.handleValidationErrors,
  userController.updateUser
);

/**
 * PUT /users/:id/password
 * Update user password (admin or self)
 */
router.put(
  '/:id/password',
  authenticate,
  canAccessProfile('id'),
  userValidation.updatePasswordValidation,
  userValidation.handleValidationErrors,
  userController.updatePassword
);

/**
 * DELETE /users/:id
 * Delete user (admin only)
 */
router.delete(
  '/:id',
  authenticate,
  adminOnly,
  userValidation.deleteUserValidation,
  userValidation.handleValidationErrors,
  userController.deleteUser
);

export default router;
