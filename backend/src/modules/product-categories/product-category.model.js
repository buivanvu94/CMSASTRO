import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

/**
 * Category Model
 * Supports nested hierarchical structure with parent-child relationships
 */
const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'categories',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Category name is required'
      },
      len: {
        args: [2, 100],
        msg: 'Category name must be between 2 and 100 characters'
      }
    }
  },
  slug: {
    type: DataTypes.STRING(120),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Slug is required'
      },
      is: {
        args: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        msg: 'Slug must be lowercase alphanumeric with hyphens'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  image_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'media',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  type: {
    type: DataTypes.ENUM('post', 'product'),
    allowNull: false,
    defaultValue: 'post',
    validate: {
      isIn: {
        args: [['post', 'product']],
        msg: 'Type must be either post or product'
      }
    }
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
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active',
    validate: {
      isIn: {
        args: [['active', 'inactive']],
        msg: 'Status must be either active or inactive'
      }
    }
  },
  seo_title: {
    type: DataTypes.STRING(70),
    allowNull: true,
    validate: {
      len: {
        args: [0, 70],
        msg: 'SEO title must not exceed 70 characters'
      }
    }
  },
  seo_description: {
    type: DataTypes.STRING(160),
    allowNull: true,
    validate: {
      len: {
        args: [0, 160],
        msg: 'SEO description must not exceed 160 characters'
      }
    }
  }
}, {
  tableName: 'categories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['slug']
    },
    {
      fields: ['parent_id']
    },
    {
      fields: ['type']
    },
    {
      fields: ['status']
    },
    {
      fields: ['sort_order']
    }
  ]
});

/**
 * Instance method to check if category has children
 * @returns {Promise<boolean>}
 */
Category.prototype.hasChildren = async function() {
  const count = await Category.count({
    where: { parent_id: this.id }
  });
  return count > 0;
};

/**
 * Instance method to get depth level in hierarchy
 * @returns {Promise<number>}
 */
Category.prototype.getDepth = async function() {
  let depth = 0;
  let currentCategory = this;
  
  while (currentCategory.parent_id) {
    depth++;
    currentCategory = await Category.findByPk(currentCategory.parent_id);
    if (!currentCategory) break;
  }
  
  return depth;
};

/**
 * Instance method to get full path (breadcrumb)
 * @returns {Promise<Array>}
 */
Category.prototype.getPath = async function() {
  const path = [this];
  let currentCategory = this;
  
  while (currentCategory.parent_id) {
    currentCategory = await Category.findByPk(currentCategory.parent_id);
    if (!currentCategory) break;
    path.unshift(currentCategory);
  }
  
  return path;
};

export default Category;
