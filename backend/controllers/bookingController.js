const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const Room = require('../models/Room');

const validId = (id) => mongoose.isValidObjectId(id);
const hydrate = (query) => query.populate('property', 'name').populate('room', 'roomNumber property');
const validDates = (body) => {
  const start = new Date(body.checkIn);
  const end = new Date(body.checkOut);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return 'Check-out must be after check-in.';
  return null;
};
const roomAvailability = async (roomId, checkIn, checkOut, omitId) => {
  if (!validId(roomId)) return { error: 'Choose a valid room.' };
  const room = await Room.findById(roomId);
  if (!room) return { error: 'Room not found.' };
  if (room.status === 'Maintenance' || room.status === 'Occupied') return { error: 'This room is not available for a booking.' };
  const overlap = await Booking.exists({ room: roomId, status: { $ne: 'Cancelled' }, checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn }, ...(omitId ? { _id: { $ne: omitId } } : {}) });
  return overlap ? { error: 'The room is already booked for part of this date range.' } : { room };
};

exports.getBookings = async (req, res) => {
  try { const data = await hydrate(Booking.find().sort({ checkIn: 1, createdAt: -1 })); res.json({ success: true, count: data.length, data }); }
  catch (error) { res.status(500).json({ success: false, message: 'Unable to load bookings.' }); }
};
exports.createBooking = async (req, res) => {
  const dateError = validDates(req.body);
  if (dateError) return res.status(400).json({ success: false, message: dateError });
  if (!String(req.body.guestName || '').trim() || !String(req.body.guestPhone || '').trim()) return res.status(400).json({ success: false, message: 'Guest name and phone are required.' });
  if (!Number.isFinite(Number(req.body.amount)) || Number(req.body.amount) < 0) return res.status(400).json({ success: false, message: 'Enter a valid booking amount.' });
  try {
    if (!validId(req.body.property) || !await Property.exists({ _id: req.body.property })) return res.status(400).json({ success: false, message: 'Choose a valid property.' });
    const available = await roomAvailability(req.body.room, req.body.checkIn, req.body.checkOut);
    if (available.error) return res.status(409).json({ success: false, message: available.error });
    if (String(available.room.property) !== String(req.body.property)) return res.status(400).json({ success: false, message: 'The room does not belong to the selected property.' });
    const created = await Booking.create({ ...req.body, guestName: req.body.guestName.trim(), guestPhone: req.body.guestPhone.trim(), amount: Number(req.body.amount), status: 'Pending' });
    res.status(201).json({ success: true, data: await hydrate(Booking.findById(created._id)) });
  } catch (error) { res.status(error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500).json({ success: false, message: error.name === 'ValidationError' || error.name === 'CastError' ? error.message : 'Unable to create booking.' }); }
};
exports.updateBooking = async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid booking ID.' });
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    const next = { ...booking.toObject(), ...req.body };
    const dateError = validDates(next);
    if (dateError) return res.status(400).json({ success: false, message: dateError });
    if (Number(next.amount) < 0 || !Number.isFinite(Number(next.amount))) return res.status(400).json({ success: false, message: 'Enter a valid booking amount.' });
    if (!validId(next.property) || !await Property.exists({ _id: next.property })) return res.status(400).json({ success: false, message: 'Choose a valid property.' });
    if (!validId(next.room)) return res.status(400).json({ success: false, message: 'Choose a valid room.' });
    const selectedRoom = await Room.findById(next.room);
    if (!selectedRoom || String(selectedRoom.property) !== String(next.property)) return res.status(400).json({ success: false, message: 'The room does not belong to the selected property.' });
    if (next.status !== 'Cancelled' && (req.body.room || req.body.checkIn || req.body.checkOut || req.body.status)) {
      const available = await roomAvailability(next.room, next.checkIn, next.checkOut, booking._id);
      if (available.error) return res.status(409).json({ success: false, message: available.error });
    }
    for (const field of ['guestName', 'guestPhone', 'property', 'room', 'checkIn', 'checkOut', 'amount', 'type', 'status']) if (Object.prototype.hasOwnProperty.call(req.body, field)) booking[field] = req.body[field];
    await booking.save();
    res.json({ success: true, data: await hydrate(Booking.findById(booking._id)) });
  } catch (error) { res.status(error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500).json({ success: false, message: error.name === 'ValidationError' || error.name === 'CastError' ? error.message : 'Unable to update booking.' }); }
};
exports.deleteBooking = async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid booking ID.' });
  try { const booking = await Booking.findById(req.params.id); if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' }); await booking.deleteOne(); res.json({ success: true, data: {} }); }
  catch (error) { res.status(500).json({ success: false, message: 'Unable to delete booking.' }); }
};
