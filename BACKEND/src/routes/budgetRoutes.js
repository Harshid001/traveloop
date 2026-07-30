const express = require('express');
const { body } = require('express-validator');
const {
  getBudget,
  createOrUpdateBudget,
  updateBudget,
  addExpense,
  updateExpense,
  deleteExpense
} = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.route('/:tripId')
  .get(protect, getBudget)
  .post(protect,
    [
      body('totalBudget', 'Total budget is required').isNumeric(),
      validateRequest,
    ],
    createOrUpdateBudget
  );

router.put('/:id', protect,
  [
    body('totalBudget', 'Total budget must be a number').optional().isNumeric(),
    validateRequest,
  ],
  updateBudget
);

router.post('/:id/expense',
  protect,
  [
    body('amount', 'Expense amount is required').isNumeric(),
    body('category', 'Expense category is required').not().isEmpty(),
    validateRequest,
  ],
  addExpense
);

router.route('/:id/expense/:expenseId')
  .put(protect,
    [
      body('amount', 'Amount must be a number').optional().isNumeric(),
      body('category', 'Category must be a string').optional().isString(),
      validateRequest,
    ],
    updateExpense
  )
  .delete(protect, deleteExpense);

module.exports = router;