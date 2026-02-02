import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, PlusSquare, User, LogOut, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="sticky top-0 z-50 glassmorphism border-b border-gray-200"
        >
            <div className="max-w-6xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <Heart className="w-8 h-8 text-primary-600 fill-primary-600" />
                        <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                            Sukoon
                        </span>
                    </Link>

                    {/* Navigation */}
                    <div className="flex items-center space-x-6">
                        <Link
                            to="/"
                            className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                        >
                            <Home className="w-6 h-6" />
                            <span className="hidden sm:inline font-medium">Home</span>
                        </Link>

                        <Link
                            to="/create"
                            className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                        >
                            <PlusSquare className="w-6 h-6" />
                            <span className="hidden sm:inline font-medium">Create</span>
                        </Link>

                        <Link
                            to={`/profile/${user?.id}`}
                            className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                        >
                            <User className="w-6 h-6" />
                            <span className="hidden sm:inline font-medium">Profile</span>
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
                        >
                            <LogOut className="w-6 h-6" />
                            <span className="hidden sm:inline font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;
