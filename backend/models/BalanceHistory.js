const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BalanceHistory = sequelize.define('BalanceHistory', {
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
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  openingBalance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  income: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  expenses: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  closingBalance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  }
}, {
  tableName: 'balance_history',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'date']
    }
  ]
});

module.exports = BalanceHistory;
