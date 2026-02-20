const mongoose = require('mongoose');

const appointmentSlotSchema = new mongoose.Schema(
  {
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isBooked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

appointmentSlotSchema.index({ provider: 1, date: 1 });
appointmentSlotSchema.index({ provider: 1, date: 1, isBooked: 1 });

module.exports = mongoose.model('AppointmentSlot', appointmentSlotSchema);
