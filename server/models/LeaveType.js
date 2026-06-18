const mongoose = require('mongoose');

const leaveTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  color: { type: String, default: '#76BC21' }
}, { timestamps: true });

module.exports = mongoose.model('LeaveType', leaveTypeSchema);
