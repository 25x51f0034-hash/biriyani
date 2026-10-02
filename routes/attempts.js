const router = require('express').Router();
const Attempt = require('../models/Attempt');
const { gradeAttempt } = require('./quizzes');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);

// my history
router.get('/mine', async (req, res) => {
  const list = await Attempt.find({ user: req.user._id, status: 'submitted' })
    .select('quiz quizTitle score total percentage timeTakenSec submittedAt')
    .sort({ submittedAt: -1 });
  res.json(list);
});

// all attempts (admin)
router.get('/', adminOnly, async (_req, res) => {
  const list = await Attempt.find({ status: 'submitted' })
    .select('quizTitle score total percentage timeTakenSec submittedAt user')
    .populate('user', 'name email')
    .sort({ submittedAt: -1 })
    .limit(500);
  res.json(list);
});

const loadOwn = async (req, res) => {
  const attempt = await Attempt.findById(req.params.id);
  if (!attempt) return void res.status(404).json({ message: 'Attempt not found' });
  if (String(attempt.user) !== String(req.user._id) && req.user.role !== 'admin')
    return void res.status(403).json({ message: 'Not your attempt' });
  return attempt;
};

// autosave a single answer while the quiz is running
router.patch('/:id/answer', async (req, res) => {
  const attempt = await loadOwn(req, res);
  if (!attempt) return;
  if (attempt.status !== 'in_progress') return res.status(400).json({ message: 'Attempt already submitted' });
  const { questionId, selected } = req.body;
  attempt.draft = { ...(attempt.draft || {}), [questionId]: selected };
  attempt.markModified('draft');
  await attempt.save();
  res.json({ ok: true });
});

// submit and grade (also used by the auto-submit when the timer hits zero)
router.put('/:id/submit', async (req, res) => {
  try {
    const attempt = await loadOwn(req, res);
    if (!attempt) return;
    if (attempt.status === 'submitted') return res.json({ attemptId: attempt._id });
    await gradeAttempt(attempt, req.body.answers || {});
    res.json({ attemptId: attempt._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// result + review
router.get('/:id', async (req, res) => {
  const attempt = await loadOwn(req, res);
  if (!attempt) return;
  if (attempt.status !== 'submitted') return res.status(400).json({ message: 'Attempt is still in progress' });
  res.json(attempt);
});

module.exports = router;
