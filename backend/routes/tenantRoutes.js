const express = require('express');
const { getTenants, getTenant, createTenant, updateTenant, deleteTenant } = require('../controllers/tenantController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getTenants)
  .post(createTenant);

router.route('/:id')
  .get(getTenant)
  .put(updateTenant)
  .delete(deleteTenant);

module.exports = router;
