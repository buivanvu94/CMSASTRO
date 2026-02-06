import express from 'express';
import * as authController from './auth.controller.js';
import * as authValidation from './auth.validation.js';
import { authenticate } from '../../middlewares/auth.js';

const router = express.Router();

/**
 * Auth Routes
 * Public routes for authentication
 */

/**
 * POST /auth/login
 * User login
 */
router.post(
  '/login',
  authValidation.loginValidation,
  authValidation.handleValidationErrors,
  authController.login
);

/**
 * POST /auth/register
 * User registration
 */
router.post(
  '/register',
  authValidation.registerValidation,
  authValidation.handleValidationErrors,
  authController.register
);

/**
 * POST /auth/refresh
 * Refresh access token
 */
router.post(
  '/refresh',
  authValidation.refreshTokenValidation,
  authValidation.handleValidationErrors,
  authController.refresh
);

/**
 * POST /auth/logout
 * User logout
 */
router.post(
  '/logout',
  authValidation.logoutValidation,
  authValidation.handleValidationErrors,
  authController.logout
);

/**
 * GET /auth/me
 * Get current authenticated user
 * Requires authentication
 */
router.get(
  '/me',
  authenticate,
  authController.getCurrentUser
);

export default router;
