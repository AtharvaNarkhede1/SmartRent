const express = require('express');
const { register, login, getMe, updateSettings, updateProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/settings', protect, updateSettings);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);

module.exports = router;
