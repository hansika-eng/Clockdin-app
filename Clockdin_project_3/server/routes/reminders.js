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
// GET /api/reminders/due - reminders due in next 3 days
router.get('/due', async (req, res) => {
  try {
    const now = new Date();
    const inThreeDays = new Date();
    inThreeDays.setDate(now.getDate() + 3);

    const reminders = await Reminder.find({
      remindAt: { $lte: inThreeDays },
      sent: false
    }).populate('event user');

    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// PATCH /api/reminders/:id/mark-sent
router.patch('/:id/mark-sent', async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      { sent: true },
      { new: true }
    );
    res.json(reminder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


module.exports = router;