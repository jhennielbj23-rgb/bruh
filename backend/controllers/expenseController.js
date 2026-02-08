const { Expense, Category, BalanceHistory } = require('../models');
const { Op } = require('sequelize');
const { startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths } = require('date-fns');

// @desc    Get all expenses for user
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res, next) => {
  try {
    const { startDate, endDate, categoryId, limit = 50, offset = 0 } = req.query;

    const where = { userId: req.user.id };

    // Filter by date range
    if (startDate && endDate) {
      where.expenseDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Filter by category
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const expenses = await Expense.findAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'icon', 'color']
        }
      ],
      order: [['expenseDate', 'DESC'], ['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const total = await Expense.count({ where });

    res.status(200).json({
      success: true,
      count: expenses.length,
      total,
      data: expenses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
const getExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'icon', 'color']
        }
      ]
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res, next) => {
  try {
    const expenseData = {
      ...req.body,
      userId: req.user.id
    };

    const expense = await Expense.create(expenseData);

    // Update balance history
    await updateBalanceHistory(req.user.id, expense.expenseDate, expense.amount, 'expense');

    // Fetch created expense with category details
    const createdExpense = await Expense.findByPk(expense.id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'icon', 'color']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: createdExpense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res, next) => {
  try {
    let expense = await Expense.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    const oldAmount = expense.amount;
    const oldDate = expense.expenseDate;

    expense = await expense.update(req.body);

    // Update balance history if amount or date changed
    if (oldAmount !== expense.amount || oldDate !== expense.expenseDate) {
      // Reverse old expense
      await updateBalanceHistory(req.user.id, oldDate, -oldAmount, 'expense');
      // Add new expense
      await updateBalanceHistory(req.user.id, expense.expenseDate, expense.amount, 'expense');
    }

    // Fetch updated expense with category details
    const updatedExpense = await Expense.findByPk(expense.id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'icon', 'color']
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: updatedExpense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Update balance history (reverse expense)
    await updateBalanceHistory(req.user.id, expense.expenseDate, -expense.amount, 'expense');

    await expense.destroy();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get expenses for a specific day
// @route   GET /api/expenses/daily/:date
// @access  Private
const getDailyExpenses = async (req, res, next) => {
  try {
    const date = new Date(req.params.date);
    
    const expenses = await Expense.findAll({
      where: {
        userId: req.user.id,
        expenseDate: date
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'icon', 'color']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

    res.status(200).json({
      success: true,
      data: {
        date,
        expenses,
        total,
        count: expenses.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly expense summary
// @route   GET /api/expenses/monthly/:year/:month
// @access  Private
const getMonthlyExpenses = async (req, res, next) => {
  try {
    const { year, month } = req.params;
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));

    const expenses = await Expense.findAll({
      where: {
        userId: req.user.id,
        expenseDate: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'icon', 'color']
        }
      ],
      order: [['expenseDate', 'DESC']]
    });

    // Group by category
    const byCategory = {};
    let total = 0;

    expenses.forEach(expense => {
      const categoryName = expense.category.name;
      if (!byCategory[categoryName]) {
        byCategory[categoryName] = {
          category: expense.category,
          total: 0,
          count: 0
        };
      }
      byCategory[categoryName].total += parseFloat(expense.amount);
      byCategory[categoryName].count += 1;
      total += parseFloat(expense.amount);
    });

    // Group by day
    const byDay = {};
    expenses.forEach(expense => {
      const day = expense.expenseDate;
      if (!byDay[day]) {
        byDay[day] = {
          date: day,
          total: 0,
          expenses: []
        };
      }
      byDay[day].total += parseFloat(expense.amount);
      byDay[day].expenses.push(expense);
    });

    res.status(200).json({
      success: true,
      data: {
        year: parseInt(year),
        month: parseInt(month),
        total,
        count: expenses.length,
        byCategory: Object.values(byCategory),
        byDay: Object.values(byDay),
        expenses
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get expense statistics
// @route   GET /api/expenses/stats
// @access  Private
const getExpenseStats = async (req, res, next) => {
  try {
    const today = startOfDay(new Date());
    const thisMonthStart = startOfMonth(today);
    const lastMonthStart = startOfMonth(subMonths(today, 1));
    const lastMonthEnd = endOfMonth(subMonths(today, 1));

    // This month total
    const thisMonthExpenses = await Expense.findAll({
      where: {
        userId: req.user.id,
        expenseDate: {
          [Op.gte]: thisMonthStart
        }
      }
    });

    const thisMonthTotal = thisMonthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

    // Last month total
    const lastMonthExpenses = await Expense.findAll({
      where: {
        userId: req.user.id,
        expenseDate: {
          [Op.between]: [lastMonthStart, lastMonthEnd]
        }
      }
    });

    const lastMonthTotal = lastMonthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

    // Today's expenses
    const todayExpenses = await Expense.findAll({
      where: {
        userId: req.user.id,
        expenseDate: today
      }
    });

    const todayTotal = todayExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

    res.status(200).json({
      success: true,
      data: {
        today: {
          total: todayTotal,
          count: todayExpenses.length
        },
        thisMonth: {
          total: thisMonthTotal,
          count: thisMonthExpenses.length
        },
        lastMonth: {
          total: lastMonthTotal,
          count: lastMonthExpenses.length
        },
        percentageChange: lastMonthTotal > 0 
          ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal * 100).toFixed(2)
          : 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to update balance history
const updateBalanceHistory = async (userId, date, amount, type) => {
  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);

  let balanceRecord = await BalanceHistory.findOne({
    where: { userId, date: dateOnly }
  });

  if (!balanceRecord) {
    balanceRecord = await BalanceHistory.create({
      userId,
      date: dateOnly,
      openingBalance: 0,
      income: 0,
      expenses: 0,
      closingBalance: 0
    });
  }

  if (type === 'expense') {
    balanceRecord.expenses = parseFloat(balanceRecord.expenses) + parseFloat(amount);
  } else if (type === 'income') {
    balanceRecord.income = parseFloat(balanceRecord.income) + parseFloat(amount);
  }

  balanceRecord.closingBalance = parseFloat(balanceRecord.openingBalance) + 
                                 parseFloat(balanceRecord.income) - 
                                 parseFloat(balanceRecord.expenses);

  await balanceRecord.save();
};

module.exports = {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getDailyExpenses,
  getMonthlyExpenses,
  getExpenseStats
};
