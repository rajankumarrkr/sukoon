const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const Reel = require('./models/Reel');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        // 1. Create a Sukoon Admin/Official Account
        let officialUser = await User.findOne({ email: 'official@sukoon.com' });
        if (!officialUser) {
            const hashedPassword = await bcrypt.hash('sukoon123', 10);
            officialUser = new User({
                username: 'sukoon_official',
                email: 'official@sukoon.com',
                password: hashedPassword,
                name: 'Sukoon Official',
                bio: 'The heartbeat of Sukoon. Enjoy the best content here.',
                profilePic: 'https://res.cloudinary.com/demo/image/upload/v1/avatar-placeholder.png'
            });
            await officialUser.save();
            console.log('Official user created');
        }

        // 2. Clear existing official content (optional, or just add more)
        // await Post.deleteMany({ userId: officialUser._id });
        // await Reel.deleteMany({ userId: officialUser._id });

        // 3. Generate 50 Posts
        const posts = [];
        for (let i = 1; i <= 50; i++) {
            posts.push({
                userId: officialUser._id,
                imageUrl: `https://picsum.photos/seed/sukoon${i}/1080/1080`,
                caption: `Official Sukoon Post #${i} - Finding peace in nature. #peace #sukoon`,
                likes: [],
                comments: []
            });
        }
        await Post.insertMany(posts);
        console.log('50 posts created');

        // 4. Generate 50 Reels
        const reels = [];
        // Using sample public video URLs for reels
        const videoUrls = [
            'https://res.cloudinary.com/demo/video/upload/v1/dog.mp4',
            'https://res.cloudinary.com/demo/video/upload/v1/sea_turtle.mp4'
        ];

        for (let i = 1; i <= 50; i++) {
            reels.push({
                userId: officialUser._id,
                videoUrl: videoUrls[i % videoUrls.length],
                caption: `Official Sukoon Reel #${i} - Chill vibes only. #reels #peace`,
                likes: [],
                comments: []
            });
        }
        await Reel.insertMany(reels);
        console.log('50 reels created');

        console.log('Seeding completed successfully! 🎉');
        process.exit();
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedData();
