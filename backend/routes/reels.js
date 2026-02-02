const express = require('express');
const router = express.Router();
const reelController = require('../controllers/reelController');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/', authMiddleware, upload.single('video'), reelController.createReel);
router.get('/', authMiddleware, reelController.getReels);
router.get('/user/:userId', authMiddleware, reelController.getUserReels);
router.post('/like/:id', authMiddleware, reelController.toggleLikeReel);

module.exports = router;
