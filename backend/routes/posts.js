const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.post('/', authMiddleware, postController.createPost);
router.get('/feed', authMiddleware, postController.getFeed);
router.get('/user/:userId', authMiddleware, postController.getUserPosts);
router.delete('/:id', authMiddleware, postController.deletePost);
router.post('/like/:id', authMiddleware, postController.toggleLike);
router.post('/comment/:id', authMiddleware, postController.addComment);

module.exports = router;
