const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// Setup nodemailer transporter (use your SMTP credentials)
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email provider
  auth: {
    user: process.env.EMAIL_USER, // set in .env
    pass: process.env.EMAIL_PASS  // set in .env
  }
});

// Cron job: runs every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  const now = new Date();
  // Find reminders not sent and due
  const reminders = await Reminder.find({ sent: false, remindAt: { $lte: now } }).populate('event');
  for (const reminder of reminders) {
    // Send email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: reminder.email,
        subject: `Event Reminder: ${reminder.event.title}`,
        text: `Hi! This is a reminder for the event "${reminder.event.title}" happening on ${reminder.event.eventDate?.toLocaleDateString()}.`
      });
      // Mark as sent
      reminder.sent = true;
      await reminder.save();
      console.log(`Reminder sent to ${reminder.email} for event ${reminder.event.title}`);
    } catch (err) {
      console.error('Error sending reminder:', err);
    }
  }
});

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/events', require('./routes/events'));
app.use('/api/reminders', require('./routes/reminders'));
app.use('/api/auth', require('./routes/auth'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// ...existing code...
const passport = require('passport');
require('./config/passportGoogle')(passport);
app.use(passport.initialize());

