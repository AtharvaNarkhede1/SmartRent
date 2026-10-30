const Reminder = require('../models/Reminder');
const Tenant = require('../models/Tenant');
const mongoose = require('mongoose');

// @desc    Get all reminders
// @route   GET /api/reminders
// @access  Private
exports.getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reminders.length, data: reminders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Create a reminder log
// @route   POST /api/reminders
// @access  Private
exports.createReminder = async (req, res) => {
  try {
    const { tenant, tenantName, amountDue, method, status, dueDate, billingPeriod } = req.body;
    if (!mongoose.isValidObjectId(tenant)) return res.status(400).json({ success: false, message: 'Choose a valid tenant.' });
    if (!Number.isFinite(Number(amountDue)) || Number(amountDue) <= 0) return res.status(400).json({ success: false, message: 'Reminder amount must be greater than zero.' });
    if (method && !['WhatsApp', 'Email', 'Copy'].includes(method)) return res.status(400).json({ success: false, message: 'Unsupported reminder method.' });
    const currentTenant = await Tenant.findById(tenant);
    if (!currentTenant) return res.status(404).json({ success: false, message: 'Tenant not found.' });
    const validDate = dueDate ? new Date(dueDate) : undefined;
    if (validDate && Number.isNaN(validDate.getTime())) return res.status(400).json({ success: false, message: 'Enter a valid due date.' });
    const reminder = await Reminder.create({ tenant, tenantName: currentTenant.name, amountDue: Number(amountDue), method: method || 'WhatsApp', status: status || 'Opened in WhatsApp; not sent', dueDate: validDate, billingPeriod });
    res.status(201).json({ success: true, data: reminder });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

