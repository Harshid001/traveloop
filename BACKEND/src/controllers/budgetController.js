const Budget = require('../models/Budget');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get budget for a trip
// @route   GET /api/budgets/:tripId
// @access  Private
const getBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findOne({ trip: req.params.tripId, user: req.user._id });

  if (!budget) {
    return errorResponse(res, 404, 'Budget not found');
  }

  successResponse(res, 200, 'Budget fetched successfully', budget);
});

// @desc    Create/Update total budget
// @route   POST /api/budgets/:tripId
// @access  Private
const createOrUpdateBudget = asyncHandler(async (req, res) => {
  let budget = await Budget.findOne({ trip: req.params.tripId, user: req.user._id });

  if (!budget) {
    budget = await Budget.create({
      user: req.user._id,
      trip: req.params.tripId,
      totalBudget: req.body.totalBudget || 0,
      currency: req.body.currency || 'USD',
      expenses: []
    });
  } else {
    budget.totalBudget = req.body.totalBudget !== undefined ? req.body.totalBudget : budget.totalBudget;
    budget.currency = req.body.currency || budget.currency;
    await budget.save();
  }

  successResponse(res, 201, 'Budget saved successfully', budget);
});

// @desc    Update budget main details
// @route   PUT /api/budgets/:id
// @access  Private
const updateBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true }
  );

  if (!budget) {
    return errorResponse(res, 404, 'Budget not found');
  }

  successResponse(res, 200, 'Budget updated successfully', budget);
});

// @desc    Add expense to budget
// @route   POST /api/budgets/:id/expense
// @access  Private
const addExpense = asyncHandler(async (req, res) => {
  const budget = await Budget.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { $push: { expenses: req.body } },
    { new: true }
  );

  if (!budget) {
    return errorResponse(res, 404, 'Budget not found');
  }

  successResponse(res, 201, 'Expense added successfully', budget);
});

// @desc    Update expense
// @route   PUT /api/budgets/:id/expense/:expenseId
// @access  Private
const updateExpense = asyncHandler(async (req, res) => {
  const { expenseId } = req.params;
  
  const budget = await Budget.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id, "expenses._id": expenseId },
    { $set: { "expenses.$": { ...req.body, _id: expenseId } } },
    { new: true }
  );

  if (!budget) {
    return errorResponse(res, 404, 'Budget or expense not found');
  }

  successResponse(res, 200, 'Expense updated successfully', budget);
});

// @desc    Delete expense
// @route   DELETE /api/budgets/:id/expense/:expenseId
// @access  Private
const deleteExpense = asyncHandler(async (req, res) => {
  const { expenseId } = req.params;

  const budget = await Budget.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { $pull: { expenses: { _id: expenseId } } },
    { new: true }
  );

  if (!budget) {
    return errorResponse(res, 404, 'Budget not found');
  }

  successResponse(res, 200, 'Expense deleted successfully', budget);
});

module.exports = {
  getBudget,
  createOrUpdateBudget,
  updateBudget,
  addExpense,
  updateExpense,
  deleteExpense
};
