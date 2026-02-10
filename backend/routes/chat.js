const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/auth');

const upload = require('../middleware/upload');

router.get('/conversations', authMiddleware, chatController.getConversations);
router.get('/messages/:conversationId', authMiddleware, chatController.getMessages);
router.post('/send', authMiddleware, chatController.sendMessage);
router.post('/upload', authMiddleware, upload.single('image'), chatController.uploadImage);

module.exports = router;
