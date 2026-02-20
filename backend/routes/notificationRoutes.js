const express = require('express');
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', notificationController.getMine);
router.put('/read-all', notificationController.markAllRead);
router.delete('/clear-all', notificationController.clearAll);
router.put('/:id/read', notificationController.markRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
