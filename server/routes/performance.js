const express = require('express');
const router = express.Router();
const { protect, requirePermission } = require('../middleware/auth');
const { getReviews, createReview, updateReview, completeReview, deleteReview, importReviews } = require('../controllers/performanceController');

router.get('/reviews', protect, requirePermission('performance:read'), getReviews);
router.post('/reviews', protect, requirePermission('performance:create'), createReview);
router.put('/reviews/:id', protect, requirePermission('performance:update'), updateReview);
router.put('/reviews/complete/:id', protect, requirePermission('performance:approve'), completeReview);
router.delete('/reviews/:id', protect, requirePermission('performance:delete'), deleteReview);
router.post('/reviews/import', protect, requirePermission('performance:create'), importReviews);

module.exports = router;
