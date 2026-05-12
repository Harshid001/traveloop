const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, default: 'other' },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  note: { type: String, default: '' },
  paymentMethod: { type: String, default: 'cash' }
});

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      unique: true, // One budget doc per trip
    },
    totalBudget: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    expenses: [expenseSchema]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Budget', budgetSchema);
