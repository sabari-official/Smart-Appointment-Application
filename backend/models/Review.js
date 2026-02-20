const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
  },
  { timestamps: true }
);

reviewSchema.index({ provider: 1 });
reviewSchema.index({ appointment: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
