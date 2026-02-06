import { AuthorizationError, AuthenticationError } from './errorHandler.js';

/**
 * User Roles
 */
export const ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  AUTHOR: 'author'
};

/**
 * Role hierarchy (higher index = more permissions)
 */
const ROLE_HIERARCHY = [ROLES.AUTHOR, ROLES.EDITOR, ROLES.ADMIN];

/**
 * Check if user has required role
 * @param {string} userRole - User's role
 * @param {string} requiredRole - Required role
 * @returns {boolean}
 */
export const hasRole = (userRole, requiredRole) => {
  const userRoleIndex = ROLE_HIERARCHY.indexOf(userRole);
  const requiredRoleIndex = ROLE_HIERARCHY.indexOf(requiredRole);
  
  return userRoleIndex >= requiredRoleIndex;
};

/**
 * Role-based authorization middleware
 * Checks if user has one of the allowed roles
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 * @returns {Function} Express middleware
 */
export const authorize = (...allowedRoles) => {
  // Backward-compatible: support both authorize('admin', 'editor')
  // and authorize(['admin', 'editor']) patterns.
  const normalizedRoles = allowedRoles.flat();

  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      // Check if user has one of the allowed roles
      if (!normalizedRoles.includes(req.user.role)) {
        throw new AuthorizationError(
          `Access denied. Required role: ${normalizedRoles.join(' or ')}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Admin-only authorization middleware
 */
export const adminOnly = authorize(ROLES.ADMIN);

/**
 * Editor and Admin authorization middleware
 */
export const editorOrAdmin = authorize(ROLES.EDITOR, ROLES.ADMIN);

/**
 * Check if user owns the resource
 * @param {Function} getResourceOwnerId - Function to get resource owner ID from request
 * @returns {Function} Express middleware
 */
export const checkOwnership = (getResourceOwnerId) => {
  return async (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      // Admin and Editor can access any resource
      if (req.user.role === ROLES.ADMIN || req.user.role === ROLES.EDITOR) {
        return next();
      }

      // Get resource owner ID
      const ownerId = await getResourceOwnerId(req);

      // Check if user owns the resource
      if (req.user.id !== ownerId) {
        throw new AuthorizationError('You can only access your own resources');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user can modify the resource
 * Authors can only modify their own resources
 * Editors and Admins can modify any resource
 * @param {Function} getResourceOwnerId - Function to get resource owner ID from request
 * @returns {Function} Express middleware
 */
export const canModify = (getResourceOwnerId) => {
  return async (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      // Admin and Editor can modify any resource
      if (req.user.role === ROLES.ADMIN || req.user.role === ROLES.EDITOR) {
        return next();
      }

      // Authors can only modify their own resources
      if (req.user.role === ROLES.AUTHOR) {
        const ownerId = await getResourceOwnerId(req);
        
        if (req.user.id !== ownerId) {
          throw new AuthorizationError('You can only modify your own resources');
        }
        
        return next();
      }

      throw new AuthorizationError('Access denied');
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user can delete the resource
 * Only Admins and Editors can delete resources
 * @returns {Function} Express middleware
 */
export const canDelete = () => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      // Only Admin and Editor can delete
      if (req.user.role !== ROLES.ADMIN && req.user.role !== ROLES.EDITOR) {
        throw new AuthorizationError('Only admins and editors can delete resources');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user can access their own profile or is admin
 * @param {string} userIdParam - Name of the route parameter containing user ID
 * @returns {Function} Express middleware
 */
export const canAccessProfile = (userIdParam = 'id') => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      const targetUserId = parseInt(req.params[userIdParam]);

      // Admin can access any profile
      if (req.user.role === ROLES.ADMIN) {
        return next();
      }

      // User can access their own profile
      if (req.user.id === targetUserId) {
        return next();
      }

      throw new AuthorizationError('You can only access your own profile');
    } catch (error) {
      next(error);
    }
  };
};
