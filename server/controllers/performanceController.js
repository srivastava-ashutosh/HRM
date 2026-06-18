const PerformanceReview = require('../models/PerformanceReview');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

exports.getReviews = asyncHandler(async (req, res) => {
  const { employee, status } = req.query;
  let query = {};
  if (employee) query.employee = employee;
  if (status) query.status = status;
  const reviews = await PerformanceReview.find(query)
    .populate('employee', 'firstName lastName fullName')
    .populate('reviewer', 'firstName lastName fullName')
    .sort({ createdAt: -1 });
  res.json(reviews);
});

exports.createReview = asyncHandler(async (req, res) => {
  const review = await PerformanceReview.create(req.body);
  res.status(201).json(review);
});

exports.updateReview = asyncHandler(async (req, res) => {
  const review = await PerformanceReview.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(review);
});

exports.completeReview = asyncHandler(async (req, res) => {
  const review = await PerformanceReview.findById(req.params.id);
  if (!review) throw new AppError('Review not found', 404);
  review.status = 'completed';
  review.finalComment = req.body.finalComment || review.finalComment;
  if (review.items && review.items.length > 0) {
    const total = review.items.reduce((sum, item) => sum + (item.rating || 0), 0);
    review.overallRating = Math.round((total / review.items.length) * 10) / 10;
  }
  await review.save();
  res.json(review);
});

exports.deleteReview = asyncHandler(async (req, res) => {
  await PerformanceReview.findByIdAndUpdate(req.params.id, { status: 'archived' });
  res.json({ message: 'Review archived' });
});

exports.importReviews = asyncHandler(async (req, res) => {
  const items = await PerformanceReview.insertMany(req.body);
  res.status(201).json({ count: items.length });
});
