import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

/**
 * Product Model
 * Represents products in the catalog
 */
const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_category_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'product_categories',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Product name is required'
      }
    }
  },
  slug: {
    type: DataTypes.STRING(280),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Slug is required'
      }
    }
  },
  description: {
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
  short_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  featured_image_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'media',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  gallery: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null,
    validate: {
      isValidGallery(value) {
        if (value !== null && !Array.isArray(value)) {
          throw new Error('Gallery must be an array of media IDs');
        }
        if (Array.isArray(value)) {
          for (const item of value) {
            if (!Number.isInteger(item) || item <= 0) {
              throw new Error('Gallery must contain valid media IDs');
            }
          }
        }
      }
    }
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    allowNull: false,
    defaultValue: 'draft',
    validate: {
      isIn: {
        args: [['draft', 'published', 'archived']],
        msg: 'Status must be draft, published, or archived'
      }
    }
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  sort_order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
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
  tableName: 'products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      name: 'idx_products_slug_unique',
      fields: ['slug'],
      unique: true
    },
    {
      name: 'idx_products_product_category_id',
      fields: ['product_category_id']
    },
    {
      name: 'idx_products_status',
      fields: ['status']
    },
    {
      name: 'idx_products_is_featured',
      fields: ['is_featured']
    },
    {
      name: 'idx_products_sort_order',
      fields: ['sort_order']
    },
    {
      name: 'idx_products_created_at',
      fields: ['created_at']
    }
  ]
});

/**
 * Instance method to check if product is published
 * @returns {boolean}
 */
Product.prototype.isPublished = function() {
  return this.status === 'published';
};

/**
 * Instance method to check if product is draft
 * @returns {boolean}
 */
Product.prototype.isDraft = function() {
  return this.status === 'draft';
};

/**
 * Instance method to get default price
 * @returns {Promise<ProductPrice|null>}
 */
Product.prototype.getDefaultPrice = async function() {
  const ProductPrice = sequelize.models.ProductPrice;
  return await ProductPrice.findOne({
    where: {
      product_id: this.id,
      is_default: true,
      status: 'active'
    }
  });
};

/**
 * Instance method to get all active prices
 * @returns {Promise<ProductPrice[]>}
 */
Product.prototype.getActivePrices = async function() {
  const ProductPrice = sequelize.models.ProductPrice;
  return await ProductPrice.findAll({
    where: {
      product_id: this.id,
      status: 'active'
    },
    order: [['is_default', 'DESC'], ['id', 'ASC']]
  });
};

export default Product;
