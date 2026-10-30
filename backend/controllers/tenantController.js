const mongoose = require('mongoose');
const Tenant = require('../models/Tenant');
const Room = require('../models/Room');
const Payment = require('../models/Payment');
const Reminder = require('../models/Reminder');

const validId = (id) => mongoose.isValidObjectId(id);
const tenantQuery = () => Tenant.find().populate({ path: 'room', select: 'roomNumber type status rent property', populate: { path: 'property', select: 'name' } });
const validate = (body, partial = false) => {
  if (!partial || body.name !== undefined) if (!String(body.name || '').trim()) return 'Tenant name is required.';
  if (!partial || body.phone !== undefined) if (!String(body.phone || '').trim()) return 'Tenant phone is required.';
  if (!partial || body.rent !== undefined) if (!Number.isFinite(Number(body.rent)) || Number(body.rent) <= 0) return 'Monthly rent must be greater than zero.';
  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) return 'Enter a valid email address.';
  if (body.avatar && !/^(https?:\/\/|\/uploads\/|data:image\/)/i.test(body.avatar)) return 'Tenant image must be a valid image URL.';
  return null;
};
function safeError(res, error) {
  if (error.name === 'ValidationError' || error.name === 'CastError') return res.status(400).json({ success: false, message: error.message });
  return res.status(500).json({ success: false, message: 'Unable to save tenant.' });
}

