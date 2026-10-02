const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    options: {
      type: [String],
      validate: [(v) => v.length >= 2 && v.length <= 6, 'A question needs 2 to 6 options'],
    },
    correctIndex: { type: Number, required: true, min: 0 },
    category: { type: String, default: 'General', trim: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    explanation: { type: String, default: '', trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

questionSchema.pre('validate', function (next) {
  if (this.options && this.correctIndex >= this.options.length) {
    this.invalidate('correctIndex', 'Correct answer must match one of the options');
  }
  next();
});

module.exports = mongoose.model('Question', questionSchema);
