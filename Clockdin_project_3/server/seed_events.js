// This script seeds the database with real events for testing.
const mongoose = require('mongoose');
const Event = require('./models/event.model');
require('dotenv').config();

const uri = process.env.ATLAS_URI;

// --- BEGIN: AUTO-GENERATED EVENTS FROM mockEvents ---
const mockEvents = require('./mockEventsData');

// Transform mockEvents (featured + upcoming) to backend schema
const events = [...mockEvents.featured, ...mockEvents.upcoming].map(e => ({
  title: e.title,
  description: e.description,
  organizerName: e.organizer || e.organizerName || 'Unknown',
  location: e.location,
  applicationRequirements: '',
  deadline: new Date(e.deadline),
  date: new Date(e.eventDate),
  tags: e.tags || [],
  eventType: (e.type && typeof e.type === 'string') ?
    (e.type.toLowerCase().includes('hack') ? 'Hackathon' :
     e.type.toLowerCase().includes('intern') ? 'Internship' :
     e.type.toLowerCase().includes('workshop') ? 'Workshop' :
     e.type.toLowerCase().includes('seminar') ? 'Seminar' :
     e.type.toLowerCase().includes('competition') ? 'Student Competition' :
     'Seminar') : 'Seminar',
  link: e.applyLink || e.link || ''
}));
// --- END: AUTO-GENERATED EVENTS FROM mockEvents ---

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    await Event.deleteMany({});
    await Event.insertMany(events);
    console.log('Database seeded with real events!');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error seeding database:', err);
    mongoose.disconnect();
  });
