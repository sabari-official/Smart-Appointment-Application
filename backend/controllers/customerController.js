const mongoose = require('mongoose');
const User = require('../models/User');
const ProviderProfile = require('../models/ProviderProfile');
const AppointmentSlot = require('../models/AppointmentSlot');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');
const aiService = require('../services/aiService');
const emailService = require('../services/emailService');
const notificationService = require('../services/notificationService');
const { APPOINTMENT_STATUS } = require('../config/constants');

exports.getProviders = async (req, res) => {
  try {
    const { search } = req.query;
    let profiles = await ProviderProfile.find({ isComplete: true })
      .populate('user', 'name email')
      .lean();

    const providerIds = [...new Set(profiles.map((p) => p.user._id.toString()))];
    const ratings = await Review.aggregate([
      { $match: { provider: { $in: providerIds.map((id) => new mongoose.Types.ObjectId(id)) } } },
      { $group: { _id: '$provider', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    const ratingMap = {};
    ratings.forEach((r) => (ratingMap[r._id.toString()] = { avg: r.avg, count: r.count }));

    profiles = profiles.map((p) => ({
      ...p,
      providerId: p.user._id,
      rating: ratingMap[p.user._id.toString()]?.avg ?? 0,
      reviewCount: ratingMap[p.user._id.toString()]?.count ?? 0,
    }));

    if (search && search.trim()) {
      const sorted = await aiService.recommendProviders(search.trim(), profiles);
      return res.json({ success: true, data: sorted });
    }
    res.json({ success: true, data: profiles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSlots = async (req, res) => {
  try {
    const { providerId } = req.params;
    const from = req.query.from ? new Date(req.query.from) : new Date();
    const to = req.query.to || new Date(from.getTime() + 30 * 24 * 60 * 60 * 1000);

    const slots = await AppointmentSlot.find({
      provider: providerId,
      isBooked: false,
      date: { $gte: from, $lte: to },
    })
      .sort({ date: 1, startTime: 1 })
      .lean();
    res.json({ success: true, data: slots });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.book = async (req, res) => {
  try {
    const { slotId } = req.body;
    if (!slotId) return res.status(400).json({ success: false, message: 'slotId required' });

    const slot = await AppointmentSlot.findById(slotId);
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });
    if (slot.isBooked) return res.status(400).json({ success: false, message: 'Slot already booked' });

    const customer = req.user;
    const provider = await User.findById(slot.provider).select('name email');
    const providerProfile = await ProviderProfile.findOne({ user: slot.provider }).lean();

    const appointment = await Appointment.create({
      customer: customer._id,
      provider: slot.provider,
      slot: slot._id,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: APPOINTMENT_STATUS.CONFIRMED,
    });

    slot.isBooked = true;
    await slot.save();

    const dateStr = slot.date.toISOString().split('T')[0];
    await emailService.sendAppointmentEmail({
      to: customer.email,
      userName: customer.name,
      providerName: providerProfile?.businessName || provider?.name,
      date: dateStr,
      time: slot.startTime,
      action: 'confirmed',
    });

    await notificationService.create(
      slot.provider,
      'New booking',
      `${customer.name} booked an appointment on ${dateStr} at ${slot.startTime}`,
      'booking'
    );

    const populated = await Appointment.findById(appointment._id)
      .populate('provider', 'name email')
      .populate('slot')
      .lean();
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.reschedule = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      customer: req.user._id,
      status: { $in: [APPOINTMENT_STATUS.CONFIRMED, APPOINTMENT_STATUS.PENDING] },
    }).populate('slot');
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    const { slotId } = req.body;
    if (!slotId) return res.status(400).json({ success: false, message: 'slotId required' });

    const newSlot = await AppointmentSlot.findById(slotId);
    if (!newSlot || newSlot.provider.toString() !== appointment.provider.toString()) {
      return res.status(400).json({ success: false, message: 'Invalid slot' });
    }
    if (newSlot.isBooked) return res.status(400).json({ success: false, message: 'Slot already booked' });

    const oldSlot = appointment.slot;
    oldSlot.isBooked = false;
    await oldSlot.save();

    newSlot.isBooked = true;
    await newSlot.save();

    appointment.slot = newSlot._id;
    appointment.date = newSlot.date;
    appointment.startTime = newSlot.startTime;
    appointment.endTime = newSlot.endTime;
    await appointment.save();

    const provider = await User.findById(appointment.provider).select('name');
    const providerProfile = await ProviderProfile.findOne({ user: appointment.provider }).lean();
    await emailService.sendAppointmentEmail({
      to: req.user.email,
      userName: req.user.name,
      providerName: providerProfile?.businessName || provider?.name,
      date: newSlot.date.toISOString().split('T')[0],
      time: newSlot.startTime,
      action: 'rescheduled',
    });

    const updated = await Appointment.findById(appointment._id).populate('slot').populate('provider', 'name email').lean();
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.cancel = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      customer: req.user._id,
      status: { $in: [APPOINTMENT_STATUS.CONFIRMED, APPOINTMENT_STATUS.PENDING] },
    }).populate('slot');
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    appointment.status = APPOINTMENT_STATUS.CANCELLED;
    await appointment.save();

    const slot = await AppointmentSlot.findById(appointment.slot._id);
    if (slot) {
      slot.isBooked = false;
      await slot.save();
    }

    const provider = await User.findById(appointment.provider).select('name');
    const providerProfile = await ProviderProfile.findOne({ user: appointment.provider }).lean();
    await emailService.sendAppointmentEmail({
      to: req.user.email,
      userName: req.user.name,
      providerName: providerProfile?.businessName || provider?.name,
      date: appointment.date.toISOString().split('T')[0],
      time: appointment.startTime,
      action: 'cancelled',
    });

    await notificationService.create(
      appointment.provider,
      'Booking cancelled',
      `${req.user.name} cancelled appointment on ${appointment.date.toISOString().split('T')[0]} at ${appointment.startTime}`,
      'cancellation'
    );

    res.json({ success: true, message: 'Appointment cancelled' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.review = async (req, res) => {
  try {
    const { appointmentId, rating, comment } = req.body;
    if (!appointmentId || !rating) return res.status(400).json({ success: false, message: 'appointmentId and rating required' });

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      customer: req.user._id,
      status: APPOINTMENT_STATUS.COMPLETED,
    });
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found or not completed' });

    const existing = await Review.findOne({ appointment: appointmentId });
    if (existing) return res.status(400).json({ success: false, message: 'Already reviewed' });

    const review = await Review.create({
      appointment: appointment._id,
      customer: req.user._id,
      provider: appointment.provider,
      rating: Math.min(5, Math.max(1, Number(rating))),
      comment: comment || '',
    });
    const populated = await Review.findById(review._id)
      .populate('customer', 'name')
      .populate('provider', 'name')
      .lean();
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.myAppointments = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { customer: req.user._id };
    if (status) query.status = status;
    const appointments = await Appointment.find(query)
      .populate('provider', 'name email')
      .populate('slot')
      .sort({ date: -1, startTime: -1 })
      .lean();
    res.json({ success: true, data: appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.confirmAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    if (appointment.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (appointment.status !== APPOINTMENT_STATUS.BOOKED) {
      return res.status(400).json({ success: false, message: 'Can only confirm booked appointments' });
    }

    appointment.confirmed = true;
    appointment.confirmedAt = new Date();
    await appointment.save();

    // Create notification for provider
    await notificationService.create(
      appointment.provider,
      'Appointment Confirmed',
      `Customer ${req.user.name} confirmed appointment on ${appointment.date}`,
      'appointment_confirmed'
    );

    res.json({ success: true, message: 'Appointment confirmed', data: appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const customerId = req.user._id;

    // Total appointments
    const totalAppointments = await Appointment.countDocuments({ customer: customerId });
    const completedAppointments = await Appointment.countDocuments({
      customer: customerId,
      status: APPOINTMENT_STATUS.COMPLETED,
    });
    const cancelledAppointments = await Appointment.countDocuments({
      customer: customerId,
      status: APPOINTMENT_STATUS.CANCELLED,
    });
    const upcomingAppointments = await Appointment.countDocuments({
      customer: customerId,
      status: { $in: [APPOINTMENT_STATUS.CONFIRMED, APPOINTMENT_STATUS.PENDING] },
      date: { $gte: new Date() },
    });

    // Reviews given
    const totalReviewsGiven = await Review.countDocuments({ customer: customerId });

    // Average rating given
    const reviewStats = await Review.aggregate([
      { $match: { customer: new mongoose.Types.ObjectId(customerId) } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } },
    ]);
    const avgRatingGiven = reviewStats[0]?.avgRating || 0;

    // Favorite providers (most booked)
    const favoriteProviders = await Appointment.aggregate([
      { $match: { customer: new mongoose.Types.ObjectId(customerId) } },
      { $group: { _id: '$provider', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'providerInfo',
        },
      },
      { $unwind: '$providerInfo' },
      {
        $project: {
          _id: 1,
          count: 1,
          name: '$providerInfo.name',
          email: '$providerInfo.email',
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        upcomingAppointments,
        totalReviewsGiven,
        avgRatingGiven: parseFloat(avgRatingGiven.toFixed(2)),
        favoriteProviders,
        completionRate:
          totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getRecommendedProviders = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { limit = 10 } = req.query;

    // Get all providers with complete profiles
    let profiles = await ProviderProfile.find({ isComplete: true })
      .populate('user', 'name email isSuspended')
      .lean();

    // Get ratings for all providers
    const providerIds = profiles.map((p) => new mongoose.Types.ObjectId(p.user._id));
    const ratings = await Review.aggregate([
      { $match: { provider: { $in: providerIds } } },
      { $group: { _id: '$provider', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    const ratingMap = {};
    ratings.forEach((r) => (ratingMap[r._id.toString()] = { avg: r.avg, count: r.count }));

    // Enrich profiles with ratings
    profiles = profiles
      .map((p) => ({
        ...p,
        providerId: p.user._id,
        rating: ratingMap[p.user._id.toString()]?.avg ?? 0,
        reviewCount: ratingMap[p.user._id.toString()]?.count ?? 0,
      }))
      .filter((p) => !p.user.isSuspended);

    // Get customer's booking history
    const bookingHistory = await Appointment.find({ customer: customerId })
      .select('provider')
      .lean();
    const bookedProviderIds = new Set(bookingHistory.map((b) => b.provider.toString()));

    // Recommendation scoring
    const recommended = profiles
      .map((p) => {
        let score = 0;

        // Higher rating = higher score
        score += p.rating * 20;

        // More reviews = more credibility
        score += Math.min(p.reviewCount * 1, 20);

        // Providers not yet booked get slight boost for discovery
        if (!bookedProviderIds.has(p.user._id.toString())) {
          score += 5;
        }

        return { ...p, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: recommended,
      total: profiles.length,
      recommended: recommended.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

