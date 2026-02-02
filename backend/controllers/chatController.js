const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

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
            .sort({ createdAt: 1 });

        res.json({ messages });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { recipientId, text } = req.body;

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
            text
        });

        await message.save();

        conversation.lastMessage = message._id;
        await conversation.save();

        res.status(201).json({ message, conversationId: conversation._id });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
