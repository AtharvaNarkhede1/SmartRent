const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80',
  },
  description: {
    type: String,
  },
  floors: {
    type: Number,
    default: 1,
  },
  monthlyRevenue: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
