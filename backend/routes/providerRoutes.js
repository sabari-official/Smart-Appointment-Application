const express = require('express');
const providerController = require('../controllers/providerController');
const { protect, role } = require('../middleware/auth');
const { requireProfileComplete } = require('../middleware/profileComplete');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(protect);
router.use(role(ROLES.PROVIDER));

router.get('/slots', requireProfileComplete, providerController.getMySlots);
router.post('/slots', requireProfileComplete, providerController.createSlot);
router.put('/slots/:id', requireProfileComplete, providerController.updateSlot);
router.delete('/slots/:id', requireProfileComplete, providerController.deleteSlot);

router.get('/appointments', requireProfileComplete, providerController.getAppointments);
router.put('/appointments/:id/complete', requireProfileComplete, providerController.completeAppointment);

router.get('/reviews', requireProfileComplete, providerController.getMyReviews);

router.get('/appointed-patients', requireProfileComplete, providerController.getAppointedPatients);
router.get('/services', requireProfileComplete, providerController.getServices);
router.post('/services', requireProfileComplete, providerController.createService);
router.put('/services/:id', requireProfileComplete, providerController.updateService);
router.delete('/services/:id', requireProfileComplete, providerController.deleteService);

module.exports = router;
