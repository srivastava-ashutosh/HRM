const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: { type: String, default: 'IndiaNIC HRM' },
  taxId: { type: String, default: '' },
  registrationNumber: { type: String, default: '' },
  phone: { type: String, default: '' },
  fax: { type: String, default: '' },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  zipCode: { type: String, default: '' },
  country: { type: String, default: '' },
  notes: { type: String, default: '' },
  logo: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Organization', organizationSchema);
