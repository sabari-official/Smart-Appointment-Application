const express = require('express');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');
const { ROLES, APPOINTMENT_STATUS } = require('../config/constants');

const router = express.Router();

/**
 * Get public statistics for homepage/about
 * No authentication required
 */
router.get('/statistics', async (req, res) => {
  try {
    const totalProviders = await User.countDocuments({ role: ROLES.PROVIDER, isSuspended: false });
    const totalAppointments = await Appointment.countDocuments();
    const completedAppointments = await Appointment.countDocuments({ status: APPOINTMENT_STATUS.COMPLETED });
    const totalReviews = await Review.countDocuments();
    const avgRating = (await Review.aggregate([
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ]))[0]?.avg || 0;

    res.json({
      success: true,
      data: {
        totalProviders,
        totalAppointments,
        completedAppointments,
        totalReviews,
        avgRating: parseFloat(avgRating.toFixed(2)),
        appointments: {
          total: totalAppointments,
          completed: completedAppointments,
          completionRate: totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
