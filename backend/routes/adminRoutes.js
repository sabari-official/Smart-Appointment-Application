const express = require('express');
const adminController = require('../controllers/adminController');
const { protect, role } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(protect);
router.use(role(ROLES.ADMIN));

router.get('/users', adminController.getUsers);
router.get('/providers', adminController.getProviders);
router.get('/appointments', adminController.getAppointments);
router.get('/appointments/cancelled', adminController.getCancelledAppointments);
router.get('/notifications', adminController.getNotifications);
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/dashboard/activity', adminController.getDashboardActivity);
router.post('/suspend', adminController.suspendUser);
router.post('/unsuspend', adminController.unsuspendUser);
router.post('/reset-system', adminController.resetSystem);
router.post('/verify-reset-password', adminController.verifyResetPassword);
router.put('/users/:id/status', adminController.updateUserStatus);
router.put('/providers/:id/toggle-suspension', adminController.toggleProviderSuspension);

module.exports = router;
