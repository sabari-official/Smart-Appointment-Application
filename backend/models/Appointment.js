const mongoose = require('mongoose');
const { APPOINTMENT_STATUS } = require('../config/constants');

const appointmentSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    slot: { type: mongoose.Schema.Types.ObjectId, ref: 'AppointmentSlot', required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: { type: String, enum: Object.values(APPOINTMENT_STATUS), default: APPOINTMENT_STATUS.CONFIRMED },
  },
  { timestamps: true }
);

appointmentSchema.index({ customer: 1 });
appointmentSchema.index({ provider: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ date: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
