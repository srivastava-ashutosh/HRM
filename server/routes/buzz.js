const express = require('express');
const router = express.Router();
const { protect, requirePermission } = require('../middleware/auth');
const { getPosts, createPost, likePost, deletePost, getComments, createComment } = require('../controllers/buzzController');

router.get('/posts', protect, requirePermission('buzz:read'), getPosts);
router.post('/posts', protect, requirePermission('buzz:create'), createPost);
router.put('/posts/like/:id', protect, requirePermission('buzz:write'), likePost);
router.delete('/posts/:id', protect, requirePermission('buzz:delete'), deletePost);

router.get('/posts/:postId/comments', protect, requirePermission('buzz:read'), getComments);
router.post('/posts/:postId/comments', protect, requirePermission('buzz:create'), createComment);

module.exports = router;
