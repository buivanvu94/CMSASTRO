import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

/**
 * MenuItem Model
 * Represents individual items within a menu with nested structure support
 */
const MenuItem = sequelize.define('MenuItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  menu_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'menus',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'menu_items',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'Parent menu item for nested structure'
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Menu item title is required'
      },
      len: {
        args: [1, 100],
        msg: 'Title must be between 1 and 100 characters'
      }
    }
  },
  url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Custom URL for external links'
  },
  link_type: {
    type: DataTypes.ENUM('internal', 'custom'),
    allowNull: false,
    defaultValue: 'custom',
    validate: {
      isIn: {
        args: [['internal', 'custom']],
        msg: 'Link type must be internal or custom'
      }
    }
  },
  target: {
    type: DataTypes.ENUM('_self', '_blank'),
    allowNull: false,
    defaultValue: '_self',
    validate: {
      isIn: {
        args: [['_self', '_blank']],
        msg: 'Target must be _self or _blank'
      }
    }
  },
  css_class: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Custom CSS classes for styling'
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Icon class or name'
  },
  sort_order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'Sort order must be non-negative'
      }
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'menu_items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['menu_id']
    },
    {
      fields: ['parent_id']
    },
    {
      fields: ['sort_order']
    }
  ]
});

/**
 * Instance method to check if item is active
 * @returns {boolean}
 */
MenuItem.prototype.isActive = function() {
  return this.is_active === true;
};

/**
 * Instance method to check if item has parent
 * @returns {boolean}
 */
MenuItem.prototype.hasParent = function() {
  return this.parent_id !== null;
};

/**
 * Instance method to check if item is top level
 * @returns {boolean}
 */
MenuItem.prototype.isTopLevel = function() {
  return this.parent_id === null;
};

export default MenuItem;
