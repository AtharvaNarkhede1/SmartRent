const express = require('express');
const { getReminders, createReminder } = require('../controllers/reminderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getReminders)
  .post(createReminder);

module.exports = router;
