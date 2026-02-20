const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    type: { type: String, default: 'info' },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1 });
notificationSchema.index({ user: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
