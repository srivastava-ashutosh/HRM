const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  module: { type: String, required: true },
  action: { type: String, enum: ['read', 'write', 'create', 'update', 'delete', 'approve', 'export', 'import'], required: true },
}, { _id: false });

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  displayName: { type: String, required: true },
  description: { type: String, default: '' },
  isSystem: { type: Boolean, default: false },
  permissions: [permissionSchema],
  priority: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
