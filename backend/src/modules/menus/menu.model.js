import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

/**
 * Menu Model
 * Represents navigation menus for different locations
 */
const Menu = sequelize.define('Menu', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Menu name is required'
      },
      len: {
        args: [2, 100],
        msg: 'Menu name must be between 2 and 100 characters'
      }
    }
  },
  location: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Location is required'
      },
      isIn: {
        args: [['header', 'footer', 'sidebar', 'mobile']],
        msg: 'Location must be header, footer, sidebar, or mobile'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'menus',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['location']
    }
  ]
});

export default Menu;
