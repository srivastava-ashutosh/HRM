const mongoose = require('mongoose');

const vacancySchema = new mongoose.Schema({
  name: { type: String, required: true },
  jobTitle: { type: mongoose.Schema.Types.ObjectId, ref: 'JobTitle', required: true },
  hiringManager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  numPositions: { type: Number, default: 1 },
  description: { type: String, default: '' },
  status: { type: Boolean, default: true },
  isPublished: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Vacancy', vacancySchema);
