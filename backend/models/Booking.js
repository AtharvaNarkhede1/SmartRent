const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  guestName: { type: String, required: true, trim: true },
  guestPhone: { type: String, required: true, trim: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  amount: { type: Number, required: true, min: 0 },
  type: { type: String, trim: true, default: 'Monthly Stay' },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
