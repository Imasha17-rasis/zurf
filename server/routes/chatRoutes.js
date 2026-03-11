const express = require('express');
const {
  initializeChat,
  sendChatMessage,
  getChatHistory
} = require('../controllers/chatController');

const router = express.Router();

// Initialize chat session
router.post('/initialize', initializeChat);

// Send message and get response
router.post('/message', sendChatMessage);

// Get chat history
router.get('/:sessionId', getChatHistory);

module.exports = router;
