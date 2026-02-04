const Reel = require('../models/Reel');
const User = require('../models/User');
const cloudinary = require('../utils/cloudinary');
const fs = require('fs');

exports.createReel = async (req, res) => {
    try {
        const { caption } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'Video file is required' });
        }

        // Upload to Cloudinary (resource_type: 'video')
        const result = await cloudinary.uploader.upload(file.path, {
            folder: 'sukoon_reels',
            resource_type: 'video',
            transformation: [
                { width: 720, height: 1280, crop: 'limit' }
            ]
        });

        fs.unlinkSync(file.path);

        const reel = new Reel({
            userId: req.userId,
            videoUrl: result.secure_url,
            caption
        });

        await reel.save();
        await reel.populate('userId', 'username profilePic');

        res.status(201).json({ message: 'Reel posted successfully', reel });
    } catch (error) {
        console.error('Create reel error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getReels = async (req, res) => {
    try {
        const reels = await Reel.find()
            .populate('userId', 'username profilePic')
            .sort({ createdAt: -1 })
            .limit(100);

        res.json({ reels });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.toggleLikeReel = async (req, res) => {
    try {
        const reel = await Reel.findById(req.params.id);
        if (!reel) return res.status(404).json({ message: 'Reel not found' });

        const isLiked = reel.likes.includes(req.userId);
        if (isLiked) {
            reel.likes = reel.likes.filter(id => id.toString() !== req.userId);
        } else {
            reel.likes.push(req.userId);
        }

        await reel.save();
        res.json({ isLiked: !isLiked, likesCount: reel.likes.length });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUserReels = async (req, res) => {
    try {
        const reels = await Reel.find({ userId: req.params.userId })
            .populate('userId', 'username profilePic')
            .sort({ createdAt: -1 });

        res.json({ reels });
    } catch (error) {
        console.error('Get user reels error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
