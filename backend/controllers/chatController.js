const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendNotification } = require('../utils/socket');
const cloudinary = require('../utils/cloudinary');
const fs = require('fs');

exports.uploadImage = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: 'Image file is required' });
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(file.path, {
            folder: 'sukoon_chat',
            transformation: [{ width: 1080, crop: 'limit' }]
        });

        // Remove file from local uploads folder
        fs.unlinkSync(file.path);

        res.json({ imageUrl: result.secure_url });
    } catch (error) {
        console.error('Chat image upload error:', error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: { $in: [req.userId] }
        })
            .populate('participants', 'username profilePic name')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });

        res.json({ conversations });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.find({
            conversationId: req.params.conversationId
        })
            .populate({ path: 'postId', populate: { path: 'userId', select: 'username' } })
            .populate({ path: 'reelId', populate: { path: 'userId', select: 'username' } })
            .sort({ createdAt: 1 });

        res.json({ messages });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { recipientId, text, postId, reelId, imageUrl } = req.body;

        let conversation = await Conversation.findOne({
            participants: { $all: [req.userId, recipientId] }
        });

        if (!conversation) {
            conversation = new Conversation({
                participants: [req.userId, recipientId]
            });
            await conversation.save();
        }

        const message = new Message({
            conversationId: conversation._id,
            sender: req.userId,
            text,
            postId,
            reelId,
            imageUrl
        });

        await message.save();
        await message.populate({ path: 'postId', populate: { path: 'userId', select: 'username' } });
        await message.populate({ path: 'reelId', populate: { path: 'userId', select: 'username' } });

        conversation.lastMessage = message._id;
        conversation.updatedAt = Date.now();
        await conversation.save();

        // Create and send notification
        const notification = new Notification({
            recipient: recipientId,
            sender: req.userId,
            type: 'message',
            text: text || (postId ? 'Shared a post' : reelId ? 'Shared a reel' : 'Shared an image')
        });
        await notification.save();
        await notification.populate('sender', 'username profilePic');

        sendNotification(recipientId, notification);

        res.status(201).json({ message, conversationId: conversation._id });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
