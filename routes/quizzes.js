const router = require('express').Router();
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Attempt = require('../models/Attempt');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const GRACE_MS = 10 * 1000;

// Grades an attempt against the live question bank and locks it.
async function gradeAttempt(attempt, submitted = {}) {
  const merged = { ...(attempt.draft || {}), ...submitted };
  const questions = await Question.find({ _id: { $in: attempt.questionOrder } });
  const byId = new Map(questions.map((q) => [String(q._id), q]));

  let score = 0;
  const answers = [];
  for (const id of attempt.questionOrder) {
    const q = byId.get(String(id));
    if (!q) continue; // question deleted after quiz started
    const raw = merged[String(id)];
    const selected = Number.isInteger(raw) && raw >= 0 && raw < q.options.length ? raw : null;
    const isCorrect = selected === q.correctIndex;
    if (isCorrect) score++;
    answers.push({
      question: q._id,
      text: q.text,
      options: q.options,
      selected,
      correctIndex: q.correctIndex,
      isCorrect,
      explanation: q.explanation,
    });
  }

  const now = new Date();
  attempt.answers = answers;
  attempt.score = score;
  attempt.total = answers.length;
  attempt.percentage = answers.length ? Math.round((score / answers.length) * 100) : 0;
  attempt.status = 'submitted';
  attempt.submittedAt = now;
  attempt.timeTakenSec = Math.min(
    Math.round((now - attempt.startedAt) / 1000),
    attempt.durationSec
  );
  await attempt.save();
  return attempt;
}
router.gradeAttempt = gradeAttempt;

// ---- list quizzes ----
router.get('/', async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { isActive: true };
  const quizzes = await Quiz.find(filter).sort({ createdAt: -1 }).lean();
  res.json(
    quizzes.map(({ questions, ...q }) => ({
      ...q,
      questionCount: questions.length,
      ...(req.user.role === 'admin' ? { questionIds: questions } : {}),
    }))
  );
});

// ---- admin CRUD ----
const pick = (b) => ({
  title: b.title,
  description: b.description,
  category: b.category,
  durationMinutes: Number(b.durationMinutes),
  questions: b.questions || [],
  isActive: b.isActive !== false,
});

router.post('/', adminOnly, async (req, res) => {
  try {
    const quiz = await Quiz.create({ ...pick(req.body), createdBy: req.user._id });
    res.status(201).json(quiz);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', adminOnly, async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, pick(req.body), {
      new: true,
      runValidators: true,
    });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json(quiz);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', adminOnly, async (req, res) => {
  await Quiz.findByIdAndDelete(req.params.id);
  res.json({ message: 'Quiz deleted' });
});

// ---- start (or resume) an attempt ----
router.post('/:id/start', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz || !quiz.isActive) return res.status(404).json({ message: 'Quiz not available' });
    if (!quiz.questions.length) return res.status(400).json({ message: 'This quiz has no questions yet' });

    const durationSec = quiz.durationMinutes * 60;
    let attempt = await Attempt.findOne({ user: req.user._id, quiz: quiz._id, status: 'in_progress' });

    // an abandoned attempt whose time ran out gets graded as-is
    if (attempt && Date.now() > attempt.startedAt.getTime() + durationSec * 1000 + GRACE_MS) {
      await gradeAttempt(attempt);
      attempt = null;
    }

    if (!attempt) {
      const existing = await Question.find({ _id: { $in: quiz.questions } }).select('_id');
      const order = shuffle(existing.map((q) => q._id));
      if (!order.length) return res.status(400).json({ message: 'This quiz has no questions yet' });
      attempt = await Attempt.create({
        user: req.user._id,
        quiz: quiz._id,
        quizTitle: quiz.title,
        questionOrder: order,
        total: order.length,
        durationSec,
      });
    }

    const found = await Question.find({ _id: { $in: attempt.questionOrder } }).select(
      '-correctIndex -explanation -createdBy'
    );
    const byId = new Map(found.map((q) => [String(q._id), q]));
    const questions = attempt.questionOrder.map((id) => byId.get(String(id))).filter(Boolean);

    res.json({
      attemptId: attempt._id,
      title: quiz.title,
      durationSec,
      endsAt: new Date(attempt.startedAt.getTime() + durationSec * 1000),
      serverNow: new Date(),
      saved: attempt.draft || {},
      questions,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
