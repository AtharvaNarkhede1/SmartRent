const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getMaintenance, createMaintenance, updateMaintenance, deleteMaintenance } = require('../controllers/maintenanceController');
const router = express.Router();
router.use(protect);
router.route('/').get(getMaintenance).post(createMaintenance);
router.route('/:id').put(updateMaintenance).delete(deleteMaintenance);
module.exports = router;
