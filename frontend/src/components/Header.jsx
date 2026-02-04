import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, MessageCircle } from 'lucide-react';

const Header = () => {
    const { user } = useAuth();
    const { notifications, unreadCount, unreadMessagesCount, markAllAsRead } = useNotifications();
    const [showNotifications, setShowNotifications] = useState(false);

    if (!user) return null;

    return (
        <motion.header
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 py-3"
        >
            <Link to="/" className="flex items-center space-x-2">
                <span className="text-2xl font-black bg-clip-text text-transparent premium-gradient tracking-tight">
                    SUKOON
                </span>
            </Link>

            <div className="flex items-center space-x-2">
                {/* Notifications Button */}
                <div className="relative">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                            setShowNotifications(!showNotifications);
                            if (!showNotifications) markAllAsRead();
                        }}
                        className="p-2 text-gray-600 hover:text-primary-600 transition-colors relative"
                    >
                        <Bell className="w-6 h-6" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">
                                {unreadCount}
                            </span>
                        )}
                    </motion.button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[60]"
                            >
                                <div className="p-4 border-b border-gray-100 font-bold text-gray-800">
                                    Notifications
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {notifications.length > 0 ? (
                                        notifications.map((notif) => (
                                            <div key={notif._id} className={`p-4 hover:bg-gray-50 flex items-start space-x-3 border-b border-gray-50 last:border-0 ${!notif.read ? 'bg-primary-50/30' : ''}`}>
                                                <img src={notif.sender?.profilePic || 'https://via.placeholder.com/32'} alt="User" className="w-8 h-8 rounded-full border border-gray-100" />
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-800">
                                                        <span className="font-bold">{notif.sender?.username}</span> {notif.text}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {new Date(notif.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                {notif.post && (
                                                    <img src={notif.post.imageUrl} alt="Post" className="w-8 h-8 rounded-md object-cover" />
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-gray-400 text-sm">
                                            No notifications yet
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <Link to="/chat" className="relative group">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-gray-600 hover:text-primary-600 transition-colors relative"
                    >
                        <MessageCircle className="w-6 h-6" />
                        {unreadMessagesCount > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-1 right-1 w-4 h-4 bg-primary-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-bold"
                            >
                                {unreadMessagesCount}
                            </motion.span>
                        )}
                    </motion.button>
                </Link>
            </div>
        </motion.header>
    );
};

export default Header;
