const mongoose = require('mongoose');

const financialTransactionSchema = new mongoose.Schema({
  description: { type: String, required: true, trim: true, maxlength: 300 },
  category: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0.01 },
  type: { type: String, enum: ['Income', 'Expense'], required: true },
  date: { type: Date, required: true, default: Date.now },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  notes: { type: String, trim: true, maxlength: 1000 }
}, { timestamps: true });

module.exports = mongoose.model('FinancialTransaction', financialTransactionSchema);
