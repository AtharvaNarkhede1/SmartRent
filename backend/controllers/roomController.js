const Room = require('../models/Room');
const Tenant = require('../models/Tenant');
const Payment = require('../models/Payment');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Maintenance = require('../models/Maintenance');

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Private
exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate('property', 'name')
      .populate('tenantAssigned', 'name phone email');
    res.status(200).json({ success: true, count: rooms.length, data: rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get single room
// @route   GET /api/rooms/:id
// @access  Private
exports.getRoom = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid room ID.' });
  try {
    const room = await Room.findById(req.params.id)
      .populate('property', 'name')
      .populate('tenantAssigned', 'name phone email');
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    res.status(200).json({ success: true, data: room });
  } catch (error) {
    res.status(error.name === 'CastError' ? 400 : 500).json({ success: false, message: 'Unable to load room.' });
  }
};

// @desc    Create room
// @route   POST /api/rooms
// @access  Private
exports.createRoom = async (req, res) => {
  try {
    const { roomNumber, type, rent, property } = req.body;
    if (!roomNumber || !type || rent === undefined || rent === null || !property) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const existingRoom = await Room.findOne({ roomNumber, property });
    if (existingRoom) {
      return res.status(400).json({ success: false, message: 'Room number already exists in this property' });
    }

    const Property = require('../models/Property');
    if (!await Property.exists({ _id: property })) return res.status(404).json({ success: false, message: 'Property not found.' });
    if (!Number.isFinite(Number(rent)) || Number(rent) <= 0) return res.status(400).json({ success: false, message: 'Rent must be greater than zero.' });
    if (req.body.status && !['Vacant', 'Maintenance'].includes(req.body.status)) return res.status(400).json({ success: false, message: 'New rooms must start vacant or in maintenance.' });

    const room = await Room.create({ ...req.body, status: req.body.status || 'Vacant', tenantAssigned: null });
    res.status(201).json({ success: true, data: room });
  } catch (error) {
    res.status(error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500).json({ success: false, message: 'Unable to create room.' });
  }
};

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private
exports.updateRoom = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid room ID.' });
  try {
    let room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Check if room number is being changed and if it already exists
    if ((req.body.roomNumber && req.body.roomNumber !== room.roomNumber) || (req.body.property && String(req.body.property) !== String(room.property))) {
      const existingRoom = await Room.findOne({ roomNumber: req.body.roomNumber, property: req.body.property || room.property, _id: { $ne: room._id } });
      if (existingRoom) {
        return res.status(400).json({ success: false, message: 'Room number already exists in this property.' });
      }
    }

    if (room.tenantAssigned && req.body.property && String(req.body.property) !== String(room.property)) {
      return res.status(409).json({ success: false, message: 'Vacate the room before moving it to another property.' });
    }
    if (req.body.property && String(req.body.property) !== String(room.property) && await Promise.all([Payment.exists({ room: room._id }), Booking.exists({ room: room._id }), Maintenance.exists({ room: room._id })]).then((records) => records.some(Boolean))) {
      return res.status(409).json({ success: false, message: 'This room has related records and cannot be moved to another property.' });
    }
    if (room.tenantAssigned && req.body.status === 'Vacant') return res.status(409).json({ success: false, message: 'Unassign the tenant before marking this room vacant.' });
    if ((req.body.status === 'Occupied' || req.body.status === 'Partial') && !room.tenantAssigned) return res.status(409).json({ success: false, message: 'Assign a tenant before setting an occupied room status.' });

    if (req.body.property) {
      const Property = require('../models/Property');
      if (!await Property.exists({ _id: req.body.property })) return res.status(404).json({ success: false, message: 'Property not found.' });
    }
    if (req.body.rent !== undefined && (!Number.isFinite(Number(req.body.rent)) || Number(req.body.rent) <= 0)) return res.status(400).json({ success: false, message: 'Rent must be greater than zero.' });
    for (const field of ['roomNumber', 'property', 'type', 'rent', 'status', 'floor', 'beds']) if (Object.prototype.hasOwnProperty.call(req.body, field)) room[field] = req.body[field];
    await room.save();

    res.status(200).json({ success: true, data: room });
  } catch (error) {
    res.status(error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500).json({ success: false, message: 'Unable to update room.' });
  }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private
exports.deleteRoom = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid room ID.' });
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (room.tenantAssigned) {
       return res.status(400).json({ success: false, message: 'Cannot delete an occupied room. Unassign the tenant first.' });
    }

    if (await Payment.exists({ room: room._id })) return res.status(409).json({ success: false, message: 'This room has payment history and cannot be deleted.' });
    if (await Promise.all([Booking.exists({ room: room._id }), Maintenance.exists({ room: room._id })]).then((records) => records.some(Boolean))) return res.status(409).json({ success: false, message: 'This room has booking or maintenance history and cannot be deleted.' });

    await room.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
