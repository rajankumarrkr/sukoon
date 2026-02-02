const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/', authMiddleware, upload.single('image'), storyController.createStory);
router.get('/', authMiddleware, storyController.getStories);

module.exports = router;
