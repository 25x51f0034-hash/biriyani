const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId },
    text: String,
    options: [String],
    selected: { type: Number, default: null }, // null = unanswered
    correctIndex: Number,
    isCorrect: Boolean,
    explanation: String,
  },
  { _id: false }
);

const attemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    quizTitle: String,
    status: { type: String, enum: ['in_progress', 'submitted'], default: 'in_progress' },
    questionOrder: [{ type: mongoose.Schema.Types.ObjectId }],
    draft: { type: mongoose.Schema.Types.Mixed, default: {} }, // questionId -> selected index (autosave)
    answers: [answerSchema],
    durationSec: Number,
    startedAt: { type: Date, default: Date.now },
    submittedAt: Date,
    timeTakenSec: Number,
    score: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
  },
  { timestamps: true, minimize: false }
);

module.exports = mongoose.model('Attempt', attemptSchema);
