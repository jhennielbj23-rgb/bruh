const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BudgetLimit = sequelize.define('BudgetLimit', {
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
  periodType: {
    type: DataTypes.ENUM('daily', 'weekly', 'monthly'),
    allowNull: false,
    defaultValue: 'daily'
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'categories',
      key: 'id'
    },
    comment: 'Null for overall budget, specific for category budgets'
  },
  greenLimit: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 500
  },
  yellowLimit: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 800
  },
  redLimit: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 1000
  }
}, {
  tableName: 'budget_limits',
  timestamps: true
});

module.exports = BudgetLimit;
