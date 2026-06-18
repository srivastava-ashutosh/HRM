const User = require('../models/User');
const Employee = require('../models/Employee');
const JobTitle = require('../models/JobTitle');
const PayGrade = require('../models/PayGrade');
const WorkShift = require('../models/WorkShift');
const Organization = require('../models/Organization');
const paginate = require('../utils/paginate');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { sendSuccess, sendPaginated } = require('../utils/response');

exports.getUsers = asyncHandler(async (req, res) => {
  const result = await paginate(User, {}, {
    ...req.query,
    searchFields: ['username'],
    populate: [{ path: 'employeeId', select: 'firstName lastName fullName' }],
    select: '-password',
  });
  sendPaginated(res, result.data, { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages });
});

exports.createUser = asyncHandler(async (req, res) => {
  const { username, password, role, employeeId } = req.body;
  const exists = await User.findOne({ username });
  if (exists) throw new AppError('Username already exists', 400);
  const user = await User.create({ username, password, role, employeeId });
  sendSuccess(res, { id: user._id, username: user.username, role: user.role }, 'User created', 201);
});

exports.updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  if (req.body.role) user.role = req.body.role;
  if (req.body.status !== undefined) user.status = req.body.status;
  if (req.body.password) user.password = req.body.password;
  await user.save();
  sendSuccess(res, null, 'User updated');
});

exports.deleteUser = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  sendSuccess(res, null, 'User deleted');
});

exports.getJobTitles = asyncHandler(async (req, res) => {
  const jobs = await JobTitle.find({ isActive: true });
  sendSuccess(res, jobs);
});

exports.createJobTitle = asyncHandler(async (req, res) => {
  const job = await JobTitle.create(req.body);
  sendSuccess(res, job, 'Job title created', 201);
});

exports.updateJobTitle = asyncHandler(async (req, res) => {
  const job = await JobTitle.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!job) throw new AppError('Job title not found', 404);
  sendSuccess(res, job, 'Job title updated');
});

exports.deleteJobTitle = asyncHandler(async (req, res) => {
  await JobTitle.findByIdAndUpdate(req.params.id, { isActive: false });
  sendSuccess(res, null, 'Job title deleted');
});

exports.getPayGrades = asyncHandler(async (req, res) => {
  const grades = await PayGrade.find({ isActive: true });
  sendSuccess(res, grades);
});

exports.createPayGrade = asyncHandler(async (req, res) => {
  const grade = await PayGrade.create(req.body);
  sendSuccess(res, grade, 'Pay grade created', 201);
});

exports.updatePayGrade = asyncHandler(async (req, res) => {
  const grade = await PayGrade.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!grade) throw new AppError('Pay grade not found', 404);
  sendSuccess(res, grade, 'Pay grade updated');
});

exports.deletePayGrade = asyncHandler(async (req, res) => {
  await PayGrade.findByIdAndUpdate(req.params.id, { isActive: false });
  sendSuccess(res, null, 'Pay grade deleted');
});

exports.getWorkShifts = asyncHandler(async (req, res) => {
  const shifts = await WorkShift.find({ isActive: true });
  sendSuccess(res, shifts);
});

exports.createWorkShift = asyncHandler(async (req, res) => {
  const shift = await WorkShift.create(req.body);
  sendSuccess(res, shift, 'Work shift created', 201);
});

exports.updateWorkShift = asyncHandler(async (req, res) => {
  const shift = await WorkShift.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!shift) throw new AppError('Work shift not found', 404);
  sendSuccess(res, shift, 'Work shift updated');
});

exports.deleteWorkShift = asyncHandler(async (req, res) => {
  await WorkShift.findByIdAndUpdate(req.params.id, { isActive: false });
  sendSuccess(res, null, 'Work shift deleted');
});

exports.getOrganization = asyncHandler(async (req, res) => {
  let org = await Organization.findOne();
  if (!org) {
    org = await Organization.create({ name: 'IndiaNIC HRM' });
  }
  sendSuccess(res, org);
});

exports.updateOrganization = asyncHandler(async (req, res) => {
  let org = await Organization.findOne();
  if (!org) {
    org = new Organization();
  }
  Object.assign(org, req.body);
  await org.save();
  sendSuccess(res, org, 'Organization updated');
});

exports.importUsers = asyncHandler(async (req, res) => {
  const users = await User.insertMany(req.body);
  sendSuccess(res, { count: users.length }, 'Users imported', 201);
});

exports.importJobTitles = asyncHandler(async (req, res) => {
  const items = await JobTitle.insertMany(req.body);
  sendSuccess(res, { count: items.length }, 'Job titles imported', 201);
});

exports.importPayGrades = asyncHandler(async (req, res) => {
  const items = await PayGrade.insertMany(req.body);
  sendSuccess(res, { count: items.length }, 'Pay grades imported', 201);
});

exports.importWorkShifts = asyncHandler(async (req, res) => {
  const items = await WorkShift.insertMany(req.body);
  sendSuccess(res, { count: items.length }, 'Work shifts imported', 201);
});
