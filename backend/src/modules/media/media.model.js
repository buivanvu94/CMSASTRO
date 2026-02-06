import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

/**
 * Media Model
 * Represents uploaded files (images, documents, etc.)
 */
const Media = sequelize.define('Media', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  uploaded_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  filename: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Filename is required'
      }
    }
  },
  original_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Original name is required'
      }
    }
  },
  mime_type: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'MIME type is required'
      }
    }
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'File size must be positive'
      }
    }
  },
  path: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'File path is required'
      }
    }
  },
  thumbnail_path: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  alt_text: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  caption: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  folder: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'general',
    validate: {
      notEmpty: {
        msg: 'Folder is required'
      }
    }
  }
}, {
  tableName: 'media',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['uploaded_by']
    },
    {
      fields: ['folder']
    },
    {
      fields: ['mime_type']
    },
    {
      fields: ['created_at']
    }
  ]
});

/**
 * Instance method to check if media is an image
 * @returns {boolean}
 */
Media.prototype.isImage = function() {
  return this.mime_type.startsWith('image/');
};

/**
 * Instance method to get file extension
 * @returns {string}
 */
Media.prototype.getExtension = function() {
  return this.filename.split('.').pop().toLowerCase();
};

/**
 * Instance method to get full URL
 * @param {string} baseUrl - Base URL for the application
 * @returns {string}
 */
Media.prototype.getUrl = function(baseUrl = '') {
  return `${baseUrl}/${this.path}`;
};

/**
 * Instance method to get thumbnail URL
 * @param {string} baseUrl - Base URL for the application
 * @returns {string|null}
 */
Media.prototype.getThumbnailUrl = function(baseUrl = '') {
  return this.thumbnail_path ? `${baseUrl}/${this.thumbnail_path}` : null;
};

/**
 * Instance method to format file size
 * @returns {string}
 */
Media.prototype.getFormattedSize = function() {
  const bytes = this.size;
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export default Media;
