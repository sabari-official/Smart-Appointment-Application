const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { ROLES } = require('../config/constants');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, default: null, lowercase: true, trim: true },
    username: { type: String, default: null, trim: true },
    password: { type: String, default: null, select: false },
    role: { type: String, enum: Object.values(ROLES), required: true },
    isVerified: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
    termsAccepted: { type: Boolean, default: false },
    termsAcceptedAt: { type: Date },
    googleId: { type: String, default: null },
    authProvider: { type: String, enum: ['email', 'google'], default: 'email' },
    profilePicture: { type: String, default: null },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ username: 1 }, { unique: true, sparse: true });
userSchema.index({ googleId: 1 }, { sparse: true }); // Not unique - only for lookups
userSchema.index({ role: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
