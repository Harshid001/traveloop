const express = require('express');
const {
  getBudget,
  createOrUpdateBudget,
  updateBudget,
  addExpense,
  updateExpense,
  deleteExpense
} = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/:tripId')
  .get(protect, getBudget)
  .post(protect, createOrUpdateBudget);

router.put('/:id', protect, updateBudget);

router.post('/:id/expense', protect, addExpense);

router.route('/:id/expense/:expenseId')
  .put(protect, updateExpense)
  .delete(protect, deleteExpense);

module.exports = router;
