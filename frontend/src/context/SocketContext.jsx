import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user, token } = useAuth();
    const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

    useEffect(() => {
        if (user && token) {
            const newSocket = io(SOCKET_URL, {
                query: { token }
            });

            newSocket.on('connect', () => {
                console.log('Connected to socket server');
                newSocket.emit('join', user.id);
            });

            newSocket.on('notification', (data) => {
                // Don't show toast if it's our own action (safeguard)
                if (data.sender?._id === user.id) return;

                const isMissedCall = data.type === 'missed_call';
                const senderName = data.sender?.username || 'Someone';
                const messageSnippet = data.text || (isMissedCall ? 'Missed call' : 'sent you a message');

                toast((t) => (
                    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 ${isMissedCall ? 'border-l-4 border-red-500' : ''}`}>
                        <div className="flex-1 w-0 p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 pt-0.5">
                                    <img
                                        className="h-10 w-10 rounded-full"
                                        src={data.sender?.profilePic || 'https://via.placeholder.com/40'}
                                        alt=""
                                    />
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className={`text-sm font-bold ${isMissedCall ? 'text-red-600' : 'text-gray-900'}`}>
                                        {isMissedCall ? 'Missed Call' : senderName}
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500 truncate">
                                        {isMissedCall ? `You have a missed call from ${senderName}` : messageSnippet}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex border-l border-gray-200">
                            <button
                                onClick={() => toast.dismiss(t.id)}
                                className={`w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium focus:outline-none ${isMissedCall ? 'text-red-600 hover:text-red-500' : 'text-primary-600 hover:text-primary-500'}`}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                ), { duration: isMissedCall ? 6000 : 4000, position: 'top-right' });
            });

            setSocket(newSocket);

            return () => newSocket.close();
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [user, token]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
