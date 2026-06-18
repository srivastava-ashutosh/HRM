const mongoose = require('mongoose');

const payGradeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  currencyEntries: [{
    currency: { type: String, required: true },
    minSalary: { type: Number, default: 0 },
    maxSalary: { type: Number, default: 0 }
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('PayGrade', payGradeSchema);
