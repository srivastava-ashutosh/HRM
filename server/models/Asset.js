const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ['laptop', 'monitor', 'phone', 'tablet', 'headset', 'keyboard', 'mouse', 'printer', 'other'],
    required: true,
  },
  brand: { type: String, default: '' },
  model: { type: String, default: '' },
  serialNumber: { type: String, unique: true, sparse: true },
  purchaseDate: { type: Date },
  purchasePrice: { type: Number, default: 0 },
  warrantyExpiry: { type: Date },
  status: {
    type: String,
    enum: ['available', 'assigned', 'maintenance', 'retired'],
    default: 'available',
  },
  location: { type: String, default: '' },
  notes: { type: String, default: '' },
}, { timestamps: true });

assetSchema.index({ status: 1 });
assetSchema.index({ type: 1 });

module.exports = mongoose.model('Asset', assetSchema);
