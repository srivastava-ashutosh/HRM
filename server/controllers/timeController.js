const Timesheet = require('../models/Timesheet');
const Attendance = require('../models/Attendance');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

exports.getTimesheets = asyncHandler(async (req, res) => {
  const { employee, weekEnding } = req.query;
  let query = {};
  if (employee) query.employee = employee;
  if (weekEnding) query.weekEnding = new Date(weekEnding);
  const timesheets = await Timesheet.find(query).populate('employee', 'firstName lastName fullName').sort({ weekEnding: -1 });
  res.json(timesheets);
});

exports.createTimesheet = asyncHandler(async (req, res) => {
  const timesheet = await Timesheet.create(req.body);
  res.status(201).json(timesheet);
});

exports.updateTimesheet = asyncHandler(async (req, res) => {
  const timesheet = await Timesheet.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(timesheet);
});

exports.submitTimesheet = asyncHandler(async (req, res) => {
  const timesheet = await Timesheet.findById(req.params.id);
  if (!timesheet) throw new AppError('Timesheet not found', 404);
  timesheet.status = 'submitted';
  await timesheet.save();
  res.json(timesheet);
});

exports.approveTimesheet = asyncHandler(async (req, res) => {
  const timesheet = await Timesheet.findById(req.params.id);
  if (!timesheet) throw new AppError('Timesheet not found', 404);
  timesheet.status = 'approved';
  timesheet.actedBy = req.user._id;
  await timesheet.save();
  res.json(timesheet);
});

exports.getAttendance = asyncHandler(async (req, res) => {
  const { employee, date } = req.query;
  let query = {};
  if (employee) query.employee = employee;
  if (date) {
    const d = new Date(date);
    query.date = { $gte: new Date(d.setHours(0,0,0,0)), $lte: new Date(d.setHours(23,59,59,999)) };
  }
  const records = await Attendance.find(query).populate('employee', 'firstName lastName fullName').sort({ date: -1 });
  res.json(records);
});

exports.punchIn = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const existing = await Attendance.findOne({
    employee: req.body.employee,
    date: { $gte: today }
  });
  if (existing && existing.state === 'punched_in') {
    throw new AppError('Already punched in today', 400);
  }
  const record = await Attendance.create({
    employee: req.body.employee,
    date: new Date(),
    punchIn: new Date(),
    punchInNote: req.body.note || '',
    state: 'punched_in'
  });
  res.status(201).json(record);
});

exports.punchOut = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const record = await Attendance.findOne({
    employee: req.body.employee,
    date: { $gte: today },
    state: 'punched_in'
  });
  if (!record) throw new AppError('No active punch in found', 400);
  record.punchOut = new Date();
  record.punchOutNote = req.body.note || '';
  record.state = 'punched_out';
  record.totalHours = (record.punchOut - record.punchIn) / (1000 * 60 * 60);
  await record.save();
  res.json(record);
});

exports.importTimesheets = asyncHandler(async (req, res) => {
  const items = await Timesheet.insertMany(req.body);
  res.status(201).json({ count: items.length });
});

exports.importAttendance = asyncHandler(async (req, res) => {
  const items = await Attendance.insertMany(req.body);
  res.status(201).json({ count: items.length });
});
