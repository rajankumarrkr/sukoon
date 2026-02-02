const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.get('/:id', authMiddleware, userController.getUserProfile);
router.put('/update', authMiddleware, userController.updateProfile);
router.post('/follow/:id', authMiddleware, userController.toggleFollow);

module.exports = router;
