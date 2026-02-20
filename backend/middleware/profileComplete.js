const ProviderProfile = require('../models/ProviderProfile');
const CustomerProfile = require('../models/CustomerProfile');
const { ROLES } = require('../config/constants');

const requireProfileComplete = async (req, res, next) => {
  if (req.user.role === ROLES.ADMIN) return next();

  if (req.user.role === ROLES.PROVIDER) {
    const profile = await ProviderProfile.findOne({ user: req.user._id });
    if (!profile?.isComplete) {
      return res.status(403).json({
        success: false,
        message: 'Please complete your provider profile first',
        redirectTo: '/complete-profile',
      });
    }
  }

  if (req.user.role === ROLES.CUSTOMER) {
    const profile = await CustomerProfile.findOne({ user: req.user._id });
    if (!profile?.isComplete) {
      return res.status(403).json({
        success: false,
        message: 'Please complete your profile first',
        redirectTo: '/complete-profile',
      });
    }
  }

  next();
};

module.exports = { requireProfileComplete };
