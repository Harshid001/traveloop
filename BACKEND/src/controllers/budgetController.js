const Budget = require('../models/Budget');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const normalizeExpense = (expense = {}) => ({
  title: expense.title,
  category: expense.category || 'Food',
  amount: expense.amount,
  date: expense.date || new Date(),
  note: expense.note || expense.notes || '',
  paymentMethod: expense.paymentMethod || 'cash',
});

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

const getTripBudget = asyncHandler(async (req, res) => {
  let budget = await Budget.findOne({ trip: req.params.tripId, user: req.user._id });
  if (!budget) {
    budget = await Budget.create({
      user: req.user._id,
      trip: req.params.tripId,
      totalBudget: 0,
      currency: 'INR',
      expenses: [],
    });
  }
  successResponse(res, 200, 'Budget fetched successfully', budget);
});

const addTripExpense = asyncHandler(async (req, res) => {
  let budget = await Budget.findOne({ trip: req.params.tripId, user: req.user._id });
  if (!budget) {
    budget = await Budget.create({
      user: req.user._id,
      trip: req.params.tripId,
      totalBudget: req.body.totalBudget || 0,
      currency: req.body.currency || 'INR',
      expenses: [],
    });
  }
  budget.expenses.push(normalizeExpense(req.body));
  await budget.save();
  successResponse(res, 201, 'Expense added successfully', budget);
});

const updateTripExpense = asyncHandler(async (req, res) => {
  const budget = await Budget.findOne({ trip: req.params.tripId, user: req.user._id });
  if (!budget) return errorResponse(res, 404, 'Budget not found');
  const expense = budget.expenses.id(req.params.expenseId);
  if (!expense) return errorResponse(res, 404, 'Expense not found');
  Object.assign(expense, normalizeExpense(req.body));
  await budget.save();
  successResponse(res, 200, 'Expense updated successfully', budget);
});

const deleteTripExpense = asyncHandler(async (req, res) => {
  const budget = await Budget.findOne({ trip: req.params.tripId, user: req.user._id });
  if (!budget) return errorResponse(res, 404, 'Budget not found');
  budget.expenses = budget.expenses.filter((expense) => String(expense._id) !== req.params.expenseId);
  await budget.save();
  successResponse(res, 200, 'Expense deleted successfully', budget);
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
  getTripBudget,
  addTripExpense,
  updateTripExpense,
  deleteTripExpense,
  updateExpense,
  deleteExpense
};
