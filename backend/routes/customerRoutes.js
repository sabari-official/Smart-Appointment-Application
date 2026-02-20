const express = require('express');
const customerController = require('../controllers/customerController');
const { protect, role } = require('../middleware/auth');
const { requireProfileComplete } = require('../middleware/profileComplete');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(protect);
router.use(role(ROLES.CUSTOMER));

router.get('/providers', customerController.getProviders);
router.get('/providers/:providerId', customerController.getSlots);
router.get('/slots/:providerId', customerController.getSlots);
router.post('/appointments/book', requireProfileComplete, customerController.book);
router.post('/book', requireProfileComplete, customerController.book);
router.put('/appointments/reschedule/:id', requireProfileComplete, customerController.reschedule);
router.put('/appointments/:id/reschedule', requireProfileComplete, customerController.reschedule);
router.delete('/appointments/:id/cancel', requireProfileComplete, customerController.cancel);
router.put('/appointments/:id/cancel', requireProfileComplete, customerController.cancel);
router.put('/appointments/:id/confirm', requireProfileComplete, customerController.confirmAppointment);
router.post('/appointments/review', requireProfileComplete, customerController.review);
router.post('/review', requireProfileComplete, customerController.review);

router.get('/appointments', customerController.myAppointments);
router.get('/stats', customerController.getStats);
router.get('/recommended-providers', customerController.getRecommendedProviders);

module.exports = router;
