const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: Date, required: true },
  punchIn: { type: Date },
  punchInNote: { type: String, default: '' },
  punchOut: { type: Date },
  punchOutNote: { type: String, default: '' },
  totalHours: { type: Number, default: 0 },
  state: { type: String, enum: ['punched_in', 'punched_out'], default: 'punched_out' }
}, { timestamps: true });

attendanceSchema.index({ employee: 1, date: 1 });
attendanceSchema.index({ date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
