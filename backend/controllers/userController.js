const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendNotification } = require('../utils/socket');

// Get user profile by ID
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('followers', 'username profilePic')
            .populate('following', 'username profilePic');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const cloudinary = require('../utils/cloudinary');
const fs = require('fs');

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, bio } = req.body;
        let profilePic = req.body.profilePic;

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'sukoon_profiles',
                width: 300,
                height: 300,
                crop: 'fill'
            });
            profilePic = result.secure_url;
            fs.unlinkSync(req.file.path);
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            { name, bio, profilePic },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Follow/Unfollow user
exports.toggleFollow = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.userId;

        if (targetUserId === currentUserId) {
            return res.status(400).json({ message: 'You cannot follow yourself' });
        }

        const targetUser = await User.findById(targetUserId);
        const currentUser = await User.findById(currentUserId);

        if (!targetUser || !currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isFollowing = currentUser.following.includes(targetUserId);

        if (isFollowing) {
            // Unfollow
            currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
            targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId);
        } else {
            // Follow
            currentUser.following.push(targetUserId);
            targetUser.followers.push(currentUserId);

            // Create notification for follow
            const notification = new Notification({
                recipient: targetUserId,
                sender: currentUserId,
                type: 'follow',
                text: 'started following you'
            });
            await notification.save();
            await notification.populate('sender', 'username profilePic');

            sendNotification(targetUserId, notification);
        }

        await currentUser.save();
        await targetUser.save();

        res.json({
            message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully',
            isFollowing: !isFollowing
        });
    } catch (error) {
        console.error('Follow/Unfollow error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Search users
exports.searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const users = await User.find({
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { name: { $regex: query, $options: 'i' } }
            ],
            _id: { $ne: req.userId } // Exclude current user from search results
        }).select('username name profilePic bio');

        res.json({ users });
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
