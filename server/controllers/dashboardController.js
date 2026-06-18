const Employee = require('../models/Employee');
const User = require('../models/User');
const Course = require('../models/Course');
const LeaveRequest = require('../models/LeaveRequest');
const Candidate = require('../models/Candidate');
const Asset = require('../models/Asset');
const Ticket = require('../models/Ticket');
const ExitRequest = require('../models/ExitRequest');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendSuccess } = require('../utils/response');

exports.getDashboard = asyncHandler(async (req, res) => {
  const [
    employeeCount,
    candidateCount,
    pendingLeaves,
    employeesOnLeave,
    departmentStats,
    leaveTypeStats,
    monthlyHires,
    activeEmployees,
    totalUsers,
    activeCourses,
    jobTitleStats,
    totalAssets,
    openTickets,
    pendingExits,
  ] = await Promise.all([
    Employee.countDocuments({ isActive: true }),
    Candidate.countDocuments({}),
    LeaveRequest.find({ status: 'pending' })
      .populate('employee', 'fullName')
      .populate('leaveType', 'name')
      .sort({ appliedOn: -1 })
      .limit(5)
      .lean(),
    LeaveRequest.find({
      status: 'approved',
      fromDate: { $lte: new Date() },
      toDate: { $gte: new Date() },
    })
      .populate('employee', 'fullName department')
      .lean(),
    Employee.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]),
    LeaveRequest.aggregate([
      { $match: { status: { $in: ['pending', 'approved'] } } },
      { $group: { _id: '$leaveType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]),
    Employee.aggregate([
      { $match: { isActive: true, joinedDate: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$joinedDate' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 12 },
    ]),
    Employee.countDocuments({ isActive: true, joinedDate: { $exists: true, $ne: null } }),
    User.countDocuments({ status: true }),
    Course.countDocuments({ status: 'active' }),
    Employee.aggregate([
      { $match: { isActive: true, jobTitle: { $ne: null } } },
      { $group: { _id: '$jobTitle', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]),
    Asset.countDocuments({ status: { $ne: 'retired' } }),
    Ticket.countDocuments({ status: { $nin: ['resolved', 'closed'] } }),
    ExitRequest.countDocuments({ status: { $nin: ['rejected', 'completed'] } }),
  ]);

  const withJobTitleNames = await Employee.populate(jobTitleStats, {
    path: '_id',
    select: 'title',
    model: 'JobTitle',
  });

  sendSuccess(res, {
    employeeCount,
    candidateCount,
    totalUsers,
    activeCourses,
    pendingLeaves,
    employeesOnLeave,
    departmentStats: departmentStats.map(d => ({ name: d._id || 'Unassigned', count: d.count })),
    leaveTypeStats,
    monthlyHires: monthlyHires.reverse(),
    recentHires: activeEmployees,
    jobTitleStats: withJobTitleNames.map(j => ({ name: j._id?.title || 'Unassigned', count: j.count })),
    totalAssets,
    openTickets,
    pendingExits,
  });
});

exports.globalSearch = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return sendSuccess(res, []);

  const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const results = [];

  const employees = await Employee.find({
    isActive: true,
    $or: [
      { firstName: regex }, { lastName: regex },
      { fullName: regex }, { employeeId: regex },
      { workEmail: regex }, { department: regex },
    ]
  }).select('fullName employeeId department').limit(5).lean();

  employees.forEach(e => {
    results.push({
      type: 'Employee',
      label: e.fullName,
      subtitle: `${e.employeeId} · ${e.department || ''}`,
      path: `/pim/${e._id}`,
    });
  });

  const users = await User.find({
    $or: [{ username: regex }],
  }).select('username role').limit(3).lean();

  users.forEach(u => {
    results.push({
      type: 'User',
      label: u.username,
      subtitle: u.role,
      path: '/admin/users',
    });
  });

  const courses = await Course.find({
    status: 'active',
    $or: [{ title: regex }, { description: regex }, { category: regex }],
  }).select('title category').limit(3).lean();

  courses.forEach(c => {
    results.push({
      type: 'Course',
      label: c.title,
      subtitle: c.category,
      path: '/training/courses',
    });
  });

  const candidates = await Candidate.find({
    $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
  }).select('firstName lastName email status').limit(3).lean();

  candidates.forEach(c => {
    results.push({
      type: 'Candidate',
      label: `${c.firstName} ${c.lastName}`,
      subtitle: `${c.email} · ${c.status}`,
      path: '/recruitment/candidates',
    });
  });

  const assets = await Asset.find({
    status: { $ne: 'retired' },
    $or: [
      { name: regex }, { brand: regex }, { model: regex },
      { serialNumber: regex }, { location: regex },
    ],
  }).select('name type brand serialNumber').limit(3).lean();

  assets.forEach(a => {
    results.push({
      type: 'Asset',
      label: a.name,
      subtitle: `${a.type} ${a.brand ? `· ${a.brand}` : ''}${a.serialNumber ? ` · ${a.serialNumber}` : ''}`,
      path: '/assets',
    });
  });

  const tickets = await Ticket.find({
    status: { $nin: ['closed'] },
    $or: [{ subject: regex }, { description: regex }, { category: regex }],
  })
    .populate('createdBy', 'fullName')
    .select('subject category status priority createdBy')
    .limit(3).lean();

  tickets.forEach(t => {
    results.push({
      type: 'Ticket',
      label: t.subject,
      subtitle: `${t.category} · ${t.status}${t.createdBy ? ` · ${t.createdBy.fullName}` : ''}`,
      path: '/helpdesk/tickets',
    });
  });

  const exitRequests = await ExitRequest.find({
    status: { $nin: ['completed'] },
    $or: [{ reason: regex }],
  })
    .populate('employee', 'fullName employeeId')
    .select('reason type status employee')
    .limit(3).lean();

  exitRequests.forEach(e => {
    results.push({
      type: 'Exit Request',
      label: `${e.employee?.fullName || 'Unknown'}`,
      subtitle: `${e.type} · ${e.status}${e.reason ? ` · ${e.reason.slice(0, 40)}` : ''}`,
      path: '/exit/requests',
    });
  });

  sendSuccess(res, results);
});
