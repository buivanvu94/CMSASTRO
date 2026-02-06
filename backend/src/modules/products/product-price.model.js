import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

/**
 * ProductPrice Model
 * Represents price variants for products
 */
const ProductPrice = sequelize.define('ProductPrice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  variant_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      isDecimal: {
        msg: 'Price must be a valid decimal number'
      },
      min: {
        args: [0],
        msg: 'Price must be non-negative'
      }
    }
  },
  sale_price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    validate: {
      isDecimal: {
        msg: 'Sale price must be a valid decimal number'
      },
      min: {
        args: [0],
        msg: 'Sale price must be non-negative'
      },
      isSalePriceLowerThanPrice(value) {
        if (value !== null && parseFloat(value) >= parseFloat(this.price)) {
          throw new Error('Sale price must be lower than regular price');
        }
      }
    }
  },
  is_default: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
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
  }
}, {
  tableName: 'product_prices',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['product_id']
    },
    {
      fields: ['is_default']
    },
    {
      fields: ['status']
    }
  ],
  hooks: {
    beforeSave: async (productPrice, options) => {
      // If this price is being set as default, unset all other defaults for this product
      if (productPrice.is_default && productPrice.changed('is_default')) {
        await ProductPrice.update(
          { is_default: false },
          {
            where: {
              product_id: productPrice.product_id,
              id: { [sequelize.Sequelize.Op.ne]: productPrice.id }
            },
            transaction: options.transaction
          }
        );
      }
    }
  }
});

/**
 * Instance method to check if price is active
 * @returns {boolean}
 */
ProductPrice.prototype.isActive = function() {
  return this.status === 'active';
};

/**
 * Instance method to get effective price (sale price if available, otherwise regular price)
 * @returns {number}
 */
ProductPrice.prototype.getEffectivePrice = function() {
  return this.sale_price !== null ? parseFloat(this.sale_price) : parseFloat(this.price);
};

/**
 * Instance method to check if on sale
 * @returns {boolean}
 */
ProductPrice.prototype.isOnSale = function() {
  return this.sale_price !== null && parseFloat(this.sale_price) < parseFloat(this.price);
};

/**
 * Instance method to get discount percentage
 * @returns {number}
 */
ProductPrice.prototype.getDiscountPercentage = function() {
  if (!this.isOnSale()) return 0;
  
  const regularPrice = parseFloat(this.price);
  const salePrice = parseFloat(this.sale_price);
  
  return Math.round(((regularPrice - salePrice) / regularPrice) * 100);
};

export default ProductPrice;
