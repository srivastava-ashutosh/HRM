const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  leaveType: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType', required: true },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  duration: { type: String, enum: ['full_day', 'half_day_morning', 'half_day_afternoon'], default: 'full_day' },
  numberOfDays: { type: Number, default: 1 },
  reason: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending' },
  comments: [{ text: String, by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, date: { type: Date, default: Date.now } }],
  appliedOn: { type: Date, default: Date.now },
  actedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

leaveRequestSchema.index({ employee: 1, status: 1 });
leaveRequestSchema.index({ status: 1, fromDate: 1 });
leaveRequestSchema.index({ fromDate: 1, toDate: 1 });

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
