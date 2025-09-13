const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

const router = express.Router();

// POST /api/chatbot - send user message to Gemini API and return response
console.log('Gemini API Key (debug):', process.env.GEMINI_API_KEY);
router.post('/', async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) {
    console.error('No message provided in request body');
    return res.status(400).json({ msg: 'Message required' });
  }

  try {
    const geminiRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          { parts: [ { text: userMessage } ] }
        ]
      })
    });
    const data = await geminiRes.json();
    if (!geminiRes.ok) {
      console.error('Gemini API error:', data);
      return res.status(500).json({ msg: 'Gemini API error', error: data });
    }
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not answer that.';
    res.json({ reply });
  } catch (err) {
    console.error('Server error in /api/chatbot:', err);
    res.status(500).json({ msg: 'Gemini API error', error: err.message });
  }
});

module.exports = router;
