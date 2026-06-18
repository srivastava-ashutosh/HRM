const LeaveType = require('../models/LeaveType');
const LeaveRequest = require('../models/LeaveRequest');
const LeaveEntitlement = require('../models/LeaveEntitlement');
const Holiday = require('../models/Holiday');
const Employee = require('../models/Employee');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

exports.getLeaveTypes = asyncHandler(async (req, res) => {
  const types = await LeaveType.find({ isActive: true });
  res.json(types);
});

exports.createLeaveType = asyncHandler(async (req, res) => {
  const type = await LeaveType.create(req.body);
  res.status(201).json(type);
});

exports.updateLeaveType = asyncHandler(async (req, res) => {
  const type = await LeaveType.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(type);
});

exports.deleteLeaveType = asyncHandler(async (req, res) => {
  await LeaveType.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ message: 'Leave type deleted' });
});

exports.getLeaveRequests = asyncHandler(async (req, res) => {
  const { status, employee } = req.query;
  let query = {};
  if (status) query.status = status;
  if (employee) query.employee = employee;
  const requests = await LeaveRequest.find(query)
    .populate('employee', 'firstName lastName fullName employeeId')
    .populate('leaveType')
    .populate('actedBy', 'username')
    .sort({ appliedOn: -1 });
  res.json(requests);
});

exports.createLeaveRequest = asyncHandler(async (req, res) => {
  const request = await LeaveRequest.create(req.body);
  res.status(201).json(request);
});

exports.updateLeaveRequest = asyncHandler(async (req, res) => {
  const request = await LeaveRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!request) throw new AppError('Leave request not found', 404);
  res.json(request);
});

exports.approveLeave = asyncHandler(async (req, res) => {
  const request = await LeaveRequest.findById(req.params.id);
  if (!request) throw new AppError('Leave request not found', 404);
  request.status = 'approved';
  request.actedBy = req.user._id;
  await request.save();
  const entitlement = await LeaveEntitlement.findOne({
    employee: request.employee,
    leaveType: request.leaveType
  });
  if (entitlement) {
    entitlement.daysUsed = (entitlement.daysUsed || 0) + request.numberOfDays;
    await entitlement.save();
  }
  res.json(request);
});

exports.rejectLeave = asyncHandler(async (req, res) => {
  const request = await LeaveRequest.findById(req.params.id);
  if (!request) throw new AppError('Leave request not found', 404);
  request.status = 'rejected';
  request.actedBy = req.user._id;
  await request.save();
  res.json(request);
});

exports.getEntitlements = asyncHandler(async (req, res) => {
  const { employee } = req.query;
  let query = {};
  if (employee) query.employee = employee;
  const entitlements = await LeaveEntitlement.find(query).populate('employee', 'firstName lastName fullName').populate('leaveType');
  res.json(entitlements);
});

exports.createEntitlement = asyncHandler(async (req, res) => {
  const entitlement = await LeaveEntitlement.create(req.body);
  res.status(201).json(entitlement);
});

exports.getHolidays = asyncHandler(async (req, res) => {
  const holidays = await Holiday.find({ isActive: true }).sort({ date: 1 });
  res.json(holidays);
});

exports.createHoliday = asyncHandler(async (req, res) => {
  const holiday = await Holiday.create(req.body);
  res.status(201).json(holiday);
});

exports.deleteHoliday = asyncHandler(async (req, res) => {
  await Holiday.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ message: 'Holiday deleted' });
});

exports.importLeaveTypes = asyncHandler(async (req, res) => {
  const items = await LeaveType.insertMany(req.body);
  res.status(201).json({ count: items.length });
});

exports.importEntitlements = asyncHandler(async (req, res) => {
  const items = await LeaveEntitlement.insertMany(req.body);
  res.status(201).json({ count: items.length });
});

exports.importHolidays = asyncHandler(async (req, res) => {
  const items = await Holiday.insertMany(req.body);
  res.status(201).json({ count: items.length });
});

exports.importLeaveRequests = asyncHandler(async (req, res) => {
  const items = await LeaveRequest.insertMany(req.body);
  res.status(201).json({ count: items.length });
});
