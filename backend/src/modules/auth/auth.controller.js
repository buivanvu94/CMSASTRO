import * as authService from './auth.service.js';
import { findById } from '../users/user.service.js';
import { successResponse, createdResponse } from '../../utils/response.js';
import { asyncHandler } from '../../middlewares/errorHandler.js';

/**
 * Auth Controller
 * Handles HTTP requests for authentication
 */

/**
 * Login user
 * POST /auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.login(email, password);

  return successResponse(res, result, 'Login successful');
});

/**
 * Register new user
 * POST /auth/register
 */
export const register = asyncHandler(async (req, res) => {
  const userData = req.body;

  const result = await authService.register(userData);

  return createdResponse(res, result, 'Registration successful');
});

/**
 * Refresh access token
 * POST /auth/refresh
 */
export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  const result = await authService.refreshAccessToken(refreshToken);

  return successResponse(res, result, 'Token refreshed successfully');
});

/**
 * Logout user
 * POST /auth/logout
 */
export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  await authService.logout(refreshToken);

  return successResponse(res, null, 'Logout successful');
});

/**
 * Request password reset
 * POST /auth/forgot-password
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const result = await authService.requestPasswordReset(email);

  return successResponse(res, result, 'Password reset request processed');
});

/**
 * Reset password using reset token
 * POST /auth/reset-password
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const result = await authService.resetPassword(token, password);

  return successResponse(res, result, 'Password reset successful');
});

/**
 * Get current authenticated user
 * GET /auth/me
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  // req.user is set by authenticate middleware
  const user = await findById(req.user.id);

  return successResponse(res, user, 'User retrieved successfully');
});

export default {
  login,
  register,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  getCurrentUser
};
