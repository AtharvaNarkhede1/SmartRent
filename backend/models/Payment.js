const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
  },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  amount: {
    type: Number,
    required: true,
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  dueDate: { type: Date },
  billingPeriod: { type: String, match: /^\d{4}-\d{2}$/ },
  paymentMethod: {
    type: String,
  },
  transactionId: {
    type: String,
  },
  notes: { type: String, trim: true, maxlength: 1000 },
  status: {
    type: String,
    enum: ['Paid', 'Pending', 'Overdue', 'Partial'],
    default: 'Paid',
  },
  receiptNumber: {
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
