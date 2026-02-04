import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useNotifications } from '../context/NotificationContext';
import { Send, User as UserIcon, Loader2, ChevronLeft, Film, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Chat = () => {
    const { user: currentUser, API_URL } = useAuth();
    const socket = useSocket();
    const { markAllAsRead } = useNotifications();
    const location = useLocation();
    const [conversations, setConversations] = useState([]);

    useEffect(() => {
        markAllAsRead('message');
    }, []);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showChatWindow, setShowChatWindow] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const initChat = async () => {
            const fetchedConvs = await fetchConversations();

            const selectedUser = location.state?.selectedUser;
            if (selectedUser && fetchedConvs) {
                const existingConv = fetchedConvs.find(conv =>
                    conv.participants.some(p => p._id === selectedUser._id)
                );

                if (existingConv) {
                    setActiveConversation(existingConv);
                } else {
                    const tempConv = {
                        _id: 'temp-' + Date.now(),
                        participants: [
                            { _id: currentUser.id, username: currentUser.username },
                            { _id: selectedUser._id, username: selectedUser.username, name: selectedUser.name, profilePic: selectedUser.profilePic }
                        ],
                        lastMessage: null,
                        isTemp: true
                    };
                    setConversations(prev => [tempConv, ...prev]);
                    setActiveConversation(tempConv);
                }
                setShowChatWindow(true);
            }
        };
        initChat();
    }, [location.state]);

    useEffect(() => {
        if (activeConversation && !activeConversation.isTemp) {
            fetchMessages(activeConversation._id);
        } else {
            setMessages([]);
        }
    }, [activeConversation]);

    useEffect(() => {
        if (socket) {
            socket.on('receive_message', (message) => {
                if (activeConversation && message.conversationId === activeConversation._id) {
                    setMessages(prev => [...prev, message]);
                }
                fetchConversations();
            });
        }
        return () => socket?.off('receive_message');
    }, [socket, activeConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversations = async () => {
        try {
            const response = await axios.get(`${API_URL}/chat/conversations`);
            setConversations(response.data.conversations);
            return response.data.conversations;
        } catch (error) {
            console.error('Fetch conversations error:', error);
        }
    };

    const fetchMessages = async (id) => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_URL}/chat/messages/${id}`);
            setMessages(response.data.messages);
        } catch (error) {
            console.error('Fetch messages error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation) return;

        const recipient = activeConversation.participants.find(p => p._id !== currentUser.id);

        try {
            const response = await axios.post(`${API_URL}/chat/send`, {
                recipientId: recipient._id,
                text: newMessage.trim()
            });

            const sentMessage = response.data.message;
            const conversationId = response.data.conversationId;

            setMessages(prev => [...prev, sentMessage]);
            setNewMessage('');

            if (activeConversation.isTemp) {
                const refreshedConvs = await fetchConversations();
                const realConv = refreshedConvs.find(c => c._id === conversationId);
                if (realConv) setActiveConversation(realConv);
            }

            socket?.emit('send_message', {
                recipientId: recipient._id,
                message: sentMessage
            });

            if (!activeConversation.isTemp) fetchConversations();
        } catch (error) {
            console.error('Send message error:', error);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto h-[calc(100dvh-160px)] md:h-[calc(100vh-140px)] bg-white md:rounded-3xl shadow-xl overflow-hidden flex border border-gray-100 px-0 md:px-0">
            {/* Conversations List */}
            <div className={`w-full md:w-80 border-r border-gray-100 flex flex-col flex-shrink-0 ${showChatWindow ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                    <h1 className="text-lg md:text-xl font-bold text-gray-800">Messages</h1>
                    <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-primary-500" />
                </div>
                <div className="flex-1 overflow-y-auto min-h-0">
                    {conversations.length > 0 ? (
                        conversations.map((conv) => {
                            const otherUser = conv.participants.find(p => p._id !== currentUser.id);
                            return (
                                <button
                                    key={conv._id}
                                    onClick={() => {
                                        setActiveConversation(conv);
                                        setShowChatWindow(true);
                                    }}
                                    className={`w-full flex items-center space-x-3 md:space-x-4 p-3 md:p-4 hover:bg-gray-50 transition-colors ${activeConversation?._id === conv._id ? 'bg-primary-50 border-r-4 border-primary-500' : ''}`}
                                >
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={otherUser?.profilePic || 'https://via.placeholder.com/40'}
                                            alt={otherUser?.username}
                                            className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                        />
                                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                    </div>
                                    <div className="text-left flex-1 min-w-0">
                                        <p className="font-bold text-gray-800 truncate text-sm md:text-base">{otherUser?.name || otherUser?.username}</p>
                                        <p className="text-xs md:text-sm text-gray-500 truncate font-medium">
                                            {conv.lastMessage?.text || 'Start a conversation'}
                                        </p>
                                    </div>
                                </button>
                            );
                        })
                    ) : (
                        <div className="p-8 text-center text-gray-400">
                            <p className="text-xs md:text-sm">No messages yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <div className={`flex-1 flex flex-col bg-gray-50/30 min-w-0 ${!showChatWindow ? 'hidden md:flex' : 'flex'}`}>
                {activeConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-3 md:p-4 bg-white border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center space-x-3 md:space-x-4 min-w-0">
                                <button onClick={() => setShowChatWindow(false)} className="md:hidden p-1.5 hover:bg-gray-100 rounded-full flex-shrink-0">
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <div className="relative flex-shrink-0">
                                    <img
                                        src={activeConversation.participants.find(p => p._id !== currentUser.id)?.profilePic || 'https://via.placeholder.com/40'}
                                        alt="User"
                                        className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border border-gray-100"
                                    />
                                    <div className="absolute bottom-0 right-0 w-2 h-2 md:w-2.5 md:h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                                </div>
                                <div className="min-w-0">
                                    <h2 className="font-bold text-gray-800 leading-none truncate text-sm md:text-base">
                                        {activeConversation.participants.find(p => p._id !== currentUser.id)?.name || activeConversation.participants.find(p => p._id !== currentUser.id)?.username}
                                    </h2>
                                    <p className="text-[9px] md:text-[10px] text-green-500 font-bold mt-0.5 md:mt-1">Active now</p>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 bg-white/50 min-h-0">
                            {isLoading ? (
                                <div className="flex justify-center items-center h-full">
                                    <Loader2 className="w-7 h-7 md:w-8 md:h-8 text-primary-600 animate-spin" />
                                </div>
                            ) : messages.length > 0 ? (
                                messages.map((msg) => (
                                    <div
                                        key={msg._id}
                                        className={`flex ${msg.sender === currentUser.id ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[85%] md:max-w-[70%] px-3 md:px-4 py-2 md:py-2.5 rounded-2xl shadow-sm ${msg.sender === currentUser.id
                                                ? 'bg-primary-600 text-white rounded-tr-none'
                                                : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                                                }`}
                                        >
                                            {/* Shared Post Preview */}
                                            {msg.postId && (
                                                <Link to={`/`} className="block mb-2 overflow-hidden rounded-xl bg-black/5">
                                                    <img
                                                        src={msg.postId.imageUrl}
                                                        alt="Post"
                                                        className="w-full aspect-square object-cover"
                                                    />
                                                    <div className="p-2 text-[10px] md:text-xs">
                                                        <p className={`font-bold truncate ${msg.sender === currentUser.id ? 'text-white' : 'text-gray-800'}`}>
                                                            Post by @{msg.postId.userId?.username || 'user'}
                                                        </p>
                                                    </div>
                                                </Link>
                                            )}

                                            {/* Shared Reel Preview */}
                                            {msg.reelId && (
                                                <Link to={`/reels`} className="block mb-2 overflow-hidden rounded-xl bg-black/10 relative">
                                                    <div className="aspect-[9/16] bg-black flex items-center justify-center">
                                                        <video
                                                            src={msg.reelId.videoUrl}
                                                            className="h-full w-full object-cover opacity-80"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="p-2 md:p-3 bg-white/20 backdrop-blur-md rounded-full">
                                                                <Film className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="p-2 text-[9px] md:text-[10px] bg-black/40 absolute bottom-0 inset-x-0">
                                                        <p className="font-bold text-white truncate">
                                                            Reel by @{msg.reelId.userId?.username || 'user'}
                                                        </p>
                                                    </div>
                                                </Link>
                                            )}

                                            <p className="text-xs md:text-base leading-relaxed break-words">{msg.text}</p>
                                            <p className={`text-[8px] md:text-[9px] mt-1 font-bold uppercase ${msg.sender === currentUser.id ? 'text-primary-100' : 'text-gray-400'}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    <MessageCircle size={28} className="opacity-20 mb-2" />
                                    <p className="font-medium text-xs md:text-base">No messages yet. Say hi! 👋</p>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className="p-2 md:p-4 bg-white border-t border-gray-100 flex items-center space-x-2 md:space-x-3 flex-shrink-0 flex-nowrap overflow-hidden">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 w-0 min-w-0 px-3 md:px-4 py-2 md:py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-100 outline-none text-sm md:text-base"
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="flex-shrink-0 p-2.5 md:p-3.5 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-primary-200"
                            >
                                <Send className="w-5 h-5 md:w-6 md:h-6" />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center min-h-0">
                        <div className="w-16 h-16 md:w-24 md:h-24 bg-primary-50 rounded-full flex items-center justify-center mb-6">
                            <MessageCircle size={32} className="text-primary-200" />
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">Your Messages</h3>
                        <p className="max-w-xs text-[10px] md:text-sm text-gray-500 font-medium">Select a friend to start a conversation and share the sukoon.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
