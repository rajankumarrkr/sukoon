const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    videoUrl: {
        type: String,
        required: true
    },
    caption: String,
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: String,
        createdAt: { type: Date, default: Date.now }
    }],
    views: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Reel', reelSchema);
