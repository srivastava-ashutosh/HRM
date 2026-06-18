const mongoose = require('mongoose');

const timesheetItemSchema = new mongoose.Schema({
  project: { type: String, required: true },
  activity: { type: String, default: '' },
  monday: { type: Number, default: 0 },
  tuesday: { type: Number, default: 0 },
  wednesday: { type: Number, default: 0 },
  thursday: { type: Number, default: 0 },
  friday: { type: Number, default: 0 },
  saturday: { type: Number, default: 0 },
  sunday: { type: Number, default: 0 }
});

const timesheetSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  weekEnding: { type: Date, required: true },
  items: [timesheetItemSchema],
  totalHours: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'submitted', 'approved', 'rejected'], default: 'draft' },
  comment: { type: String, default: '' },
  actedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

timesheetSchema.index({ employee: 1, weekEnding: 1 });
timesheetSchema.index({ status: 1 });

module.exports = mongoose.model('Timesheet', timesheetSchema);
