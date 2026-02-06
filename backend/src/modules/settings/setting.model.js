import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

/**
 * Setting Model
 * Represents system settings with key-value pairs
 */
const Setting = sequelize.define('Setting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  key: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Setting key is required'
      },
      len: {
        args: [2, 100],
        msg: 'Setting key must be between 2 and 100 characters'
      }
    }
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  group: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'general',
    validate: {
      notEmpty: {
        msg: 'Group is required'
      }
    }
  },
  type: {
    type: DataTypes.ENUM('string', 'number', 'boolean', 'json'),
    allowNull: false,
    defaultValue: 'string',
    validate: {
      isIn: {
        args: [['string', 'number', 'boolean', 'json']],
        msg: 'Type must be string, number, boolean, or json'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'settings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['key']
    },
    {
      fields: ['group']
    }
  ]
});

/**
 * Instance method to get parsed value based on type
 * @returns {*} - Parsed value
 */
Setting.prototype.getParsedValue = function() {
  if (this.value === null) {
    return null;
  }

  switch (this.type) {
    case 'number':
      return parseFloat(this.value);
    case 'boolean':
      return this.value === 'true' || this.value === '1';
    case 'json':
      try {
        return JSON.parse(this.value);
      } catch (e) {
        return null;
      }
    case 'string':
    default:
      return this.value;
  }
};

/**
 * Instance method to set value with type conversion
 * @param {*} value - Value to set
 * @returns {Promise<Setting>}
 */
Setting.prototype.setValue = async function(value) {
  let stringValue;

  switch (this.type) {
    case 'json':
      stringValue = JSON.stringify(value);
      break;
    case 'boolean':
      stringValue = value ? 'true' : 'false';
      break;
    case 'number':
      stringValue = String(value);
      break;
    case 'string':
    default:
      stringValue = String(value);
  }

  return this.update({ value: stringValue });
};

export default Setting;
