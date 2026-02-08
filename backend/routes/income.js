const express = require('express');
const {
  getIncomeSources,
  getIncomeSource,
  createIncomeSource,
  updateIncomeSource,
  deleteIncomeSource,
  getNextPayday
} = require('../controllers/incomeController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getIncomeSources)
  .post(createIncomeSource);

router.get('/next-payday', getNextPayday);

router.route('/:id')
  .get(getIncomeSource)
  .put(updateIncomeSource)
  .delete(deleteIncomeSource);

module.exports = router;
