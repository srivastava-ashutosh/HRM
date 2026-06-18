const Ticket = require('../models/Ticket');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { sendSuccess, sendPaginated } = require('../utils/response');
const paginate = require('../utils/paginate');

exports.getTickets = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.priority) filter.priority = req.query.priority;

  const result = await paginate(Ticket, filter, {
    ...req.query,
    populate: [
      { path: 'createdBy', select: 'firstName lastName fullName employeeId' },
      { path: 'assignedTo', select: 'firstName lastName fullName employeeId' },
    ],
    sort: '-createdAt',
    searchFields: ['subject', 'description'],
  });
  sendPaginated(res, result.data, { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages });
});

exports.getTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id)
    .populate('createdBy', 'firstName lastName fullName employeeId department')
    .populate('assignedTo', 'firstName lastName fullName employeeId');
  if (!ticket) throw new AppError('Ticket not found', 404);
  sendSuccess(res, ticket);
});

exports.createTicket = asyncHandler(async (req, res) => {
  const employeeId = req.user.employeeId?._id || req.user.employeeId;
  if (!employeeId) throw new AppError('No employee profile linked', 400);

  const ticket = await Ticket.create({
    ...req.body,
    createdBy: employeeId,
  });
  const populated = await ticket.populate('createdBy', 'firstName lastName fullName');
  sendSuccess(res, populated, 'Ticket created', 201);
});

exports.updateTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!ticket) throw new AppError('Ticket not found', 404);
  sendSuccess(res, ticket, 'Ticket updated');
});

exports.assignTicket = asyncHandler(async (req, res) => {
  const { assignedTo } = req.body;
  const ticket = await Ticket.findByIdAndUpdate(
    req.params.id,
    { assignedTo, status: 'assigned' },
    { new: true, runValidators: true }
  ).populate('assignedTo', 'firstName lastName fullName');
  if (!ticket) throw new AppError('Ticket not found', 404);
  sendSuccess(res, ticket, 'Ticket assigned');
});

exports.resolveTicket = asyncHandler(async (req, res) => {
  const { resolution } = req.body;
  const ticket = await Ticket.findByIdAndUpdate(
    req.params.id,
    { resolution, status: 'resolved', resolvedAt: new Date() },
    { new: true, runValidators: true }
  );
  if (!ticket) throw new AppError('Ticket not found', 404);
  sendSuccess(res, ticket, 'Ticket resolved');
});

exports.closeTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findByIdAndUpdate(
    req.params.id,
    { status: 'closed' },
    { new: true }
  );
  if (!ticket) throw new AppError('Ticket not found', 404);
  sendSuccess(res, ticket, 'Ticket closed');
});

exports.getMyTickets = asyncHandler(async (req, res) => {
  const employeeId = req.user.employeeId?._id || req.user.employeeId;
  if (!employeeId) throw new AppError('No employee profile linked', 400);

  const tickets = await Ticket.find({
    $or: [{ createdBy: employeeId }, { assignedTo: employeeId }],
  })
    .populate('createdBy', 'firstName lastName fullName')
    .populate('assignedTo', 'firstName lastName fullName')
    .sort({ createdAt: -1 })
    .lean();
  sendSuccess(res, tickets);
});
