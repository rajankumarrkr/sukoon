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
                toast(data.message || 'New notification! 🔔', {
                    icon: '🔔',
                    duration: 4000
                });
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
