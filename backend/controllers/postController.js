const Post = require('../models/Post');
const User = require('../models/User'); // Fixed missing import
const Notification = require('../models/Notification');
const { sendNotification } = require('../utils/socket');
const cloudinary = require('../utils/cloudinary');
const fs = require('fs');

// Create new post
exports.createPost = async (req, res) => {
    try {
        const { caption } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'Image file is required' });
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(file.path, {
            folder: 'sukoon_posts',
            transformation: [{ width: 1080, height: 1080, crop: 'limit' }]
        });

        // Remove file from local uploads folder
        fs.unlinkSync(file.path);

        const post = new Post({
            userId: req.userId,
            imageUrl: result.secure_url,
            caption: caption || ''
        });

        await post.save();
        await post.populate('userId', 'username profilePic');

        res.status(201).json({ message: 'Post created successfully', post });
    } catch (error) {
        console.error('Create post error:', error);
        // Cleanup local file if error occurs after upload started
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: 'Server error pulse check' });
    }
};

// Get feed (posts from followed users)
exports.getFeed = async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get official account ID to show its content to everyone
        const officialUser = await User.findOne({ username: 'sukoon_official' });
        const followingIds = [...user.following, req.userId];
        if (officialUser) followingIds.push(officialUser._id);

        // Get posts from followed users, own posts, and official account
        const posts = await Post.find({
            userId: { $in: followingIds }
        })
            .populate('userId', 'username profilePic')
            .populate('comments.userId', 'username profilePic')
            .sort({ createdAt: -1 })
            .limit(100);

        res.json({ posts });
    } catch (error) {
        console.error('Get feed error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete post
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.userId.toString() !== req.userId) {
            return res.status(403).json({ message: 'Unauthorized to delete this post' });
        }

        await Post.findByIdAndDelete(req.params.id);

        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Like/Unlike post
exports.toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const isLiked = post.likes.includes(req.userId);

        if (isLiked) {
            post.likes = post.likes.filter(id => id.toString() !== req.userId);
        } else {
            post.likes.push(req.userId);
        }

        await post.save();

        // Create notification for like
        if (!isLiked && post.userId.toString() !== req.userId) {
            const notification = new Notification({
                recipient: post.userId,
                sender: req.userId,
                type: 'like',
                post: post._id,
                text: 'liked your post'
            });
            await notification.save();

            const sender = await User.findById(req.userId).select('username');
            sendNotification(post.userId, {
                type: 'like',
                message: `${sender.username} liked your post`,
                postId: post._id
            });
        }

        res.json({
            message: isLiked ? 'Post unliked' : 'Post liked',
            isLiked: !isLiked,
            likesCount: post.likes.length
        });
    } catch (error) {
        console.error('Like/Unlike error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add comment
exports.addComment = async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || text.trim() === '') {
            return res.status(400).json({ message: 'Comment text is required' });
        }

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        post.comments.push({
            userId: req.userId,
            text: text.trim()
        });

        await post.save();
        await post.populate('comments.userId', 'username profilePic');

        // Create notification for comment
        if (post.userId.toString() !== req.userId) {
            const notification = new Notification({
                recipient: post.userId,
                sender: req.userId,
                type: 'comment',
                post: post._id,
                text: 'commented on your post'
            });
            await notification.save();

            const sender = await User.findById(req.userId).select('username');
            sendNotification(post.userId, {
                type: 'comment',
                message: `${sender.username} commented on your post`,
                postId: post._id
            });
        }

        res.status(201).json({
            message: 'Comment added successfully',
            comment: post.comments[post.comments.length - 1]
        });
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user posts
exports.getUserPosts = async (req, res) => {
    try {
        const posts = await Post.find({ userId: req.params.userId })
            .populate('userId', 'username profilePic')
            .sort({ createdAt: -1 });

        res.json({ posts });
    } catch (error) {
        console.error('Get user posts error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
