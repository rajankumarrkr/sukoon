import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { X, Send, Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const ShareSheet = ({ item, type, onClose }) => {
    const { user: currentUser, API_URL } = useAuth();
    const socket = useSocket();
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sendingId, setSendingId] = useState(null);

    useEffect(() => {
        fetchFriends();
    }, []);

    const fetchFriends = async () => {
        try {
            // Get current user's following list as "friends" to share with
            const response = await axios.get(`${API_URL}/users/${currentUser.id}`);
            setFriends(response.data.user.following || []);
        } catch (error) {
            console.error('Fetch friends error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async (friendId) => {
        setSendingId(friendId);
        try {
            const shareUrl = type === 'reel'
                ? `${window.location.origin}/reels?id=${item._id}`
                : `${window.location.origin}/post/${item._id}`;

            const messageText = `Check out this ${type}: ${shareUrl}`;
            const response = await axios.post(`${API_URL}/chat/send`, {
                recipientId: friendId,
                text: messageText,
                postId: type === 'post' ? item._id : undefined,
                reelId: type === 'reel' ? item._id : undefined
            });

            socket?.emit('send_message', {
                recipientId: friendId,
                message: response.data.message
            });

            toast.success(`Shared ${type} to friend! ✨`);
        } catch (error) {
            toast.error('Failed to share');
        } finally {
            setSendingId(null);
        }
    };

    const filteredFriends = friends.filter(f =>
        f.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-end justify-center px-4 pb-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Share</h3>
                        <p className="text-xs text-gray-400 mt-1">Send this {type} to your friends</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                {/* Search */}
                <div className="px-6 py-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search friends..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Friends List */}
                <div className="max-h-96 overflow-y-auto px-6 pb-8 space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                        </div>
                    ) : filteredFriends.length > 0 ? (
                        filteredFriends.map((friend) => (
                            <div key={friend._id} className="flex items-center justify-between group">
                                <div className="flex items-center space-x-4">
                                    <img
                                        src={friend.profilePic || 'https://via.placeholder.com/40'}
                                        alt={friend.username}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-primary-50"
                                    />
                                    <div>
                                        <p className="font-bold text-gray-800">@{friend.username}</p>
                                        <p className="text-xs text-gray-400">{friend.name}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleShare(friend._id)}
                                    disabled={sendingId === friend._id}
                                    className="p-3 bg-primary-50 text-primary-600 rounded-2xl hover:bg-primary-600 hover:text-white transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {sendingId === friend._id ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <p>No followers found to share with</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ShareSheet;
