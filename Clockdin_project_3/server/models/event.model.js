const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  eventDate: Date,
  deadline: Date,
  type: String,
  tags: [String],
  organizer: String,
  organizerName: String,
  location: String,
  applyLink: String,
  participants: Number,
  isBookmarked: Boolean,
  category: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Event', eventSchema);
