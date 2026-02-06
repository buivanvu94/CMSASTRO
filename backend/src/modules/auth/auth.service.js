import crypto from 'crypto';
import { Op } from 'sequelize';
import User from '../users/user.model.js';
import { findByEmail, comparePassword, create, hashPassword } from '../users/user.service.js';
import { sendResetPasswordEmail } from '../../utils/mailer.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../middlewares/auth.js';
import { AuthenticationError, ValidationError } from '../../middlewares/errorHandler.js';

/**
 * Auth Service
 * Business logic for authentication
 */

// In-memory store for invalidated tokens (in production, use Redis)
const invalidatedTokens = new Set();

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - User and tokens
 * @throws {AuthenticationError} - If credentials are invalid
 */
export const login = async (email, password) => {
  // DEBUG: Log login attempt
  console.log('🔍 [AUTH] Login attempt:', { email, passwordLength: password?.length });
  
  // Find user by email
  const user = await findByEmail(email);
  console.log('👤 [AUTH] User found:', user ? 'YES' : 'NO');
  
  if (!user) {
    console.log('❌ [AUTH] User not found in database');
    throw new AuthenticationError('Invalid email or password');
  }

  // DEBUG: Log user details
  console.log('📋 [AUTH] User details:', {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    passwordHashLength: user.password?.length,
    passwordHashStart: user.password?.substring(0, 10)
  });

  // Check if user is active
  if (user.status !== 'active') {
    console.log('❌ [AUTH] User status is not active:', user.status);
    throw new AuthenticationError('Account is inactive');
  }

  // Verify password
  console.log('🔐 [AUTH] Comparing passwords...');
  console.log('🔐 [AUTH] Input password:', password);
  console.log('🔐 [AUTH] Stored hash:', user.password);
  
  const isValidPassword = await comparePassword(password, user.password);
  console.log('🔐 [AUTH] Password match result:', isValidPassword ? '✅ YES' : '❌ NO');
  
  if (!isValidPassword) {
    console.log('❌ [AUTH] Password mismatch - authentication failed');
    throw new AuthenticationError('Invalid email or password');
  }

  console.log('✅ [AUTH] Login successful for user:', user.email);

  // Generate tokens
  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken({ id: user.id, email: user.email });

  // Return user without password and tokens
  const userWithoutPassword = user.toJSON();

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken
  };
};

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @param {string} userData.full_name - Full name
 * @param {string} userData.email - Email
 * @param {string} userData.password - Password
 * @returns {Promise<Object>} - Created user and tokens
 */
export const register = async (userData) => {
  // Validate required fields
  if (!userData.full_name || !userData.email || !userData.password) {
    throw new ValidationError('Full name, email, and password are required');
  }

  // Create user with default role 'author'
  const user = await create({
    ...userData,
    role: userData.role || 'author',
    status: 'active'
  });

  // Generate tokens
  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken({ id: user.id, email: user.email });

  // Return user without password and tokens
  const userWithoutPassword = user.toJSON();

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken
  };
};

/**
 * Refresh access token using refresh token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} - New access token
 * @throws {AuthenticationError} - If refresh token is invalid
 */
export const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new AuthenticationError('Refresh token is required');
  }

  // Check if token is invalidated
  if (invalidatedTokens.has(refreshToken)) {
    throw new AuthenticationError('Refresh token has been invalidated');
  }

  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user
    const user = await findByEmail(decoded.email);
    
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new AuthenticationError('Account is inactive');
    }

    // Generate new access token
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = generateAccessToken(tokenPayload);

    return {
      accessToken
    };
  } catch (error) {
    throw new AuthenticationError('Invalid or expired refresh token');
  }
};

/**
 * Logout user by invalidating refresh token
 * @param {string} refreshToken - Refresh token to invalidate
 * @returns {Promise<void>}
 */
export const logout = async (refreshToken) => {
  if (refreshToken) {
    // Add token to invalidated set
    invalidatedTokens.add(refreshToken);
    
    // In production, you would store this in Redis with expiration
    // matching the token's expiration time
  }
};

/**
 * Request password reset by email
 * Always returns a generic success response to avoid account enumeration.
 * @param {string} email - User email
 * @returns {Promise<Object>}
 */
export const requestPasswordReset = async (email) => {
  const user = await findByEmail(email);

  if (user && user.status === 'active') {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await user.update({
      reset_password_token: hashedToken,
      reset_password_expires_at: expiresAt
    });

    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:4321';
    const resetUrl = `${frontendBase.replace(/\/$/, '')}/admin/reset-password?token=${rawToken}`;

    const emailResult = await sendResetPasswordEmail({
      to: email,
      fullName: user.full_name,
      resetUrl,
      expiresMinutes: 15
    });

    if (!emailResult.sent) {
      console.log(`[AUTH] Password reset link for ${email}: ${resetUrl}`);
    }

    if (process.env.NODE_ENV !== 'production' && !emailResult.sent) {
      return {
        message: 'If an account exists with this email, password reset instructions have been sent.',
        resetUrl
      };
    }
  }

  return {
    message: 'If an account exists with this email, password reset instructions have been sent.'
  };
};

/**
 * Reset password with valid reset token
 * @param {string} token - Raw reset token from email link
 * @param {string} password - New password
 * @returns {Promise<Object>}
 */
export const resetPassword = async (token, password) => {
  if (!token) {
    throw new ValidationError('Reset token is required');
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const now = new Date();

  const user = await User.findOne({
    where: {
      reset_password_token: hashedToken,
      reset_password_expires_at: { [Op.gt]: now },
      status: 'active'
    }
  });

  if (!user) {
    throw new AuthenticationError('Invalid or expired reset token');
  }

  const newHashedPassword = await hashPassword(password);

  await user.update({
    password: newHashedPassword,
    reset_password_token: null,
    reset_password_expires_at: null
  });

  return {
    message: 'Password reset successful'
  };
};

/**
 * Get current user by ID
 * @param {number} userId - User ID from token
 * @returns {Promise<Object>} - User object
 * @throws {AuthenticationError} - If user not found
 */
export const getCurrentUser = async (userId) => {
  const user = await findByEmail(userId);
  
  if (!user) {
    throw new AuthenticationError('User not found');
  }

  return user.toJSON();
};

/**
 * Verify user credentials
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - User object if valid
 * @throws {AuthenticationError} - If credentials are invalid
 */
export const verifyCredentials = async (email, password) => {
  const user = await findByEmail(email);
  
  if (!user) {
    throw new AuthenticationError('Invalid credentials');
  }

  const isValidPassword = await comparePassword(password, user.password);
  
  if (!isValidPassword) {
    throw new AuthenticationError('Invalid credentials');
  }

  return user;
};

/**
 * Check if refresh token is invalidated
 * @param {string} refreshToken - Refresh token
 * @returns {boolean} - True if invalidated
 */
export const isTokenInvalidated = (refreshToken) => {
  return invalidatedTokens.has(refreshToken);
};

/**
 * Clear invalidated tokens (for testing)
 */
export const clearInvalidatedTokens = () => {
  invalidatedTokens.clear();
};

export default {
  login,
  register,
  refreshAccessToken,
  logout,
  requestPasswordReset,
  resetPassword,
  getCurrentUser,
  verifyCredentials,
  isTokenInvalidated,
  clearInvalidatedTokens
};
