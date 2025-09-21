const express = require('express');
const router = express.Router();
const Reminder = require('../models/reminder.model');

// POST /api/reminders
router.post('/', async (req, res) => {
  try {
    const { user, event, email, remindAt } = req.body;
    const reminder = new Reminder({ user, event, email, remindAt });
    await reminder.save();
    res.json({ success: true, reminder });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;