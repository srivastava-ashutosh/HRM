const Course = require('../models/Course');
const TrainingRecord = require('../models/TrainingRecord');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { sendSuccess, sendPaginated } = require('../utils/response');
const paginate = require('../utils/paginate');

exports.getCourses = asyncHandler(async (req, res) => {
  const result = await paginate(Course, {}, {
    ...req.query,
    searchFields: ['title', 'description', 'category'],
    sort: '-createdAt',
  });
  sendPaginated(res, result.data, { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages });
});

exports.getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new AppError('Course not found', 404);
  sendSuccess(res, course);
});

exports.createCourse = asyncHandler(async (req, res) => {
  const course = await Course.create(req.body);
  sendSuccess(res, course, 'Course created', 201);
});

exports.updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!course) throw new AppError('Course not found', 404);
  sendSuccess(res, course, 'Course updated');
});

exports.deleteCourse = asyncHandler(async (req, res) => {
  await Course.findByIdAndUpdate(req.params.id, { status: 'inactive' });
  sendSuccess(res, null, 'Course deactivated');
});

exports.getTrainingRecords = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.employeeId) filter.employee = req.query.employeeId;
  if (req.query.courseId) filter.course = req.query.courseId;
  if (req.query.status) filter.status = req.query.status;

  const result = await paginate(TrainingRecord, filter, {
    ...req.query,
    searchFields: ['notes'],
    populate: [
      { path: 'employee', select: 'firstName lastName fullName employeeId' },
      { path: 'course', select: 'title category duration durationUnit' },
    ],
    sort: '-createdAt',
  });
  sendPaginated(res, result.data, { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages });
});

exports.enrollEmployee = asyncHandler(async (req, res) => {
  const { employeeId, courseId } = req.body;
  const course = await Course.findById(courseId);
  if (!course) throw new AppError('Course not found', 404);
  if (course.status !== 'active') throw new AppError('Course is not active', 400);

  const existing = await TrainingRecord.findOne({ employee: employeeId, course: courseId, status: { $in: ['enrolled', 'in_progress'] } });
  if (existing) throw new AppError('Employee is already enrolled in this course', 400);

  if (course.maxParticipants > 0) {
    const count = await TrainingRecord.countDocuments({ course: courseId, status: { $in: ['enrolled', 'in_progress'] } });
    if (count >= course.maxParticipants) throw new AppError('Course has reached maximum participants', 400);
  }

  const record = await TrainingRecord.create({ employee: employeeId, course: courseId });
  const populated = await record.populate([
    { path: 'employee', select: 'firstName lastName fullName employeeId' },
    { path: 'course', select: 'title category' },
  ]);
  sendSuccess(res, populated, 'Employee enrolled', 201);
});

exports.updateTrainingRecord = asyncHandler(async (req, res) => {
  const record = await TrainingRecord.findById(req.params.id);
  if (!record) throw new AppError('Training record not found', 404);

  const { status, score, notes } = req.body;
  if (status) record.status = status;
  if (score !== undefined) record.score = score;
  if (notes !== undefined) record.notes = notes;
  if (status === 'completed') {
    record.completionDate = new Date();
    record.completedBy = req.user._id;
  }
  await record.save();
  const populated = await record.populate([
    { path: 'employee', select: 'firstName lastName fullName employeeId' },
    { path: 'course', select: 'title category duration durationUnit' },
  ]);
  sendSuccess(res, populated, 'Training record updated');
});

exports.getMyTraining = asyncHandler(async (req, res) => {
  const employeeId = req.user.employeeId?._id || req.user.employeeId;
  if (!employeeId) throw new AppError('No employee profile linked', 400);

  const result = await paginate(TrainingRecord, { employee: employeeId }, {
    ...req.query,
    populate: [
      { path: 'course', select: 'title description category duration durationUnit provider' },
    ],
    sort: '-createdAt',
  });
  sendPaginated(res, result.data, { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages });
});
