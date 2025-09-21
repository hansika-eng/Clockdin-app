
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const router = express.Router();

// Fix all notification dates for all users
router.post('/notifications/fix-dates', async (req, res) => {
  try {
    const users = await User.find();
    let fixedCount = 0;
    for (const user of users) {
      let changed = false;
      for (const notif of user.notifications) {
        // If 'date' or 'time' is missing or invalid, set both to now or try to parse the other
        let validDate = null;
        if (notif.date && !isNaN(new Date(notif.date).getTime())) {
          validDate = new Date(notif.date);
        } else if (notif.time && !isNaN(new Date(notif.time).getTime())) {
          validDate = new Date(notif.time);
        } else {
          validDate = new Date();
        }
        if (!notif.date || isNaN(new Date(notif.date).getTime())) {
          notif.date = validDate;
          changed = true;
        }
        if (!notif.time || isNaN(new Date(notif.time).getTime())) {
          notif.time = validDate;
          changed = true;
        }
      }
      if (changed) {
        await user.save();
        fixedCount++;
      }
    }
    res.json({ fixed: fixedCount });
  } catch (err) {
    res.status(500).json({ msg: 'Error fixing notification dates', error: err.message });
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

// Replace all myEvents for the user
router.post('/myevents/replace', auth, async (req, res) => {
  const { events } = req.body;
  const user = await User.findById(req.user.id);
  user.myEvents = events;
  await user.save();
  res.json(user.myEvents);
});

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
  const { title, description, date, time, location, category, reminder } = req.body;
  const user = await User.findById(req.user.id);
  user.myEvents.push({ title, description, date, time, location, category, reminder });
  await user.save();
  res.json(user.myEvents);
});
router.get('/myevents', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user.myEvents);
});

// Update a specific event by index
router.put('/myevents/:idx', auth, async (req, res) => {
  const idx = parseInt(req.params.idx);
  const user = await User.findById(req.user.id);
  if (user.myEvents[idx]) {
    // Only update provided fields
    Object.assign(user.myEvents[idx], req.body);
    await user.save();
    return res.json(user.myEvents);
  } else {
    return res.status(404).json({ msg: 'Event not found' });
  }
});

router.delete('/myevents/:idx', auth, async (req, res) => {
  const idx = parseInt(req.params.idx);
  const user = await User.findById(req.user.id);
  if (user.myEvents[idx]) user.myEvents.splice(idx, 1);
  await user.save();
  res.json(user.myEvents);
});

// Notifications: get, create, mark as read
router.get('/notifications', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user.notifications);
});
router.post('/notifications', auth, async (req, res) => {
  const { message, date, type = 'reminder', title = '' } = req.body;
  const user = await User.findById(req.user.id);
  // Use 'time' property for notification date, default to now if not provided
  const notif = { message, time: date ? new Date(date) : new Date(), read: false, type, title };
  user.notifications.push(notif);
  await user.save();
  // Add id field for frontend compatibility
  const notificationsWithId = user.notifications.map(n => ({
    ...n.toObject ? n.toObject() : n,
    id: n._id || n.id
  }));
  res.json(notificationsWithId);
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
  // Update name/email if present
  if (req.body.name) user.name = req.body.name;
  if (req.body.email) user.email = req.body.email;
  // Update profile fields
  user.profile = { ...user.profile, ...req.body };
  await user.save();
  res.json({
    name: user.name,
    email: user.email,
    profile: user.profile
  });
});

// Fix all notification dates for all users
router.post('/notifications/fix-dates', async (req, res) => {
  try {
    const users = await User.find();
    let fixedCount = 0;
    for (const user of users) {
      let changed = false;
      for (const notif of user.notifications) {
        // If 'time' is missing or invalid, set it to now or try to parse 'date'
        if (!notif.time || isNaN(new Date(notif.time).getTime())) {
          if (notif.date && !isNaN(new Date(notif.date).getTime())) {
            notif.time = new Date(notif.date);
          } else {
            notif.time = new Date();
          }
          changed = true;
        }
      }
      if (changed) {
        await user.save();
        fixedCount++;
      }
    }
    res.json({ fixed: fixedCount });
  } catch (err) {
    res.status(500).json({ msg: 'Error fixing notification dates', error: err.message });
  }
});

module.exports = router;
