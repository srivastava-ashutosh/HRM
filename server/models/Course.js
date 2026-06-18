const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: { type: String, default: 'General' },
  duration: { type: Number, default: 1 },
  durationUnit: { type: String, enum: ['hours', 'days', 'weeks'], default: 'days' },
  maxParticipants: { type: Number, default: 0 },
  cost: { type: Number, default: 0 },
  provider: { type: String, default: '' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

courseSchema.index({ status: 1 });
courseSchema.index({ category: 1 });

module.exports = mongoose.model('Course', courseSchema);
