const express = require('express');
const profileController = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);

module.exports = router;
