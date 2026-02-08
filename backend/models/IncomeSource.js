const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const IncomeSource = sequelize.define('IncomeSource', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Main Income'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  frequency: {
    type: DataTypes.ENUM('daily', 'weekly', 'biweekly', 'monthly', 'custom'),
    allowNull: false,
    defaultValue: 'monthly'
  },
  paySchedule: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
    comment: 'Stores day_of_week (0-6) or date (1-31)'
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'income_sources',
  timestamps: true
});

module.exports = IncomeSource;
