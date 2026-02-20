const AppointmentSlot = require('../models/AppointmentSlot');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');
const ProviderProfile = require('../models/ProviderProfile');
const User = require('../models/User');
const { SLOT_MAX_PER_DAY, APPOINTMENT_STATUS } = require('../config/constants');
const mongoose = require('mongoose');

function parseTime(t) {
  const [h, m] = (t || '').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function overlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

exports.createSlot = async (req, res) => {
  try {
    const { date, startTime, endTime } = req.body;
    const providerId = req.user._id;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'Date, startTime and endTime required' });
    }

    const d = new Date(date);
    if (isNaN(d.getTime())) return res.status(400).json({ success: false, message: 'Invalid date' });

    const start = parseTime(startTime);
    const end = parseTime(endTime);
    if (start >= end) return res.status(400).json({ success: false, message: 'Start time must be before end time' });

    const dayStart = new Date(d);
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(d);
    dayEnd.setUTCHours(23, 59, 59, 999);

    const count = await AppointmentSlot.countDocuments({ provider: providerId, date: { $gte: dayStart, $lte: dayEnd } });
    if (count >= SLOT_MAX_PER_DAY) {
      return res.status(400).json({ success: false, message: `Maximum ${SLOT_MAX_PER_DAY} slots per day` });
    }

    const existing = await AppointmentSlot.find({ provider: providerId, date: d, isBooked: false });
    for (const s of existing) {
      if (overlap(parseTime(s.startTime), parseTime(s.endTime), start, end)) {
        return res.status(400).json({ success: false, message: 'Slot overlaps with existing slot' });
      }
    }

    const slot = await AppointmentSlot.create({ provider: providerId, date: d, startTime, endTime });
    res.status(201).json({ success: true, data: slot });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ provider: req.user._id })
      .populate('customer', 'name email')
      .populate('slot')
      .sort({ date: 1, startTime: 1 })
      .lean();
    res.json({ success: true, data: appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateSlot = async (req, res) => {
  try {
    const slot = await AppointmentSlot.findOne({ _id: req.params.id, provider: req.user._id });
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });
    if (slot.isBooked) return res.status(400).json({ success: false, message: 'Cannot edit booked slot' });

    const { date, startTime, endTime } = req.body;
    if (date) slot.date = new Date(date);
    if (startTime) slot.startTime = startTime;
    if (endTime) slot.endTime = endTime;
    await slot.save();
    res.json({ success: true, data: slot });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteSlot = async (req, res) => {
  try {
    const slot = await AppointmentSlot.findOne({ _id: req.params.id, provider: req.user._id });
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });
    if (slot.isBooked) return res.status(400).json({ success: false, message: 'Cannot delete booked slot' });
    await slot.deleteOne();
    res.json({ success: true, message: 'Slot deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.completeAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      provider: req.user._id,
      status: APPOINTMENT_STATUS.CONFIRMED,
    });
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    appointment.status = APPOINTMENT_STATUS.COMPLETED;
    await appointment.save();
    res.json({ success: true, data: appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMySlots = async (req, res) => {
  try {
    const slots = await AppointmentSlot.find({ provider: req.user._id })
      .sort({ date: 1, startTime: 1 })
      .lean();
    res.json({ success: true, data: slots });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ provider: req.user._id })
      .populate('customer', 'name')
      .populate('appointment')
      .sort({ createdAt: -1 })
      .lean();
    const agg = await Review.aggregate([
      { $match: { provider: req.user._id } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    const stats = agg[0] ? { avgRating: agg[0].avg, totalReviews: agg[0].count } : { avgRating: 0, totalReviews: 0 };
    res.json({ success: true, data: reviews, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAppointedPatients = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      provider: req.user._id,
      status: { $in: [APPOINTMENT_STATUS.CONFIRMED, APPOINTMENT_STATUS.COMPLETED] },
    })
      .populate('customer', 'name email phone')
      .distinct('customer');

    const patients = await User.find({ _id: { $in: appointments } })
      .select('name email phone profilePicture');

    res.json({ success: true, data: patients });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getServices = async (req, res) => {
  try {
    const services = await ProviderProfile.findOne({ user: req.user._id }).select('services');
    res.json({ success: true, data: services?.services || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createService = async (req, res) => {
  try {
    const { name, description, price, duration, maxCapacity } = req.body;

    if (!name || !price || !duration) {
      return res.status(400).json({ success: false, message: 'Name, price, and duration required' });
    }

    const profile = await ProviderProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ success: false, message: 'Provider profile not found' });

    if (!profile.services) profile.services = [];

    const service = {
      _id: require('mongoose').Types.ObjectId(),
      name,
      description,
      price: parseFloat(price),
      duration: parseInt(duration),
      maxCapacity: parseInt(maxCapacity) || 1,
      createdAt: new Date(),
    };

    profile.services.push(service);
    await profile.save();

    res.status(201).json({ success: true, message: 'Service created', data: service });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, duration, maxCapacity } = req.body;

    const profile = await ProviderProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ success: false, message: 'Provider profile not found' });

    const service = profile.services?.find(s => s._id.toString() === id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    if (name) service.name = name;
    if (description) service.description = description;
    if (price) service.price = parseFloat(price);
    if (duration) service.duration = parseInt(duration);
    if (maxCapacity) service.maxCapacity = parseInt(maxCapacity);

    await profile.save();
    res.json({ success: true, message: 'Service updated', data: service });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const profile = await ProviderProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ success: false, message: 'Provider profile not found' });

    profile.services = profile.services?.filter(s => s._id.toString() !== id) || [];
    await profile.save();

    res.json({ success: true, message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};