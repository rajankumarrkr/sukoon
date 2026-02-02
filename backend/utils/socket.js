const socketIO = require('socket.io');

let io;
const userSockets = new Map(); // userId -> socketId

const initSocket = (server) => {
    io = socketIO(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log('⚡ New client connected:', socket.id);

        socket.on('join', (userId) => {
            if (userId) {
                userSockets.set(userId, socket.id);
                console.log(`👤 User ${userId} associated with socket ${socket.id}`);
            }
        });

        socket.on('send_message', (data) => {
            const { recipientId, message } = data;
            const recipientSocketId = userSockets.get(recipientId);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('receive_message', message);
            }
        });

        socket.on('disconnect', () => {
            for (const [userId, socketId] of userSockets.entries()) {
                if (socketId === socket.id) {
                    userSockets.delete(userId);
                    break;
                }
            }
            console.log('❌ Client disconnected');
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

const sendNotification = (userId, data) => {
    const socketId = userSockets.get(userId.toString());
    if (socketId) {
        io.to(socketId).emit('notification', data);
    }
};

module.exports = { initSocket, getIO, sendNotification };
