const ProviderProfile = require('../models/ProviderProfile');
const CustomerProfile = require('../models/CustomerProfile');

exports.getProfile = async (req, res) => {
  try {
    if (req.user.role === 'provider') {
      let profile = await ProviderProfile.findOne({ user: req.user._id }).populate('user', 'name email');
      if (!profile) profile = await ProviderProfile.create({ user: req.user._id });
      return res.json({ success: true, data: profile });
    }
    if (req.user.role === 'customer') {
      let profile = await CustomerProfile.findOne({ user: req.user._id }).populate('user', 'name email');
      if (!profile) profile = await CustomerProfile.create({ user: req.user._id });
      return res.json({ success: true, data: profile });
    }
    res.json({ success: true, data: req.user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    if (req.user.role === 'provider') {
      const fields = [
        'businessName', 'domain', 'description', 'address', 'contactNumber',
        'workingHours', 'appointmentInstructions',
      ];
      let profile = await ProviderProfile.findOne({ user: req.user._id });
      if (!profile) profile = await ProviderProfile.create({ user: req.user._id });
      fields.forEach((f) => { if (req.body[f] !== undefined) profile[f] = req.body[f]; });
      profile.isComplete = !!(profile.businessName && profile.domain && profile.description && profile.contactNumber);
      await profile.save();
      return res.json({ success: true, data: profile });
    }
    if (req.user.role === 'customer') {
      const fields = ['name', 'address', 'phone', 'gender'];
      let profile = await CustomerProfile.findOne({ user: req.user._id });
      if (!profile) profile = await CustomerProfile.create({ user: req.user._id });
      fields.forEach((f) => { if (req.body[f] !== undefined) profile[f] = req.body[f]; });
      profile.isComplete = !!(profile.name && profile.phone);
      await profile.save();
      return res.json({ success: true, data: profile });
    }
    res.status(400).json({ success: false, message: 'No profile for admin' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
