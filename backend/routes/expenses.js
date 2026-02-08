const express = require('express');
const {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getDailyExpenses,
  getMonthlyExpenses,
  getExpenseStats
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getExpenses)
  .post(createExpense);

router.get('/stats', getExpenseStats);
router.get('/daily/:date', getDailyExpenses);
router.get('/monthly/:year/:month', getMonthlyExpenses);

router.route('/:id')
  .get(getExpense)
  .put(updateExpense)
  .delete(deleteExpense);

module.exports = router;
