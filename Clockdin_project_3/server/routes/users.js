const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ msg: 'All fields required' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Auth middleware
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, auth denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ msg: 'Token invalid' });
  }
};


// Get current user
router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

// Bookmarks: add/remove
router.post('/bookmarks', auth, async (req, res) => {
  const { eventId } = req.body;
  if (!eventId) return res.status(400).json({ msg: 'Event ID required' });
  const user = await User.findById(req.user.id);
  if (!user.bookmarks.includes(eventId)) user.bookmarks.push(eventId);
  await user.save();
  res.json(user.bookmarks);
});
router.delete('/bookmarks/:eventId', auth, async (req, res) => {
  const { eventId } = req.params;
  const user = await User.findById(req.user.id);
  user.bookmarks = user.bookmarks.filter(id => id.toString() !== eventId);
  await user.save();
  res.json(user.bookmarks);
});

// My Events: add, get, delete
router.post('/myevents', auth, async (req, res) => {
  const { title, description, date, category, reminder } = req.body;
  const user = await User.findById(req.user.id);
  user.myEvents.push({ title, description, date, category, reminder });
  await user.save();
  res.json(user.myEvents);
});
router.get('/myevents', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user.myEvents);
});
router.delete('/myevents/:idx', auth, async (req, res) => {
  const idx = parseInt(req.params.idx);
  const user = await User.findById(req.user.id);
  if (user.myEvents[idx]) user.myEvents.splice(idx, 1);
  await user.save();
  res.json(user.myEvents);
});

// Notifications: get, mark as read
router.get('/notifications', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user.notifications);
});
router.post('/notifications/read', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  user.notifications.forEach(n => n.read = true);
  await user.save();
  res.json(user.notifications);
});

// Profile: update
router.put('/profile', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  user.profile = { ...user.profile, ...req.body };
  await user.save();
  res.json(user.profile);
});

module.exports = router;
