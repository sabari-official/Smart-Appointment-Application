const mongoose = require('mongoose');

const customerProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, trim: true },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    gender: { type: String, trim: true },
    isComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// user index is already created by unique: true, so we don't need to add it again

module.exports = mongoose.model('CustomerProfile', customerProfileSchema);
