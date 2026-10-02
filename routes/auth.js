const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const sign = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const payload = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(400).json({ message: 'Email is already registered' });
    const user = await User.create({ name, email, password }); // role is always "user"
    res.status(201).json({ token: sign(user._id), user: payload(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password || '')))
      return res.status(401).json({ message: 'Invalid email or password' });
    res.json({ token: sign(user._id), user: payload(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/me', protect, (req, res) => res.json({ user: payload(req.user) }));

module.exports = router;
