const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  subject: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: {
    type: String,
    enum: ['IT', 'HR', 'Facilities', 'Finance', 'Other'],
    default: 'Other',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['open', 'assigned', 'in_progress', 'resolved', 'closed'],
    default: 'open',
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  resolution: { type: String, default: '' },
  resolvedAt: { type: Date },
}, { timestamps: true });

ticketSchema.index({ status: 1 });
ticketSchema.index({ createdBy: 1 });
ticketSchema.index({ assignedTo: 1 });
ticketSchema.index({ category: 1 });
ticketSchema.index({ priority: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);
