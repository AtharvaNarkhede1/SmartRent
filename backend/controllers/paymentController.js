const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Tenant = require('../models/Tenant');
const Room = require('../models/Room');
const Notification = require('../models/Notification');

const validId = (id) => mongoose.isValidObjectId(id);
const periodFor = (date) => {
  const value = new Date(date);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}`;
};
const monthRange = (period) => {
  const [year, month] = period.split('-').map(Number);
  return { $gte: new Date(year, month - 1, 1), $lt: new Date(year, month, 1) };
};
const paymentsFor = (tenantId, period, exceptId) => {
  const query = { tenant: tenantId, $or: [{ billingPeriod: period }, { billingPeriod: { $exists: false }, paymentDate: monthRange(period) }] };
  if (exceptId) query._id = { $ne: exceptId };
  return Payment.find(query);
};
async function refreshTenantStatus(tenantId, period) {
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) return;
  const periodPayments = await paymentsFor(tenantId, period);
  const paid = periodPayments.filter((payment) => payment.status !== 'Pending').reduce((sum, payment) => sum + payment.amount, 0);
  const currentPeriod = periodFor(new Date());
  if (period === currentPeriod) {
    tenant.paymentStatus = paid >= tenant.rent ? 'Paid' : paid > 0 ? 'Partial' : 'Pending';
    await tenant.save();
  }
}
function validatePaymentInput(body) {
  const amount = Number(body.amount);
  const paymentDate = body.paymentDate ? new Date(body.paymentDate) : new Date();
  const billingPeriod = body.billingPeriod || periodFor(paymentDate);
  if (!body.tenant || !validId(body.tenant)) return 'Choose a valid tenant.';
  if (!Number.isFinite(amount) || amount <= 0) return 'Amount must be greater than zero.';
  if (Number.isNaN(paymentDate.getTime())) return 'Enter a valid payment date.';
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(billingPeriod)) return 'Enter a valid rental period (YYYY-MM).';
  return null;
}
const populate = (query) => query.populate('tenant', 'name email phone rent').populate({ path: 'room', select: 'roomNumber property', populate: { path: 'property', select: 'name' } }).populate('property', 'name');

exports.getPayments = async (req, res) => {
  try {
    const payments = await populate(Payment.find().sort({ paymentDate: -1, createdAt: -1 }));
    res.json({ success: true, count: payments.length, data: payments });
  } catch (error) { res.status(500).json({ success: false, message: 'Unable to load payments.' }); }
};

exports.getPayment = async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid payment ID.' });
  try {
    const payment = await populate(Payment.findById(req.params.id));
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found.' });
    res.json({ success: true, data: payment });
  } catch (error) { res.status(500).json({ success: false, message: 'Unable to load payment.' }); }
};

exports.createPayment = async (req, res) => {
  const invalid = validatePaymentInput(req.body);
  if (invalid) return res.status(400).json({ success: false, message: invalid });
  try {
    const tenant = await Tenant.findById(req.body.tenant);
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found.' });
    if (tenant.isActive === false) return res.status(409).json({ success: false, message: 'This tenant has moved out and cannot receive a new payment entry.' });
    const transactionId = String(req.body.transactionId || '').trim();
    if (transactionId && await Payment.exists({ tenant: tenant._id, transactionId })) return res.status(409).json({ success: false, message: 'This transaction reference has already been recorded for the tenant.' });
    const period = req.body.billingPeriod || periodFor(req.body.paymentDate || new Date());
    const periodPayments = await paymentsFor(tenant._id, period);
    const alreadyPaid = periodPayments.filter((payment) => payment.status !== 'Pending').reduce((sum, payment) => sum + payment.amount, 0);
    const amount = Number(req.body.amount);
    const outstanding = Math.max(0, Number(tenant.rent) - alreadyPaid);
    if (amount > outstanding + 0.0001) return res.status(400).json({ success: false, message: `Amount exceeds the outstanding balance of ${outstanding.toFixed(2)}.` });

    let roomId = req.body.room || tenant.room || null;
    const room = roomId ? await Room.findById(roomId).populate('property', 'name') : null;
    if (roomId && !room) return res.status(400).json({ success: false, message: 'The selected room no longer exists.' });
    const payment = await Payment.create({
      tenant: tenant._id, room: roomId, property: req.body.property || room?.property?._id,
      amount, paymentDate: new Date(req.body.paymentDate || Date.now()), dueDate: req.body.dueDate || null,
      billingPeriod: period, paymentMethod: String(req.body.paymentMethod || '').trim(),
      transactionId, notes: String(req.body.notes || '').trim(), status: 'Paid'
    });
    await refreshTenantStatus(tenant._id, period);
    await Notification.create({ message: `Payment of ₹${amount.toLocaleString('en-IN')} recorded for ${tenant.name} (${period}).` });
    const result = await populate(Payment.findById(payment._id));
    res.status(201).json({ success: true, data: result, balance: outstanding - amount });
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') return res.status(400).json({ success: false, message: error.message });
    res.status(500).json({ success: false, message: 'Unable to record payment.' });
  }
};

exports.updatePayment = async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid payment ID.' });
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found.' });
    const next = { ...payment.toObject(), ...req.body };
    next.tenant = req.body.tenant || payment.tenant;
    const invalid = validatePaymentInput({ ...next, tenant: next.tenant });
    if (invalid) return res.status(400).json({ success: false, message: invalid });
    const tenant = await Tenant.findById(next.tenant);
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found.' });
    const transactionId = String(next.transactionId || '').trim();
    if (transactionId && await Payment.exists({ tenant: tenant._id, transactionId, _id: { $ne: payment._id } })) return res.status(409).json({ success: false, message: 'This transaction reference has already been recorded for the tenant.' });
    const period = next.billingPeriod || periodFor(next.paymentDate);
    const peers = await paymentsFor(tenant._id, period, payment._id);
    const priorPaid = peers.filter((row) => row.status !== 'Pending').reduce((sum, row) => sum + row.amount, 0);
    if (Number(next.amount) + priorPaid > tenant.rent + 0.0001) return res.status(400).json({ success: false, message: 'Correction would exceed this tenant’s rent for the selected period.' });
    const oldTenant = String(payment.tenant);
    const oldPeriod = payment.billingPeriod || periodFor(payment.paymentDate);
    for (const key of ['tenant', 'room', 'property', 'amount', 'paymentDate', 'dueDate', 'billingPeriod', 'paymentMethod', 'transactionId', 'notes', 'status']) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) payment[key] = req.body[key];
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'transactionId')) payment.transactionId = transactionId;
    payment.billingPeriod = period;
    await payment.save();
    await refreshTenantStatus(oldTenant, oldPeriod);
    await refreshTenantStatus(tenant._id, period);
    res.json({ success: true, data: await populate(Payment.findById(payment._id)) });
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') return res.status(400).json({ success: false, message: error.message });
    res.status(500).json({ success: false, message: 'Unable to update payment.' });
  }
};

exports.deletePayment = async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid payment ID.' });
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found.' });
    const tenantId = String(payment.tenant);
    const period = payment.billingPeriod || periodFor(payment.paymentDate);
    await payment.deleteOne();
    await refreshTenantStatus(tenantId, period);
    res.json({ success: true, data: {} });
  } catch (error) { res.status(500).json({ success: false, message: 'Unable to delete payment.' }); }
};

exports._test = { periodFor, monthRange, validatePaymentInput };
