require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔄 Attempting to connect to MongoDB...');
console.log('URI:', process.env.MONGO_URI.split('@')[1] || 'URI hidden');

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Connection successful!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Connection failed:', err.message);
        process.exit(1);
    });

setTimeout(() => {
    console.error('⌛ Connection timed out after 10 seconds');
    process.exit(1);
}, 10000);
