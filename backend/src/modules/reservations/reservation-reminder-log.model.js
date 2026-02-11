import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const ReservationReminderLog = sequelize.define('ReservationReminderLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  reservation_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'reservations',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  reminder_type: {
    type: DataTypes.ENUM('meal_reminder'),
    allowNull: false,
    defaultValue: 'meal_reminder'
  },
  lead_hours: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  sent_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'reservation_reminder_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['reservation_id', 'reminder_type']
    },
    {
      fields: ['sent_at']
    }
  ]
});

export default ReservationReminderLog;
