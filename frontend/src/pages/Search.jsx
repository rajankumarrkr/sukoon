import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Search as SearchIcon, Loader2, UserPlus, UserMinus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Search = () => {
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { API_URL, user: currentUser } = useAuth();

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.trim()) {
                handleSearch();
            } else {
                setUsers([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleSearch = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_URL}/users/search`, {
                params: { query }
            });
            setUsers(response.data.users);
        } catch (error) {
            console.error('Search error:', error);
            toast.error('Failed to search users');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Search Users</h1>
                <div className="relative">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by username or name..."
                        className="input-field pl-12 py-4 text-lg"
                        autoFocus
                    />
                </div>
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
                    </div>
                ) : users.length === 0 && query.trim() ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow">
                        <p className="text-gray-500">No users found matching "{query}"</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {users.map((user, index) => (
                            <motion.div
                                key={user._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white p-4 rounded-xl shadow hover:shadow-md transition-shadow flex items-center justify-between"
                            >
                                <Link
                                    to={`/profile/${user._id}`}
                                    className="flex items-center space-x-4 flex-1"
                                >
                                    <img
                                        src={user.profilePic || 'https://via.placeholder.com/50'}
                                        alt={user.username}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-primary-100"
                                    />
                                    <div>
                                        <p className="font-semibold text-gray-800">@{user.username}</p>
                                        <p className="text-sm text-gray-500">{user.name}</p>
                                    </div>
                                </Link>
                                <Link
                                    to={`/profile/${user._id}`}
                                    className="px-4 py-2 text-sm font-semibold text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                                >
                                    View Profile
                                </Link>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}

                {!query.trim() && !isLoading && (
                    <div className="text-center py-12 text-gray-400">
                        <SearchIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p>Search for friends and other users by their username or name</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
