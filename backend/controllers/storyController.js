const Story = require('../models/Story');
const User = require('../models/User');
const cloudinary = require('../utils/cloudinary');
const fs = require('fs');

exports.createStory = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: 'Image file is required' });
        }

        const result = await cloudinary.uploader.upload(file.path, {
            folder: 'sukoon_stories',
            transformation: [{ width: 1080, height: 1920, crop: 'limit' }]
        });

        fs.unlinkSync(file.path);

        const story = new Story({
            userId: req.userId,
            imageUrl: result.secure_url
        });

        await story.save();
        await story.populate('userId', 'username profilePic');

        res.status(201).json({ message: 'Story posted', story });
    } catch (error) {
        console.error('Create story error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getStories = async (req, res) => {
    try {
        // Simple logic: get stories from everyone or just followed? 
        // For now, let's get recent stories from followed users.
        const stories = await Story.find()
            .populate('userId', 'username profilePic')
            .sort({ createdAt: -1 });

        // Group by user
        const groupedStories = stories.reduce((acc, story) => {
            const userId = story.userId._id.toString();
            if (!acc[userId]) {
                acc[userId] = {
                    user: story.userId,
                    items: []
                };
            }
            acc[userId].items.push(story);
            return acc;
        }, {});

        res.json({ stories: Object.values(groupedStories) });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
