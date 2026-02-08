const User = require('./User');
const IncomeSource = require('./IncomeSource');
const Category = require('./Category');
const BudgetLimit = require('./BudgetLimit');
const Expense = require('./Expense');
const RecurringExpense = require('./RecurringExpense');
const SavingsGoal = require('./SavingsGoal');
const BalanceHistory = require('./BalanceHistory');

// Define associations
User.hasMany(IncomeSource, { foreignKey: 'userId', as: 'incomeSources' });
IncomeSource.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Category, { foreignKey: 'userId', as: 'customCategories' });
Category.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(BudgetLimit, { foreignKey: 'userId', as: 'budgetLimits' });
BudgetLimit.belongsTo(User, { foreignKey: 'userId' });
BudgetLimit.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

User.hasMany(Expense, { foreignKey: 'userId', as: 'expenses' });
Expense.belongsTo(User, { foreignKey: 'userId' });
Expense.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Expense.belongsTo(RecurringExpense, { foreignKey: 'recurringId', as: 'recurring' });

User.hasMany(RecurringExpense, { foreignKey: 'userId', as: 'recurringExpenses' });
RecurringExpense.belongsTo(User, { foreignKey: 'userId' });
RecurringExpense.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
RecurringExpense.hasMany(Expense, { foreignKey: 'recurringId', as: 'expenses' });

User.hasMany(SavingsGoal, { foreignKey: 'userId', as: 'savingsGoals' });
SavingsGoal.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(BalanceHistory, { foreignKey: 'userId', as: 'balanceHistory' });
BalanceHistory.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  User,
  IncomeSource,
  Category,
  BudgetLimit,
  Expense,
  RecurringExpense,
  SavingsGoal,
  BalanceHistory
};
