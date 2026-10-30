const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
  },
  tenantName: {
    type: String,
    required: true,
  },
  amountDue: {
    type: Number,
    required: true,
  },
  dueDate: { type: Date },
  billingPeriod: { type: String, match: /^\d{4}-\d{2}$/ },
  method: {
    type: String,
    enum: ['WhatsApp', 'Email', 'Copy'],
    default: 'WhatsApp',
  },
  status: {
    type: String,
    default: 'Opened in WhatsApp; not sent',
  }
}, { timestamps: true });

module.exports = mongoose.model('Reminder', reminderSchema);
