const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true },
  firstName: { type: String, required: true, trim: true },
  middleName: { type: String, trim: true, default: '' },
  lastName: { type: String, required: true, trim: true },
  fullName: { type: String },
  jobTitle: { type: mongoose.Schema.Types.ObjectId, ref: 'JobTitle' },
  payGrade: { type: mongoose.Schema.Types.ObjectId, ref: 'PayGrade' },
  employmentStatus: { type: String, default: 'Full-Time' },
  supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  workShift: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkShift' },
  department: { type: String, default: '' },
  workEmail: { type: String, default: '' },
  otherEmail: { type: String, default: '' },
  contactNumber: { type: String, default: '' },
  emergencyContact: { type: String, default: '' },
  emergencyPhone: { type: String, default: '' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  zipCode: { type: String, default: '' },
  country: { type: String, default: '' },
  nationality: { type: String, default: '' },
  maritalStatus: { type: String, enum: ['Single', 'Married', 'Divorced', 'Other'], default: 'Single' },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
  licenseNumber: { type: String, default: '' },
  licenseExpiry: { type: Date },
  militaryService: { type: String, default: '' },
  joinedDate: { type: Date },
  probationEndDate: { type: Date },
  customFields: { type: Map, of: String, default: {} },
  profilePic: { type: String, default: '' },
  sinNumber: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

employeeSchema.index({ isActive: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ fullName: 1 });
employeeSchema.index({ firstName: 1, lastName: 1 });

employeeSchema.pre('save', function (next) {
  const parts = [this.firstName, this.middleName, this.lastName].filter(Boolean);
  this.fullName = parts.join(' ');
  if (!this.employeeId) {
    this.employeeId = 'EMP' + String(Date.now()).slice(-6);
  }
  next();
});

module.exports = mongoose.model('Employee', employeeSchema);
