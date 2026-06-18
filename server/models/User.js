const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  role: { type: String, enum: ['admin', 'ess', 'supervisor'], default: 'ess' },
  status: { type: Boolean, default: true },
  isLoggedIn: { type: Boolean, default: false },
  lastLogin: { type: Date }
}, { timestamps: true });

userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ username: 1, status: 1 });
userSchema.index({ employeeId: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
