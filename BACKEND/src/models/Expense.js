const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
    budget: { type: mongoose.Schema.Types.ObjectId, ref: 'Budget' },
    title: { type: String, required: true },
    category: { type: String, default: 'Food' },
    amount: { type: Number, required: true },
    currency: { type: String, enum: ['INR', 'USD'], default: 'INR' },
    destination: { type: String, default: '' },
    date: { type: Date, default: Date.now },
    note: { type: String, default: '' },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Expense', expenseSchema);
