const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  emergencyContact: {
    type: String,
  },
  idProof: {
    type: String,
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
  },
  rent: {
    type: Number,
    required: true,
  },
  dueDay: { type: Number, min: 1, max: 28, default: 1 },
  deposit: {
    type: Number,
  },
  joiningDate: {
    type: Date,
  },
  leaseEndDate: {
    type: Date,
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Pending', 'Overdue', 'Partial'],
    default: 'Pending',
  },
  avatar: {
    type: String,
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Tenant', tenantSchema);
