const mongoose = require('mongoose');

const trainingRecordSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  enrollmentDate: { type: Date, default: Date.now },
  completionDate: { type: Date },
  status: {
    type: String,
    enum: ['enrolled', 'in_progress', 'completed', 'cancelled'],
    default: 'enrolled'
  },
  score: { type: Number, min: 0, max: 100 },
  notes: { type: String, default: '' },
  completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

trainingRecordSchema.index({ employee: 1, status: 1 });
trainingRecordSchema.index({ course: 1, status: 1 });

module.exports = mongoose.model('TrainingRecord', trainingRecordSchema);
