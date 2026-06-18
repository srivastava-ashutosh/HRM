const mongoose = require('mongoose');

const workShiftSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  hoursPerDay: { type: Number, default: 8 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('WorkShift', workShiftSchema);
