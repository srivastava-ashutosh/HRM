const mongoose = require('mongoose');

const jobTitleSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  specification: { type: String, default: '' },
  note: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('JobTitle', jobTitleSchema);
