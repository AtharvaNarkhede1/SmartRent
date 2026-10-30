const mongoose = require('mongoose');
const Transaction = require('../models/FinancialTransaction');
const Property = require('../models/Property');

const validId = (id) => mongoose.isValidObjectId(id);
const validate = (body, partial = false) => {
  if ((!partial || body.description !== undefined) && !String(body.description || '').trim()) return 'Description is required.';
  if ((!partial || body.category !== undefined) && !String(body.category || '').trim()) return 'Category is required.';
  if ((!partial || body.amount !== undefined) && (!Number.isFinite(Number(body.amount)) || Number(body.amount) <= 0)) return 'Amount must be greater than zero.';
  if ((!partial || body.type !== undefined) && !['Income', 'Expense'].includes(body.type)) return 'Choose Income or Expense.';
  if (body.date && Number.isNaN(new Date(body.date).getTime())) return 'Enter a valid date.';
  return null;
};
const populate = (query) => query.populate('property', 'name');

exports.getTransactions = async (req, res) => {
  try { const data = await populate(Transaction.find().sort({ date: -1, createdAt: -1 })); res.json({ success: true, count: data.length, data }); }
  catch (error) { res.status(500).json({ success: false, message: 'Unable to load transactions.' }); }
};
exports.createTransaction = async (req, res) => {
  const invalid = validate(req.body);
  if (invalid) return res.status(400).json({ success: false, message: invalid });
  try {
    if (req.body.property && !await Property.exists({ _id: req.body.property })) return res.status(404).json({ success: false, message: 'Property not found.' });
    const transaction = await Transaction.create({ ...req.body, description: req.body.description.trim(), category: req.body.category.trim(), amount: Number(req.body.amount) });
    res.status(201).json({ success: true, data: await populate(Transaction.findById(transaction._id)) });
  } catch (error) { res.status(error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500).json({ success: false, message: error.name === 'ValidationError' || error.name === 'CastError' ? error.message : 'Unable to create transaction.' }); }
};
exports.updateTransaction = async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid transaction ID.' });
  const invalid = validate(req.body, true);
  if (invalid) return res.status(400).json({ success: false, message: invalid });
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found.' });
    if (req.body.property && !await Property.exists({ _id: req.body.property })) return res.status(404).json({ success: false, message: 'Property not found.' });
    for (const field of ['description', 'category', 'amount', 'type', 'date', 'property', 'notes']) if (Object.prototype.hasOwnProperty.call(req.body, field)) transaction[field] = req.body[field];
    await transaction.save();
    res.json({ success: true, data: await populate(Transaction.findById(transaction._id)) });
  } catch (error) { res.status(error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500).json({ success: false, message: error.name === 'ValidationError' || error.name === 'CastError' ? error.message : 'Unable to update transaction.' }); }
};
exports.deleteTransaction = async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid transaction ID.' });
  try { const transaction = await Transaction.findById(req.params.id); if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found.' }); await transaction.deleteOne(); res.json({ success: true, data: {} }); }
  catch (error) { res.status(500).json({ success: false, message: 'Unable to delete transaction.' }); }
};
