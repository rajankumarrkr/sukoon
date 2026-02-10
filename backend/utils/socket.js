const socketIO = require('socket.io');
const Notification = require('../models/Notification');

let io;
const userSockets = new Map(); // userId -> socketId
const callAttempts = new Map(); // recipientId -> { callerId, callerName, callType, timeout }

const createMissedCallNotification = async (recipientId, callerId, callerName, callType) => {
    try {
        const notification = new Notification({
            recipient: recipientId,
            sender: callerId,
            type: 'missed_call',
            text: `Missed ${callType} call from ${callerName}`
        });
        await notification.save();
        await notification.populate('sender', 'username profilePic');

        const socketId = userSockets.get(recipientId.toString());
        if (socketId && io) {
            io.to(socketId).emit('notification', notification);
        }
    } catch (error) {
        console.error('Error creating missed call notification:', error);
    }
};

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

        // WebRTC Signaling for Calls
        socket.on('call_user', (data) => {
            const { userToCall, signalData, from, name, callType } = data;
            const recipientSocketId = userSockets.get(userToCall);

            // Store call attempt
            const timeout = setTimeout(() => {
                const attempt = callAttempts.get(userToCall);
                if (attempt && attempt.callerId === from) {
                    createMissedCallNotification(userToCall, from, name, callType);
                    callAttempts.delete(userToCall);
                    if (recipientSocketId) {
                        io.to(recipientSocketId).emit('call_ended');
                    }
                }
            }, 30000); // 30 seconds timeout

            callAttempts.set(userToCall, { callerId: from, callerName: name, callType, timeout });

            if (recipientSocketId) {
                io.to(recipientSocketId).emit('incoming_call', {
                    signal: signalData,
                    from,
                    name,
                    callType
                });
            }
        });

        socket.on('answer_call', (data) => {
            const { to, signal } = data;
            const recipientSocketId = userSockets.get(to);

            // Clear call attempt as it's answered
            const attempt = callAttempts.get(socket.userId || data.fromUser); // We need a way to identify current user
            // Actually, 'to' is the caller. The recipient (current socket) is the one answering.
            // Let's find the attempt where this socket's user is the recipient.
            for (const [recipientId, attempt] of callAttempts.entries()) {
                if (attempt.callerId === to) {
                    clearTimeout(attempt.timeout);
                    callAttempts.delete(recipientId);
                    break;
                }
            }

            if (recipientSocketId) {
                io.to(recipientSocketId).emit('call_accepted', signal);
            }
        });

        socket.on('reject_call', (data) => {
            const { to } = data;
            const recipientSocketId = userSockets.get(to);

            // Clear attempt and create missed call notification
            for (const [recipientId, attempt] of callAttempts.entries()) {
                if (attempt.callerId === to) {
                    clearTimeout(attempt.timeout);
                    createMissedCallNotification(recipientId, attempt.callerId, attempt.callerName, attempt.callType);
                    callAttempts.delete(recipientId);
                    break;
                }
            }

            if (recipientSocketId) {
                io.to(recipientSocketId).emit('call_rejected');
            }
        });

        socket.on('end_call', (data) => {
            const { to } = data;
            const recipientSocketId = userSockets.get(to);

            // If caller ends before answer, it's a missed call
            const attempt = callAttempts.get(to);
            if (attempt) {
                // This means the 'to' user was being called. 
                // But wait, end_call can be from either side.
                // If it's from the caller (the one who initiated), and it's still in callAttempts, it's missed.
            }

            // Simpler: just check if there's an active attempt related to these two users
            for (const [recipientId, attempt] of callAttempts.entries()) {
                if ((recipientId === to) || (attempt.callerId === to)) {
                    clearTimeout(attempt.timeout);
                    if (recipientId !== to) { // Caller canceled
                        createMissedCallNotification(recipientId, attempt.callerId, attempt.callerName, attempt.callType);
                    }
                    callAttempts.delete(recipientId);
                    break;
                }
            }

            if (recipientSocketId) {
                io.to(recipientSocketId).emit('call_ended');
            }
        });

        socket.on('ice_candidate', (data) => {
            const { to, candidate } = data;
            const recipientSocketId = userSockets.get(to);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('ice_candidate', candidate);
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
