import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Send, User as UserIcon, Loader2, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Chat = () => {
    const { user: currentUser, API_URL } = useAuth();
    const socket = useSocket();
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (activeConversation) {
            fetchMessages(activeConversation._id);
        }
    }, [activeConversation]);

    useEffect(() => {
        if (socket) {
            socket.on('receive_message', (message) => {
                if (activeConversation && message.conversationId === activeConversation._id) {
                    setMessages(prev => [...prev, message]);
                }
                fetchConversations(); // Update last message in list
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
            setMessages(prev => [...prev, sentMessage]);
            setNewMessage('');

            socket?.emit('send_message', {
                recipientId: recipient._id,
                message: sentMessage
            });

            fetchConversations();
        } catch (error) {
            console.error('Send message error:', error);
        }
    };

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] bg-white rounded-2xl shadow-xl overflow-hidden flex border border-gray-100">
            {/* Conversations List */}
            <div className={`w-full md:w-80 border-r border-gray-100 flex flex-col ${activeConversation && isMobileView ? 'hidden' : 'flex'}`}>
                <div className="p-6 border-b border-gray-100">
                    <h1 className="text-xl font-bold text-gray-800">Messages</h1>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.map((conv) => {
                        const otherUser = conv.participants.find(p => p._id !== currentUser.id);
                        return (
                            <button
                                key={conv._id}
                                onClick={() => {
                                    setActiveConversation(conv);
                                    setIsMobileView(true);
                                }}
                                className={`w-full flex items-center space-x-4 p-4 hover:bg-gray-50 transition-colors ${activeConversation?._id === conv._id ? 'bg-primary-50 border-r-4 border-primary-500' : ''}`}
                            >
                                <img
                                    src={otherUser?.profilePic || 'https://via.placeholder.com/40'}
                                    alt={otherUser?.username}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                />
                                <div className="text-left flex-1 min-w-0">
                                    <p className="font-bold text-gray-800 truncate">{otherUser?.name || otherUser?.username}</p>
                                    <p className="text-sm text-gray-500 truncate">
                                        {conv.lastMessage?.text || 'Start a conversation'}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Chat Window */}
            <div className={`flex-1 flex flex-col bg-gray-50/30 ${!activeConversation && isMobileView ? 'hidden' : 'flex'}`}>
                {activeConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 bg-white border-b border-gray-100 flex items-center space-x-4">
                            <button onClick={() => setIsMobileView(false)} className="md:hidden p-2 hover:bg-gray-100 rounded-full">
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <img
                                src={activeConversation.participants.find(p => p._id !== currentUser.id)?.profilePic || 'https://via.placeholder.com/40'}
                                alt="User"
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <h2 className="font-bold text-gray-800">
                                {activeConversation.participants.find(p => p._id !== currentUser.id)?.name}
                            </h2>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {isLoading ? (
                                <div className="flex justify-center items-center h-full">
                                    <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div
                                        key={msg._id}
                                        className={`flex ${msg.sender === currentUser.id ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[70%] px-4 py-2 rounded-2xl ${msg.sender === currentUser.id
                                                    ? 'bg-primary-600 text-white rounded-tr-none'
                                                    : 'bg-white text-gray-800 shadow-sm rounded-tl-none'
                                                }`}
                                        >
                                            <p>{msg.text}</p>
                                            <p className={`text-[10px] mt-1 ${msg.sender === currentUser.id ? 'text-primary-100' : 'text-gray-400'}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex items-center space-x-4">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-lg shadow-primary-200"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <MessageCircle size={64} className="mb-4 opacity-10" />
                        <p className="text-lg font-medium">Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
