const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    category: { type: String, default: 'General', trim: true },
    durationMinutes: { type: Number, required: true, min: 1, max: 240, default: 10 },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);
