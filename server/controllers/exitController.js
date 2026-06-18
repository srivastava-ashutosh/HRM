const ExitRequest = require('../models/ExitRequest');
const Employee = require('../models/Employee');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { sendSuccess, sendPaginated } = require('../utils/response');
const paginate = require('../utils/paginate');

const DEFAULT_CLEARANCE_ITEMS = [
  { department: 'IT', item: 'Return laptop/desktop', status: 'pending' },
  { department: 'IT', item: 'Return company phone', status: 'pending' },
  { department: 'IT', item: 'Revoke system access & email', status: 'pending' },
  { department: 'IT', item: 'Return accessories (mouse, keyboard, headset)', status: 'pending' },
  { department: 'Finance', item: 'Settle pending advances', status: 'pending' },
  { department: 'Finance', item: 'Process final salary & dues', status: 'pending' },
  { department: 'HR', item: 'Return ID card & badge', status: 'pending' },
  { department: 'HR', item: 'Exit interview completion', status: 'pending' },
  { department: 'Admin', item: 'Return office keys / access card', status: 'pending' },
  { department: 'Admin', item: 'Clear desk & personal belongings', status: 'pending' },
];

exports.getExitRequests = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.type) filter.type = req.query.type;

  const result = await paginate(ExitRequest, filter, {
    ...req.query,
    populate: [
      { path: 'employee', select: 'firstName lastName fullName employeeId department' },
      { path: 'reviewedBy', select: 'firstName lastName fullName' },
      { path: 'clearanceItems.assignedTo', select: 'firstName lastName fullName' },
    ],
    sort: '-createdAt',
    searchFields: ['reason', 'employee.firstName', 'employee.lastName'],
  });
  sendPaginated(res, result.data, { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages });
});

exports.getMyExitRequests = asyncHandler(async (req, res) => {
  const employeeId = req.user.employeeId?._id || req.user.employeeId;
  if (!employeeId) throw new AppError('No employee profile linked', 400);

  const requests = await ExitRequest.find({ employee: employeeId })
    .populate('reviewedBy', 'firstName lastName fullName')
    .populate('clearanceItems.assignedTo', 'firstName lastName fullName')
    .sort('-createdAt')
    .lean();
  sendSuccess(res, requests);
});

exports.getExitRequest = asyncHandler(async (req, res) => {
  const request = await ExitRequest.findById(req.params.id)
    .populate('employee', 'firstName lastName fullName employeeId department')
    .populate('reviewedBy', 'firstName lastName fullName')
    .populate('clearanceItems.assignedTo', 'firstName lastName fullName');
  if (!request) throw new AppError('Exit request not found', 404);
  sendSuccess(res, request);
});

exports.createExitRequest = asyncHandler(async (req, res) => {
  const employeeId = req.user.employeeId?._id || req.user.employeeId;
  if (!employeeId) throw new AppError('No employee profile linked', 400);

  const existing = await ExitRequest.findOne({ employee: employeeId, status: { $nin: ['rejected', 'completed'] } });
  if (existing) throw new AppError('You already have an active exit request', 400);

  const exitRequest = await ExitRequest.create({
    employee: employeeId,
    type: req.body.type || 'resignation',
    reason: req.body.reason,
    lastWorkingDay: req.body.lastWorkingDay || undefined,
    clearanceItems: DEFAULT_CLEARANCE_ITEMS,
  });

  const populated = await exitRequest.populate('employee', 'firstName lastName fullName');
  sendSuccess(res, populated, 'Exit request submitted', 201);
});

exports.approveExitRequest = asyncHandler(async (req, res) => {
  const employeeId = req.user.employeeId?._id || req.user.employeeId;
  const request = await ExitRequest.findByIdAndUpdate(
    req.params.id,
    { status: 'approved', reviewedBy: employeeId, reviewedAt: new Date() },
    { new: true }
  ).populate('employee', 'firstName lastName fullName');
  if (!request) throw new AppError('Exit request not found', 404);
  sendSuccess(res, request, 'Exit request approved');
});

exports.rejectExitRequest = asyncHandler(async (req, res) => {
  const employeeId = req.user.employeeId?._id || req.user.employeeId;
  const { rejectionReason } = req.body;
  const request = await ExitRequest.findByIdAndUpdate(
    req.params.id,
    { status: 'rejected', reviewedBy: employeeId, reviewedAt: new Date(), rejectionReason },
    { new: true }
  ).populate('employee', 'firstName lastName fullName');
  if (!request) throw new AppError('Exit request not found', 404);
  sendSuccess(res, request, 'Exit request rejected');
});

exports.startClearance = asyncHandler(async (req, res) => {
  const request = await ExitRequest.findById(req.params.id);
  if (!request) throw new AppError('Exit request not found', 404);
  if (!['approved', 'clearing'].includes(request.status)) throw new AppError('Exit request must be approved first', 400);

  request.status = 'clearing';
  await request.save();

  const populated = await ExitRequest.findById(request._id)
    .populate('employee', 'firstName lastName fullName')
    .populate('clearanceItems.assignedTo', 'firstName lastName fullName');
  sendSuccess(res, populated, 'Clearance started');
});

exports.clearItem = asyncHandler(async (req, res) => {
  const { notes } = req.body;
  const request = await ExitRequest.findById(req.params.id);
  if (!request) throw new AppError('Exit request not found', 404);
  if (request.status !== 'clearing') throw new AppError('Clearance not in progress', 400);

  const item = request.clearanceItems.id(req.params.itemId);
  if (!item) throw new AppError('Clearance item not found', 404);
  if (item.status === 'cleared') throw new AppError('Item already cleared', 400);

  item.status = 'cleared';
  item.clearedAt = new Date();
  if (notes) item.notes = notes;
  await request.save();

  const allCleared = request.clearanceItems.every(i => i.status === 'cleared');
  sendSuccess(res, request, `Item "${item.item}" cleared${allCleared ? ' — all items cleared! You can now complete F&F.' : ''}`);
});

exports.completeFnF = asyncHandler(async (req, res) => {
  const { fnfAmount } = req.body;
  const request = await ExitRequest.findById(req.params.id);
  if (!request) throw new AppError('Exit request not found', 404);
  if (request.status !== 'clearing') throw new AppError('Clearance must be completed first', 400);

  const allCleared = request.clearanceItems.every(i => i.status === 'cleared');
  if (!allCleared) throw new AppError('All clearance items must be cleared first', 400);

  request.status = 'completed';
  request.fnfAmount = fnfAmount;
  request.fnfPaid = true;
  request.fnfPaidAt = new Date();
  await request.save();

  await Employee.findByIdAndUpdate(request.employee, { isActive: false });

  const populated = await ExitRequest.findById(request._id)
    .populate('employee', 'firstName lastName fullName');
  sendSuccess(res, populated, 'Exit process completed. Employee deactivated.');
});
