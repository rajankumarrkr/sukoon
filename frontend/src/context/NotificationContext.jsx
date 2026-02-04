import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { user, API_URL } = useAuth();
    const socket = useSocket();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const response = await axios.get(`${API_URL}/notifications`);
            const allNotifs = response.data.notifications;
            setNotifications(allNotifs);

            const generalCount = allNotifs.filter(n => !n.read && n.type !== 'message').length;
            const messagesCount = allNotifs.filter(n => !n.read && n.type === 'message').length;

            setUnreadCount(generalCount);
            setUnreadMessagesCount(messagesCount);
        } catch (error) {
            console.error('Fetch notifications error:', error);
        }
    };

    const markAllAsRead = async (type = null) => {
        try {
            await axios.put(`${API_URL}/notifications/mark-read`, { type });
            if (!type) {
                setUnreadCount(0);
                setUnreadMessagesCount(0);
            } else if (type === 'message') {
                setUnreadMessagesCount(0);
            } else {
                setUnreadCount(0);
            }
            await fetchNotifications();
        } catch (error) {
            console.error('Mark read notifications error:', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
        } else {
            setNotifications([]);
            setUnreadCount(0);
            setUnreadMessagesCount(0);
        }
    }, [user]);

    useEffect(() => {
        if (!socket || !user) return;

        const handleNotification = (data) => {
            if (data.sender?._id === user.id) return;

            setNotifications(prev => [data, ...prev]);
            if (data.type === 'message') {
                setUnreadMessagesCount(prev => prev + 1);
            } else {
                setUnreadCount(prev => prev + 1);
            }
        };

        socket.on('notification', handleNotification);
        return () => socket.off('notification', handleNotification);
    }, [socket, user]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            unreadMessagesCount,
            fetchNotifications,
            markAllAsRead
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
