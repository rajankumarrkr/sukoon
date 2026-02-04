const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendNotification } = require('../utils/socket');

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
        const { recipientId, text, postId, reelId } = req.body;

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
            reelId
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
            text: text || (postId ? 'Shared a post' : 'Shared a reel')
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
