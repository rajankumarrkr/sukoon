const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/auth');

router.get('/conversations', authMiddleware, chatController.getConversations);
router.get('/messages/:conversationId', authMiddleware, chatController.getMessages);
router.post('/send', authMiddleware, chatController.sendMessage);

module.exports = router;
