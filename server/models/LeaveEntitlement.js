const mongoose = require('mongoose');

const leaveEntitlementSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  leaveType: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType', required: true },
  entitlement: { type: Number, required: true, default: 0 },
  daysUsed: { type: Number, default: 0 },
  leavePeriod: { type: String, default: '2026-01-01' },
  note: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('LeaveEntitlement', leaveEntitlementSchema);
