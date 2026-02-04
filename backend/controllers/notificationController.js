const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.userId })
            .sort({ createdAt: -1 })
            .populate('sender', 'username profilePic')
            .populate('post', 'imageUrl');

        res.json({ notifications });
    } catch (error) {
        console.error('Fetch notifications error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { type } = req.body;
        const query = { recipient: req.userId, read: false };
        if (type) query.type = type;

        await Notification.updateMany(
            query,
            { $set: { read: true } }
        );
        res.json({ message: 'Notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
