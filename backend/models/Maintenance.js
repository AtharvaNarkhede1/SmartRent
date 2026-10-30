const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  category: { type: String, required: true, trim: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  assignedPerson: { type: String, trim: true },
  estimatedCost: { type: Number, min: 0, default: 0 },
  status: { type: String, enum: ['Open', 'In Progress', 'Completed'], default: 'Open' }
}, { timestamps: true });

module.exports = mongoose.model('Maintenance', maintenanceSchema);
