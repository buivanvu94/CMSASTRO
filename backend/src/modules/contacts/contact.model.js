import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

/**
 * Contact Model
 * Represents contact form submissions from visitors
 */
const Contact = sequelize.define('Contact', {
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
        msg: 'Name is required'
      },
      len: {
        args: [2, 100],
        msg: 'Name must be between 2 and 100 characters'
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
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  subject: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Subject is required'
      },
      len: {
        args: [2, 255],
        msg: 'Subject must be between 2 and 255 characters'
      }
    }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Message is required'
      },
      len: {
        args: [10],
        msg: 'Message must be at least 10 characters'
      }
    }
  },
  status: {
    type: DataTypes.ENUM('new', 'read', 'replied', 'spam'),
    allowNull: false,
    defaultValue: 'new',
    validate: {
      isIn: {
        args: [['new', 'read', 'replied', 'spam']],
        msg: 'Status must be new, read, replied, or spam'
      }
    }
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'IP address of the submitter'
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Browser user agent string'
  }
}, {
  tableName: 'contacts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['email']
    },
    {
      fields: ['status']
    },
    {
      fields: ['created_at']
    }
  ]
});

/**
 * Instance method to check if contact is new
 * @returns {boolean}
 */
Contact.prototype.isNew = function() {
  return this.status === 'new';
};

/**
 * Instance method to check if contact is read
 * @returns {boolean}
 */
Contact.prototype.isRead = function() {
  return this.status === 'read';
};

/**
 * Instance method to check if contact is replied
 * @returns {boolean}
 */
Contact.prototype.isReplied = function() {
  return this.status === 'replied';
};

/**
 * Instance method to check if contact is spam
 * @returns {boolean}
 */
Contact.prototype.isSpam = function() {
  return this.status === 'spam';
};

/**
 * Instance method to mark as read
 * @returns {Promise<Contact>}
 */
Contact.prototype.markAsRead = async function() {
  return this.update({ status: 'read' });
};

/**
 * Instance method to mark as replied
 * @returns {Promise<Contact>}
 */
Contact.prototype.markAsReplied = async function() {
  return this.update({ status: 'replied' });
};

/**
 * Instance method to mark as spam
 * @returns {Promise<Contact>}
 */
Contact.prototype.markAsSpam = async function() {
  return this.update({ status: 'spam' });
};

export default Contact;