exports.getTenants = async (req, res) => {
  try {
    const tenants = await tenantQuery();
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const paidRows = await Payment.aggregate([
      { $match: { $or: [{ billingPeriod: period }, { billingPeriod: { $exists: false }, paymentDate: { $gte: start, $lt: end } }] } },
      { $match: { status: { $ne: 'Pending' } } },
      { $group: { _id: '$tenant', paid: { $sum: '$amount' } } }
    ]);
    const paidByTenant = new Map(paidRows.map((row) => [String(row._id), row.paid]));
    const data = tenants.map((tenant) => {
      const paid = paidByTenant.get(String(tenant._id)) || 0;
      tenant.set('currentBalance', Math.max(0, Number(tenant.rent || 0) - paid), { strict: false });
      tenant.set('paymentStatus', paid >= tenant.rent ? 'Paid' : paid > 0 ? 'Partial' : 'Pending');
      return tenant;
    });
    res.json({ success: true, count: data.length, data });
  }
  catch (error) { safeError(res, error); }
};
exports.getTenant = async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid tenant ID.' });
  try { const tenant = await Tenant.findById(req.params.id).populate({ path: 'room', populate: { path: 'property', select: 'name' } }); if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found.' }); res.json({ success: true, data: tenant }); }
  catch (error) { safeError(res, error); }
};
exports.createTenant = async (req, res) => {
  const invalid = validate(req.body);
  if (invalid) return res.status(400).json({ success: false, message: invalid });
  try {
    const roomId = req.body.room || null;
    const room = roomId ? await Room.findById(roomId) : null;
    if (roomId && !room) return res.status(404).json({ success: false, message: 'Room not found.' });
    if (room && (room.tenantAssigned || room.status === 'Occupied' || room.status === 'Maintenance')) return res.status(409).json({ success: false, message: 'This room is not available for assignment.' });
    const tenant = await Tenant.create({ name: req.body.name.trim(), phone: req.body.phone.trim(), email: req.body.email?.trim(), address: req.body.address?.trim(), emergencyContact: req.body.emergencyContact?.trim(), idProof: req.body.idProof, avatar: req.body.avatar, room: roomId, rent: Number(req.body.rent), deposit: req.body.deposit === '' || req.body.deposit == null ? undefined : Number(req.body.deposit), dueDay: req.body.dueDay, joiningDate: req.body.joiningDate || req.body.moveInDate, leaseEndDate: req.body.leaseEndDate });
    if (room) { room.tenantAssigned = tenant._id; room.status = 'Occupied'; await room.save(); }
    const data = await Tenant.findById(tenant._id).populate({ path: 'room', populate: { path: 'property', select: 'name' } });
    res.status(201).json({ success: true, data });
  } catch (error) { safeError(res, error); }
};
exports.updateTenant = async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid tenant ID.' });
  const invalid = validate(req.body, true);
  if (invalid) return res.status(400).json({ success: false, message: invalid });
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found.' });
    const changesRoom = (Object.prototype.hasOwnProperty.call(req.body, 'room') && String(req.body.room || '') !== String(tenant.room || '')) || (req.body.isActive === false && Boolean(tenant.room));
    const nextRoomId = changesRoom ? (req.body.room || null) : tenant.room;
    const newRoom = nextRoomId ? await Room.findById(nextRoomId) : null;
    if (nextRoomId && !newRoom) return res.status(404).json({ success: false, message: 'Room not found.' });
    if (newRoom && (newRoom.status === 'Maintenance' || (newRoom.status === 'Occupied' && String(newRoom.tenantAssigned || '') !== String(tenant._id)) || (newRoom.tenantAssigned && String(newRoom.tenantAssigned) !== String(tenant._id)))) return res.status(409).json({ success: false, message: 'This room is not available for assignment.' });
    if (req.body.rent !== undefined) {
      const now = new Date();
      const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const rows = await Payment.aggregate([
        { $match: { tenant: tenant._id, status: { $ne: 'Pending' }, $or: [{ billingPeriod: period }, { billingPeriod: { $exists: false }, paymentDate: { $gte: start, $lt: end } }] } },
        { $group: { _id: null, paid: { $sum: '$amount' } } }
      ]);
      if ((rows[0]?.paid || 0) > Number(req.body.rent)) return res.status(409).json({ success: false, message: 'Monthly rent cannot be lower than payments already recorded for this period.' });
    }
    const oldRoomId = tenant.room;
    const fields = ['name', 'phone', 'email', 'address', 'emergencyContact', 'idProof', 'avatar', 'rent', 'deposit', 'dueDay', 'joiningDate', 'leaseEndDate', 'isActive'];
    for (const field of fields) if (Object.prototype.hasOwnProperty.call(req.body, field)) tenant[field] = req.body[field];
    if (Object.prototype.hasOwnProperty.call(req.body, 'moveInDate')) tenant.joiningDate = req.body.moveInDate;
    if (changesRoom) tenant.room = nextRoomId;
    await tenant.save();
    if (changesRoom && oldRoomId) {
      const oldRoom = await Room.findById(oldRoomId);
      if (oldRoom && String(oldRoom.tenantAssigned) === String(tenant._id)) { oldRoom.tenantAssigned = null; if (oldRoom.status === 'Occupied' || oldRoom.status === 'Partial') oldRoom.status = 'Vacant'; await oldRoom.save(); }
    }
    if (changesRoom && newRoom) { newRoom.tenantAssigned = tenant._id; newRoom.status = 'Occupied'; await newRoom.save(); }
    const data = await Tenant.findById(tenant._id).populate({ path: 'room', populate: { path: 'property', select: 'name' } });
    res.json({ success: true, data });
  } catch (error) { safeError(res, error); }
};
exports.deleteTenant = async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid tenant ID.' });
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found.' });
    if (await Promise.all([Payment.exists({ tenant: tenant._id }), Reminder.exists({ tenant: tenant._id })]).then((records) => records.some(Boolean))) return res.status(409).json({ success: false, message: 'Tenant has financial or reminder history. Mark the tenant as moved out to preserve related records.' });
    if (tenant.room) {
      const room = await Room.findById(tenant.room);
      if (room && String(room.tenantAssigned) === String(tenant._id)) { room.tenantAssigned = null; if (room.status === 'Occupied' || room.status === 'Partial') room.status = 'Vacant'; await room.save(); }
    }
    await tenant.deleteOne();
    res.json({ success: true, data: {} });
  } catch (error) { safeError(res, error); }
};
