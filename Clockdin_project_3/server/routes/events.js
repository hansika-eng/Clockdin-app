const express = require('express');
const Event = require('../models/event.model');
const router = express.Router();

// GET /api/events - get all events
router.get('/', async (req, res) => {
	try {
		const events = await Event.find();
		res.json(events);
	} catch (err) {
		res.status(500).json({ msg: 'Server error' });
	}
});

module.exports = router;
