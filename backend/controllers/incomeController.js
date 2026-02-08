const { IncomeSource } = require('../models');
const { calculateNextPayday, daysUntilPayday } = require('../utils/dateUtils');

// @desc    Get all income sources for user
// @route   GET /api/income
// @access  Private
const getIncomeSources = async (req, res, next) => {
  try {
    const incomeSources = await IncomeSource.findAll({
      where: { userId: req.user.id, isActive: true },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: incomeSources.length,
      data: incomeSources
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single income source
// @route   GET /api/income/:id
// @access  Private
const getIncomeSource = async (req, res, next) => {
  try {
    const incomeSource = await IncomeSource.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!incomeSource) {
      return res.status(404).json({
        success: false,
        message: 'Income source not found'
      });
    }

    res.status(200).json({
      success: true,
      data: incomeSource
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new income source
// @route   POST /api/income
// @access  Private
const createIncomeSource = async (req, res, next) => {
  try {
    const incomeData = {
      ...req.body,
      userId: req.user.id
    };

    const incomeSource = await IncomeSource.create(incomeData);

    res.status(201).json({
      success: true,
      data: incomeSource
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update income source
// @route   PUT /api/income/:id
// @access  Private
const updateIncomeSource = async (req, res, next) => {
  try {
    let incomeSource = await IncomeSource.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!incomeSource) {
      return res.status(404).json({
        success: false,
        message: 'Income source not found'
      });
    }

    incomeSource = await incomeSource.update(req.body);

    res.status(200).json({
      success: true,
      data: incomeSource
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete income source
// @route   DELETE /api/income/:id
// @access  Private
const deleteIncomeSource = async (req, res, next) => {
  try {
    const incomeSource = await IncomeSource.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!incomeSource) {
      return res.status(404).json({
        success: false,
        message: 'Income source not found'
      });
    }

    // Soft delete by setting isActive to false
    await incomeSource.update({ isActive: false });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get next payday information
// @route   GET /api/income/next-payday
// @access  Private
const getNextPayday = async (req, res, next) => {
  try {
    const incomeSources = await IncomeSource.findAll({
      where: { userId: req.user.id, isActive: true }
    });

    if (incomeSources.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No active income sources',
        data: null
      });
    }

    // Calculate next payday for each income source
    const paydays = incomeSources.map(source => {
      const nextPayday = calculateNextPayday(source);
      return {
        incomeSourceId: source.id,
        name: source.name,
        amount: source.amount,
        nextPayday,
        daysUntil: daysUntilPayday(nextPayday)
      };
    });

    // Sort by nearest payday
    paydays.sort((a, b) => a.daysUntil - b.daysUntil);

    res.status(200).json({
      success: true,
      data: {
        nextPayday: paydays[0],
        allPaydays: paydays
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getIncomeSources,
  getIncomeSource,
  createIncomeSource,
  updateIncomeSource,
  deleteIncomeSource,
  getNextPayday
};
