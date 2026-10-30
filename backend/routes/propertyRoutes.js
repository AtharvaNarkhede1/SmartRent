const express = require('express');
const router = express.Router();
const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty
} = require('../controllers/propertyController');
const { protect } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(protect, getProperties)
  .post(protect, createProperty);

router
  .route('/:id')
  .get(protect, getProperty)
  .put(protect, updateProperty)
  .delete(protect, deleteProperty);

module.exports = router;
