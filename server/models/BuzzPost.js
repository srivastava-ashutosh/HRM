const mongoose = require('mongoose');

const buzzPostSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  content: { type: String, required: true },
  image: { type: String, default: '' },
  video: { type: String, default: '' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
  likeCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('BuzzPost', buzzPostSchema);
