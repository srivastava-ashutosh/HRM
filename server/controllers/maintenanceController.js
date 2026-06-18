const Employee = require('../models/Employee');
const Candidate = require('../models/Candidate');
const User = require('../models/User');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

exports.purgeEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findByIdAndDelete(req.params.id);
  if (!employee) throw new AppError('Employee not found', 404);
  await User.findOneAndDelete({ employeeId: req.params.id });
  res.json({ message: 'Employee records purged permanently' });
});

exports.purgeCandidate = asyncHandler(async (req, res) => {
  await Candidate.findByIdAndDelete(req.params.id);
  res.json({ message: 'Candidate records purged permanently' });
});

exports.getPurgeLog = asyncHandler(async (req, res) => {
  res.json({ message: 'Purge tracking not implemented in this version', records: [] });
});

exports.accessEmployeeRecords = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id)
    .populate('jobTitle')
    .populate('payGrade')
    .populate('workShift');
  if (!employee) throw new AppError('Employee not found', 404);
  res.json(employee);
});
