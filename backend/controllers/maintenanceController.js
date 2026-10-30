const mongoose = require('mongoose');
const Maintenance = require('../models/Maintenance');
const Property = require('../models/Property');
const Room = require('../models/Room');

const validId = (id) => mongoose.isValidObjectId(id);
const hydrate = (query) => query.populate('property', 'name').populate('room', 'roomNumber');
exports.getMaintenance = async (req, res) => {
  try { const data = await hydrate(Maintenance.find().sort({ createdAt: -1 })); res.json({ success: true, count: data.length, data }); }
  catch (error) { res.status(500).json({ success: false, message: 'Unable to load maintenance tickets.' }); }
};
exports.createMaintenance = async (req, res) => {
  if (!String(req.body.description || '').trim() || !String(req.body.category || '').trim()) return res.status(400).json({ success: false, message: 'Category and issue description are required.' });
  if (!Number.isFinite(Number(req.body.estimatedCost ?? 0)) || Number(req.body.estimatedCost ?? 0) < 0) return res.status(400).json({ success: false, message: 'Enter a valid estimated cost.' });
  try {
    if (!validId(req.body.property) || !await Property.exists({ _id: req.body.property })) return res.status(400).json({ success: false, message: 'Choose a valid property.' });
    if (req.body.room) { const room = await Room.findById(req.body.room); if (!room) return res.status(404).json({ success: false, message: 'Room not found.' }); if (String(room.property) !== String(req.body.property)) return res.status(400).json({ success: false, message: 'The room does not belong to the selected property.' }); }
    const created = await Maintenance.create({ ...req.body, description: req.body.description.trim(), estimatedCost: Number(req.body.estimatedCost || 0), status: 'Open' });
    res.status(201).json({ success: true, data: await hydrate(Maintenance.findById(created._id)) });
  } catch (error) { res.status(error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500).json({ success: false, message: error.name === 'ValidationError' || error.name === 'CastError' ? error.message : 'Unable to create maintenance ticket.' }); }
};
exports.updateMaintenance = async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid ticket ID.' });
  try {
    const ticket = await Maintenance.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found.' });
    if (req.body.room && req.body.property) { const room = await Room.findById(req.body.room); if (!room || String(room.property) !== String(req.body.property)) return res.status(400).json({ success: false, message: 'Choose a room within the selected property.' }); }
    for (const field of ['category', 'property', 'room', 'priority', 'description', 'assignedPerson', 'estimatedCost', 'status']) if (Object.prototype.hasOwnProperty.call(req.body, field)) ticket[field] = req.body[field];
    await ticket.save();
    res.json({ success: true, data: await hydrate(Maintenance.findById(ticket._id)) });
  } catch (error) { res.status(error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500).json({ success: false, message: error.name === 'ValidationError' || error.name === 'CastError' ? error.message : 'Unable to update ticket.' }); }
};
exports.deleteMaintenance = async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid ticket ID.' });
  try { const ticket = await Maintenance.findById(req.params.id); if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found.' }); await ticket.deleteOne(); res.json({ success: true, data: {} }); }
  catch (error) { res.status(500).json({ success: false, message: 'Unable to delete ticket.' }); }
};
