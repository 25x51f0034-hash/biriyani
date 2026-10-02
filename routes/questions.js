const router = require('express').Router();
const Question = require('../models/Question');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

const clean = (b) => ({
  text: b.text,
  options: (b.options || []).map((o) => String(o).trim()).filter(Boolean),
  correctIndex: Number(b.correctIndex),
  category: b.category || 'General',
  difficulty: b.difficulty || 'medium',
  explanation: b.explanation || '',
});

router.get('/', async (req, res) => {
  const { category, q } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (q) filter.text = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  res.json(await Question.find(filter).sort({ createdAt: -1 }));
});

router.get('/categories', async (_req, res) => res.json(await Question.distinct('category')));

router.post('/', async (req, res) => {
  try {
    const q = await Question.create({ ...clean(req.body), createdBy: req.user._id });
    res.status(201).json(q);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const q = await Question.findById(req.params.id);
    if (!q) return res.status(404).json({ message: 'Question not found' });
    Object.assign(q, clean(req.body));
    await q.save();
    res.json(q);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  await Question.findByIdAndDelete(req.params.id);
  res.json({ message: 'Question deleted' });
});

module.exports = router;
