import * as userService from './user.service.js';
import { successResponse, createdResponse, paginatedResponse, noContentResponse } from '../../utils/response.js';
import { asyncHandler } from '../../middlewares/errorHandler.js';

/**
 * User Controller
 * Handles HTTP requests for user management
 */

/**
 * Get all users (admin only)
 * GET /users
 */
export const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, search, role, status } = req.query;

  const result = await userService.findAll({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    search,
    role,
    status
  });

  return paginatedResponse(
    res,
    result.users,
    result.total,
    result.page,
    result.limit,
    'Users retrieved successfully'
  );
});

/**
 * Get user by ID (admin or self)
 * GET /users/:id
 */
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await userService.findById(parseInt(id));

  return successResponse(res, user, 'User retrieved successfully');
});

/**
 * Create new user (admin only)
 * POST /users
 */
export const createUser = asyncHandler(async (req, res) => {
  const userData = req.body;
  const user = await userService.create(userData);

  return createdResponse(res, user, 'User created successfully');
});

/**
 * Update user (admin or self)
 * PUT /users/:id
 */
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userData = req.body;

  const user = await userService.update(parseInt(id), userData);

  return successResponse(res, user, 'User updated successfully');
});

/**
 * Delete user (admin only)
 * DELETE /users/:id
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await userService.deleteUser(parseInt(id));

  return noContentResponse(res);
});

/**
 * Update user password
 * PUT /users/:id/password
 */
export const updatePassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;

  await userService.updatePassword(parseInt(id), oldPassword, newPassword);

  return successResponse(res, null, 'Password updated successfully');
});

/**
 * Get user statistics (admin only)
 * GET /users/stats
 */
export const getUserStats = asyncHandler(async (req, res) => {
  const stats = await userService.countByRole();

  return successResponse(res, stats, 'User statistics retrieved successfully');
});

export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updatePassword,
  getUserStats
};
