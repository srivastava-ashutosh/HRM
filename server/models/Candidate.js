const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  middleName: { type: String, default: '' },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  contactNumber: { type: String, default: '' },
  vacancy: { type: mongoose.Schema.Types.ObjectId, ref: 'Vacancy' },
  status: { type: String, enum: ['applied', 'shortlisted', 'interviewed', 'offered', 'hired', 'rejected'], default: 'applied' },
  resume: { type: String, default: '' },
  dateOfApplication: { type: Date, default: Date.now },
  comments: [{ text: String, by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, date: { type: Date, default: Date.now } }],
  interviewDate: { type: Date },
  interviewNotes: { type: String, default: '' }
}, { timestamps: true });

candidateSchema.index({ email: 1 });
candidateSchema.index({ vacancy: 1, status: 1 });
candidateSchema.index({ status: 1 });

module.exports = mongoose.model('Candidate', candidateSchema);
