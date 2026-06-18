const mongoose = require('mongoose');

const assetAssignmentSchema = new mongoose.Schema({
  asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  assignedDate: { type: Date, default: Date.now },
  returnedDate: { type: Date },
  condition: { type: String, default: 'good' },
  notes: { type: String, default: '' },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

assetAssignmentSchema.index({ asset: 1, returnedDate: 1 });
assetAssignmentSchema.index({ employee: 1, returnedDate: 1 });

module.exports = mongoose.model('AssetAssignment', assetAssignmentSchema);
