const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// All routes require authentication
router.get('/search', authMiddleware, userController.searchUsers);
router.get('/:id', authMiddleware, userController.getUserProfile);
router.put('/update', authMiddleware, upload.single('profilePic'), userController.updateProfile);
router.post('/follow/:id', authMiddleware, userController.toggleFollow);

module.exports = router;
