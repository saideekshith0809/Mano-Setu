/**
 * ManoSetu - Chat Controller (Mongoose)
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  systemInstruction: "You are ManoSetu AI, a compassionate mental health assistant for Indian youth. Provide supportive, scientifically-backed, and culturally relevant advice. Keep responses concise and avoid medical diagnosis. If a user is in crisis, recommend professional help or our SOS feature.",
});

// Mock AI responses as fallback
const AI_RESPONSES = [
  "I hear you 💙 Can you tell me more about what's been feeling heavy?",
  "Let's try a quick breathing exercise — inhale for 4 counts, hold for 4, exhale for 6.",
  "You're doing so well by talking about this. Sometimes just naming what we feel helps.",
];

const { db } = require('../config/firebase');

// POST /api/chat
const sendChatMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ success: false, error: 'Message cannot be empty.' });
    }

    const userId = req.user?.id || 'anonymous';
    
    // 1. Save User Message
    try {
      await db.collection('messages').add({
        userId, role: 'user', text: message.trim(), createdAt: new Date().toISOString()
      });
    } catch (err) { console.warn("DB User Message Save Failed:", err.message); }

    // 2. Get history for context (last 5 messages)
    let context = [];
    try {
      const historySnap = await db.collection('messages')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(6)
        .get();
      
      const history = historySnap.docs.map(doc => doc.data());
      context = history.reverse().map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }],
      }));
    } catch (dbErr) { console.warn("DB Context Load Failed:", dbErr.message); }

    let aiText = "";

    // 3. Try Gemini API
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'placeholder') {
      try {
        const chat = model.startChat({ history: context });
        const result = await chat.sendMessage(message);
        const response = await result.response;
        aiText = response.text();
      } catch (err) {
        console.error("Gemini SDK Error:", err.message);
        aiText = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
      }
    } else {
      aiText = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    // 4. Save AI Response
    try {
      await db.collection('messages').add({
        userId, role: 'ai', text: aiText, createdAt: new Date().toISOString()
      });
    } catch (dbErr) { console.warn("DB AI Message Save Failed:", dbErr.message); }

    res.json({ success: true, response: aiText });
  } catch (error) {
    next(error);
  }
};

// GET /api/chat/history
const getChatHistory = async (req, res, next) => {
  try {
    const userId = req.user?.id || 'anonymous';
    const snapshot = await db.collection('messages')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'asc')
      .limit(50)
      .get();
    
    const history = snapshot.docs.map(doc => {
      const h = doc.data();
      return { role: h.role, text: h.text, timestamp: h.createdAt };
    });
    
    res.json({ success: true, history: history.length ? history : [{ role: 'ai', text: 'Welcome to ManoSetu! How can I help?', timestamp: new Date() }] });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendChatMessage, getChatHistory };
