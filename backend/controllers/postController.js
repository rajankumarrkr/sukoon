const Post = require('../models/Post');
const User = require('../models/User');

// Create new post
exports.createPost = async (req, res) => {
    try {
        const { imageUrl, caption } = req.body;

        if (!imageUrl) {
            return res.status(400).json({ message: 'Image URL is required' });
        }

        const post = new Post({
            userId: req.userId,
            imageUrl,
            caption: caption || ''
        });

        await post.save();
        await post.populate('userId', 'username profilePic');

        res.status(201).json({ message: 'Post created successfully', post });
    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get feed (posts from followed users)
exports.getFeed = async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get posts from followed users and own posts
        const posts = await Post.find({
            userId: { $in: [...user.following, req.userId] }
        })
            .populate('userId', 'username profilePic')
            .populate('comments.userId', 'username profilePic')
            .sort({ createdAt: -1 })
            .limit(50);

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
