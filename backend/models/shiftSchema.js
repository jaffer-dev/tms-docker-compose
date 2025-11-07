const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  title: { type: String, required: true }, // "9-6", "Night 6-10"
  startTime: { type: String, required: true }, // ISO time-of-day '09:00'
  endTime: { type: String, required: true },   // '18:00'
  graceMinutes: { type: Number, default: 15 }, // allowed late minutes
  requiredHours: { type: Number, default: 8 },
  active: { type: Boolean, default: true }
});

module.exports = mongoose.model('Shift', shiftSchema);
