const express = require('express');
const { getRooms, getRoom, createRoom, updateRoom, deleteRoom } = require('../controllers/roomController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getRooms)
  .post(createRoom);

router.route('/:id')
  .get(getRoom)
  .put(updateRoom)
  .delete(deleteRoom);

module.exports = router;
