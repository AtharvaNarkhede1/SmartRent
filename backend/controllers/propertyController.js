const Property = require('../models/Property');
const Room = require('../models/Room');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Maintenance = require('../models/Maintenance');
const Payment = require('../models/Payment');

// @desc    Get all properties
// @route   GET /api/properties
// @access  Private
exports.getProperties = async (req, res) => {
  try {
    const properties = await Property.find();
    res.status(200).json({ success: true, count: properties.length, data: properties });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Private
exports.getProperty = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid property ID.' });
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    res.status(200).json({ success: true, data: property });
  } catch (error) {
    res.status(error.name === 'CastError' ? 400 : 500).json({ success: false, message: error.name === 'CastError' ? error.message : 'Unable to load property.' });
  }
};

// @desc    Create property
// @route   POST /api/properties
// @access  Private
exports.createProperty = async (req, res) => {
  try {
    const { name, address, type } = req.body;
    if (!name || !address || !type) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const property = await Property.create({ name: name.trim(), address: address.trim(), type: type.trim(), image: req.body.image, description: req.body.description, floors: req.body.floors, monthlyRevenue: 0 });
    res.status(201).json({ success: true, data: property });
  } catch (error) {
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ success: false, message: error.name === 'ValidationError' ? error.message : 'Unable to create property.' });
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private
exports.updateProperty = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid property ID.' });
  try {
    let property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    for (const field of ['name', 'address', 'type', 'image', 'description', 'floors']) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) property[field] = req.body[field];
    }
    await property.save();

    res.status(200).json({ success: true, data: property });
  } catch (error) {
    res.status(error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500).json({ success: false, message: error.name === 'ValidationError' || error.name === 'CastError' ? error.message : 'Unable to update property.' });
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private
exports.deleteProperty = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid property ID.' });
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (await Room.exists({ property: property._id })) {
      return res.status(409).json({ success: false, message: 'Move or remove this property’s rooms before deleting it.' });
    }
    if (await Promise.all([Booking.exists({ property: property._id }), Maintenance.exists({ property: property._id }), Payment.exists({ property: property._id })]).then((records) => records.some(Boolean))) {
      return res.status(409).json({ success: false, message: 'This property has financial or operational history and cannot be deleted.' });
    }

    await property.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
