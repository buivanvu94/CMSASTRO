import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

/**
 * Reservation Model
 * Represents table reservations for restaurant bookings
 */
const Reservation = sequelize.define('Reservation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  customer_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Customer name is required'
      },
      len: {
        args: [2, 100],
        msg: 'Customer name must be between 2 and 100 characters'
      }
    }
  },
  customer_email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Customer email is required'
      },
      isEmail: {
        msg: 'Invalid email format'
      }
    }
  },
  customer_phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Customer phone is required'
      }
    }
  },
  reservation_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Reservation date is required'
      },
      isDate: {
        msg: 'Invalid date format'
      }
    }
  },
  reservation_time: {
    type: DataTypes.TIME,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Reservation time is required'
      }
    }
  },
  party_size: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Party size is required'
      },
      min: {
        args: [1],
        msg: 'Party size must be at least 1'
      },
      max: {
        args: [50],
        msg: 'Party size cannot exceed 50'
      }
    }
  },
  special_requests: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no_show'),
    allowNull: false,
    defaultValue: 'pending',
    validate: {
      isIn: {
        args: [['pending', 'confirmed', 'cancelled', 'completed', 'no_show']],
        msg: 'Status must be pending, confirmed, cancelled, completed, or no_show'
      }
    }
  },
  handler_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL',
    comment: 'User who handled/confirmed the reservation'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Internal notes for staff'
  }
}, {
  tableName: 'reservations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['reservation_date']
    },
    {
      fields: ['status']
    },
    {
      fields: ['customer_email']
    },
    {
      fields: ['handler_id']
    }
  ]
});

/**
 * Instance method to check if reservation is pending
 * @returns {boolean}
 */
Reservation.prototype.isPending = function() {
  return this.status === 'pending';
};

/**
 * Instance method to check if reservation is confirmed
 * @returns {boolean}
 */
Reservation.prototype.isConfirmed = function() {
  return this.status === 'confirmed';
};

/**
 * Instance method to check if reservation can be modified
 * @returns {boolean}
 */
Reservation.prototype.canBeModified = function() {
  return this.status === 'pending' || this.status === 'confirmed';
};

/**
 * Instance method to get full reservation datetime
 * @returns {string}
 */
Reservation.prototype.getFullDateTime = function() {
  return `${this.reservation_date} ${this.reservation_time}`;
};

export default Reservation;
