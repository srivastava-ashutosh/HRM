const BuzzPost = require('../models/BuzzPost');
const BuzzComment = require('../models/BuzzComment');
const Employee = require('../models/Employee');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

exports.getPosts = asyncHandler(async (req, res) => {
  const posts = await BuzzPost.find({ isDeleted: false })
    .populate('employee', 'firstName lastName fullName profilePic jobTitle')
    .sort({ createdAt: -1 });
  res.json(posts);
});

exports.createPost = asyncHandler(async (req, res) => {
  const post = await BuzzPost.create({
    employee: req.body.employee,
    content: req.body.content,
    image: req.body.image || '',
    video: req.body.video || ''
  });
  const populated = await BuzzPost.findById(post._id).populate('employee', 'firstName lastName fullName profilePic jobTitle');
  res.status(201).json(populated);
});

exports.likePost = asyncHandler(async (req, res) => {
  const post = await BuzzPost.findById(req.params.id);
  if (!post) throw new AppError('Post not found', 404);
  const idx = post.likes.indexOf(req.body.employeeId);
  if (idx > -1) {
    post.likes.splice(idx, 1);
  } else {
    post.likes.push(req.body.employeeId);
  }
  post.likeCount = post.likes.length;
  await post.save();
  res.json(post);
});

exports.deletePost = asyncHandler(async (req, res) => {
  await BuzzPost.findByIdAndUpdate(req.params.id, { isDeleted: true });
  await BuzzComment.updateMany({ post: req.params.id }, { isDeleted: true });
  res.json({ message: 'Post deleted' });
});

exports.getComments = asyncHandler(async (req, res) => {
  const comments = await BuzzComment.find({ post: req.params.postId, isDeleted: false })
    .populate('employee', 'firstName lastName fullName profilePic')
    .sort({ createdAt: 1 });
  res.json(comments);
});

exports.createComment = asyncHandler(async (req, res) => {
  const comment = await BuzzComment.create({
    post: req.params.postId,
    employee: req.body.employee,
    content: req.body.content
  });
  await BuzzPost.findByIdAndUpdate(req.params.postId, { $inc: { commentCount: 1 } });
  const populated = await BuzzComment.findById(comment._id).populate('employee', 'firstName lastName fullName profilePic');
  res.status(201).json(populated);
});
