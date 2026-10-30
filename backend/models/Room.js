const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  },
  type: {
    type: String, // Single, Double Sharing, etc.
    required: true,
  },
  rent: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Vacant', 'Occupied', 'Maintenance', 'Partial'],
    default: 'Vacant',
  },
  floor: {
    type: Number,
  },
  beds: {
    type: Number,
    default: 1,
  },
  tenantAssigned: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    default: null,
  }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
