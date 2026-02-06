import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

/**
 * User Model
 * Represents system users with authentication and role-based access
 */
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  full_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Full name is required'
      },
      len: {
        args: [2, 100],
        msg: 'Full name must be between 2 and 100 characters'
      }
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Email is required'
      },
      isEmail: {
        msg: 'Invalid email format'
      }
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Password is required'
      },
      len: {
        args: [6, 255],
        msg: 'Password must be at least 6 characters'
      }
    }
  },
  avatar_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'media',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  role: {
    type: DataTypes.ENUM('admin', 'editor', 'author'),
    allowNull: false,
    defaultValue: 'author',
    validate: {
      isIn: {
        args: [['admin', 'editor', 'author']],
        msg: 'Role must be admin, editor, or author'
      }
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active',
    validate: {
      isIn: {
        args: [['active', 'inactive']],
        msg: 'Status must be active or inactive'
      }
    }
  },
  reset_password_token: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  reset_password_expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      fields: ['role']
    },
    {
      fields: ['status']
    },
    {
      fields: ['reset_password_token']
    },
    {
      fields: ['reset_password_expires_at']
    }
  ]
});

/**
 * Instance method to get user without password
 * @returns {Object} User object without password
 */
User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

/**
 * Instance method to check if user is admin
 * @returns {boolean}
 */
User.prototype.isAdmin = function() {
  return this.role === 'admin';
};

/**
 * Instance method to check if user is editor or admin
 * @returns {boolean}
 */
User.prototype.isEditorOrAdmin = function() {
  return this.role === 'editor' || this.role === 'admin';
};

/**
 * Instance method to check if user is active
 * @returns {boolean}
 */
User.prototype.isActive = function() {
  return this.status === 'active';
};

export default User;
