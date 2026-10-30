const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getTransactions, createTransaction, updateTransaction, deleteTransaction } = require('../controllers/transactionController');
const router = express.Router();
router.use(protect);
router.route('/').get(getTransactions).post(createTransaction);
router.route('/:id').put(updateTransaction).delete(deleteTransaction);
module.exports = router;
