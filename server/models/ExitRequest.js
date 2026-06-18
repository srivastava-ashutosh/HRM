const mongoose = require('mongoose');

const clearanceItemSchema = new mongoose.Schema({
  department: { type: String, required: true },
  item: { type: String, required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  status: { type: String, enum: ['pending', 'cleared'], default: 'pending' },
  clearedAt: { type: Date },
  notes: { type: String, default: '' },
}, { _id: true });

const exitRequestSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  type: { type: String, enum: ['resignation', 'termination', 'retirement'], default: 'resignation' },
  reason: { type: String, required: true },
  resignationDate: { type: Date, default: Date.now },
  lastWorkingDay: { type: Date },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'clearing', 'completed'],
    default: 'pending',
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  reviewedAt: { type: Date },
  rejectionReason: { type: String },
  clearanceItems: [clearanceItemSchema],
  fnfAmount: { type: Number },
  fnfPaid: { type: Boolean, default: false },
  fnfPaidAt: { type: Date },
  notes: { type: String },
}, { timestamps: true });

exitRequestSchema.index({ employee: 1 });
exitRequestSchema.index({ status: 1 });

module.exports = mongoose.model('ExitRequest', exitRequestSchema);
