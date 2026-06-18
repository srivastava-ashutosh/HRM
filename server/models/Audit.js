const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String },
  action: { type: String, enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT', 'IMPORT', 'EXPORT'], required: true },
  resource: { type: String, required: true },
  resourceId: { type: mongoose.Schema.Types.ObjectId },
  description: { type: String },
  diff: { type: mongoose.Schema.Types.Mixed },
  ip: { type: String },
  userAgent: { type: String },
}, { timestamps: true });

auditSchema.index({ createdAt: -1 });
auditSchema.index({ user: 1, createdAt: -1 });
auditSchema.index({ resource: 1, action: 1 });

module.exports = mongoose.model('Audit', auditSchema);
