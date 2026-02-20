const User = require('../models/User');
const ProviderProfile = require('../models/ProviderProfile');
const CustomerProfile = require('../models/CustomerProfile');
const Appointment = require('../models/Appointment');
const AppointmentSlot = require('../models/AppointmentSlot');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const { ROLES, APPOINTMENT_STATUS } = require('../config/constants');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProviders = async (req, res) => {
  try {
    const profiles = await ProviderProfile.find({ isComplete: true })
      .populate('user', 'name email isSuspended')
      .lean();
    const ratings = await Review.aggregate([
      { $group: { _id: '$provider', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    const ratingMap = {};
    ratings.forEach((r) => (ratingMap[r._id.toString()] = { avg: r.avg, count: r.count }));
    const data = profiles.map((p) => ({
      ...p,
      providerId: p.user._id,
      rating: ratingMap[p.user._id.toString()]?.avg ?? 0,
      reviewCount: ratingMap[p.user._id.toString()]?.count ?? 0,
    }));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const { provider, status } = req.query;
    const query = {};
    if (provider) query.provider = provider;
    if (status) query.status = status;
    const appointments = await Appointment.find(query)
      .populate('customer', 'name email')
      .populate('provider', 'name email')
      .populate('slot')
      .sort({ date: -1, startTime: -1 })
      .lean();
    res.json({ success: true, data: appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCancelledAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ status: APPOINTMENT_STATUS.CANCELLED })
      .populate('customer', 'name email')
      .populate('provider', 'name email')
      .populate('slot')
      .sort({ updatedAt: -1 })
      .lean();
    res.json({ success: true, data: appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.suspendUser = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === ROLES.ADMIN) return res.status(403).json({ success: false, message: 'Cannot suspend admin' });

    user.isSuspended = true;
    await user.save();
    res.json({ success: true, message: 'User suspended' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.unsuspendUser = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });
    const user = await User.findByIdAndUpdate(userId, { isSuspended: false }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User unsuspended' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.resetSystem = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ success: false, message: 'Password required for confirmation' });

    const admin = await User.findById(req.user._id).select('+password');
    const match = await admin.comparePassword(password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid password' });

    await AppointmentSlot.deleteMany({});
    await Appointment.deleteMany({});
    await Review.deleteMany({});
    await Notification.deleteMany({});

    res.json({ success: true, message: 'System reset complete. Users and admin accounts preserved.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyResetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ success: false, message: 'Password required' });

    const admin = await User.findById(req.user._id).select('+password');
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

    const match = await admin.comparePassword(password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid password' });

    res.json({ success: true, message: 'Password verified' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Valid status required (active/suspended)' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === ROLES.ADMIN) return res.status(403).json({ success: false, message: 'Cannot modify admin status' });

    user.isSuspended = status === 'suspended';
    await user.save();

    res.json({ 
      success: true, 
      message: `User ${status} successfully`,
      data: user 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleProviderSuspension = async (req, res) => {
  try {
    const { id } = req.params;

    const provider = await User.findById(id);
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });
    if (provider.role !== ROLES.PROVIDER) return res.status(400).json({ success: false, message: 'User is not a provider' });

    provider.isSuspended = !provider.isSuspended;
    await provider.save();

    res.json({
      success: true,
      message: `Provider ${provider.isSuspended ? 'suspended' : 'activated'} successfully`,
      data: provider,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProviders = await User.countDocuments({ role: ROLES.PROVIDER });
    const totalCustomers = await User.countDocuments({ role: ROLES.CUSTOMER });
    const totalAppointments = await Appointment.countDocuments();
    const completedAppointments = await Appointment.countDocuments({ status: APPOINTMENT_STATUS.COMPLETED });
    const cancelledAppointments = await Appointment.countDocuments({ status: APPOINTMENT_STATUS.CANCELLED });
    const totalReviews = await Review.countDocuments();
    const avgRating = (await Review.aggregate([
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ]))[0]?.avg || 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProviders,
        totalCustomers,
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        appointmentCompletionRate: totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0,
        totalReviews,
        avgRating: avgRating.toFixed(2),
        suspendedUsers: await User.countDocuments({ isSuspended: true }),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDashboardActivity = async (req, res) => {
  try {
    const recentAppointments = await Appointment.find()
      .populate('customer', 'name email')
      .populate('provider', 'name email')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentReviews = await Review.find()
      .populate('customer', 'name email')
      .populate('provider', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({
      success: true,
      data: {
        recentAppointments,
        recentUsers,
        recentReviews,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const { limit = 10, skip = 0 } = req.query;
    
    const notifications = await Notification.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const total = await Notification.countDocuments();

    res.json({
      success: true,
      data: notifications,
      total,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
