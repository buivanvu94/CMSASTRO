import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import User from './user.model.js';
import { NotFoundError, ConflictError } from '../../middlewares/errorHandler.js';

/**
 * User Service
 * Business logic for user management
 */

/**
 * Hash password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
export const hashPassword = async (password) => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} - True if password matches
 */
export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

/**
 * Find all users with pagination and search
 * @param {Object} options - Query options
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @param {string} options.search - Search query
 * @param {string} options.role - Filter by role
 * @param {string} options.status - Filter by status
 * @returns {Promise<Object>} - Users and pagination info
 */
export const findAll = async ({ page = 1, limit = 20, search = '', role = null, status = null } = {}) => {
  const offset = (page - 1) * limit;
  
  // Build where clause
  const where = {};
  
  if (search) {
    where[Op.or] = [
      { full_name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } }
    ];
  }
  
  if (role) {
    where.role = role;
  }
  
  if (status) {
    where.status = status;
  }

  const { count, rows } = await User.findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']],
    include: [
      {
        association: 'avatar',
        attributes: ['id', 'filename', 'path', 'thumbnail_path']
      }
    ]
  });

  return {
    users: rows,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit)
  };
};

/**
 * Find user by ID
 * @param {number} id - User ID
 * @returns {Promise<Object>} - User object
 * @throws {NotFoundError} - If user not found
 */
export const findById = async (id) => {
  const user = await User.findByPk(id, {
    include: [
      {
        association: 'avatar',
        attributes: ['id', 'filename', 'path', 'thumbnail_path']
      }
    ]
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
};

/**
 * Find user by email
 * @param {string} email - User email
 * @returns {Promise<Object|null>} - User object or null
 */
export const findByEmail = async (email) => {
  return User.findOne({
    where: { email }
  });
};

/**
 * Create new user
 * @param {Object} userData - User data
 * @param {string} userData.full_name - Full name
 * @param {string} userData.email - Email
 * @param {string} userData.password - Password (will be hashed)
 * @param {string} userData.role - User role
 * @param {string} userData.status - User status
 * @param {number} userData.avatar_id - Avatar media ID
 * @returns {Promise<Object>} - Created user
 * @throws {ConflictError} - If email already exists
 */
export const create = async (userData) => {
  // Check if email already exists
  const existingUser = await findByEmail(userData.email);
  if (existingUser) {
    throw new ConflictError('Email already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(userData.password);

  // Create user
  const user = await User.create({
    ...userData,
    password: hashedPassword
  });

  return user;
};

/**
 * Update user
 * @param {number} id - User ID
 * @param {Object} userData - User data to update
 * @returns {Promise<Object>} - Updated user
 * @throws {NotFoundError} - If user not found
 * @throws {ConflictError} - If email already exists
 */
export const update = async (id, userData) => {
  const user = await findById(id);

  // Check if email is being changed and already exists
  if (userData.email && userData.email !== user.email) {
    const existingUser = await findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictError('Email already exists');
    }
  }

  // Hash password if being updated
  if (userData.password) {
    userData.password = await hashPassword(userData.password);
  }

  // Update user
  await user.update(userData);

  // Reload with associations
  await user.reload({
    include: [
      {
        association: 'avatar',
        attributes: ['id', 'filename', 'path', 'thumbnail_path']
      }
    ]
  });

  return user;
};

/**
 * Delete user
 * @param {number} id - User ID
 * @returns {Promise<void>}
 * @throws {NotFoundError} - If user not found
 */
export const deleteUser = async (id) => {
  const user = await findById(id);
  await user.destroy();
};

/**
 * Update user password
 * @param {number} id - User ID
 * @param {string} oldPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<void>}
 * @throws {NotFoundError} - If user not found
 * @throws {Error} - If old password is incorrect
 */
export const updatePassword = async (id, oldPassword, newPassword) => {
  const user = await User.findByPk(id);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Verify old password
  const isValid = await comparePassword(oldPassword, user.password);
  if (!isValid) {
    throw new Error('Current password is incorrect');
  }

  // Hash and update new password
  const hashedPassword = await hashPassword(newPassword);
  await user.update({ password: hashedPassword });
};

/**
 * Count users by role
 * @returns {Promise<Object>} - Count by role
 */
export const countByRole = async () => {
  const users = await User.findAll({
    attributes: [
      'role',
      [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']
    ],
    group: ['role']
  });

  return users.reduce((acc, user) => {
    acc[user.role] = parseInt(user.get('count'));
    return acc;
  }, {});
};

export default {
  hashPassword,
  comparePassword,
  findAll,
  findById,
  findByEmail,
  create,
  update,
  deleteUser,
  updatePassword,
  countByRole
};
