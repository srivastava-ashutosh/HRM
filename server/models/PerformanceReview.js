const mongoose = require('mongoose');

const reviewItemSchema = new mongoose.Schema({
  criteria: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
  comment: { type: String, default: '' }
});

const performanceReviewSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  title: { type: String, required: true },
  dueDate: { type: Date },
  items: [reviewItemSchema],
  overallRating: { type: Number, min: 1, max: 5 },
  finalComment: { type: String, default: '' },
  status: { type: String, enum: ['draft', 'in_progress', 'completed', 'archived'], default: 'draft' },
  reviewPeriod: { type: String, default: '2026' }
}, { timestamps: true });

module.exports = mongoose.model('PerformanceReview', performanceReviewSchema);
