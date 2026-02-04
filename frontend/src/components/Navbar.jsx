import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Home, PlusSquare, User, MessageCircle, Film, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
    const { user } = useAuth();
    const { unreadMessagesCount } = useNotifications();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { to: '/', icon: Home, label: 'Home' },
        { to: '/search', icon: Search, label: 'Search' },
        { to: '/create', icon: PlusSquare, label: 'Create' },
        { to: '/reels', icon: Film, label: 'Reels' },
        { to: `/profile/${user?.id}`, icon: User, label: 'Profile' }
    ];

    return (
        <motion.nav
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-gray-100 pb-safe shadow-2xl md:pb-0"
        >
            <div className="max-w-xl mx-auto px-4 py-2">
                <div className="flex justify-between items-center h-14">
                    {navLinks.map(({ to, icon: Icon, badge }) => (
                        <Link
                            key={to}
                            to={to}
                            className={`relative flex flex-col items-center justify-center w-full py-1 transition-all duration-300 ${isActive(to)
                                ? 'text-primary-600'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <motion.div
                                whileTap={{ scale: 0.8 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                                className="relative"
                            >
                                <Icon
                                    className={`w-7 h-7 ${isActive(to) ? 'fill-primary-50/50 stroke-[2.5px]' : 'stroke-2'}`}
                                />
                                {badge > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-bold"
                                    >
                                        {badge}
                                    </motion.span>
                                )}
                            </motion.div>

                            {isActive(to) && (
                                <motion.div
                                    layoutId="nav-dot"
                                    className="absolute -bottom-1 w-1 h-1 bg-primary-600 rounded-full"
                                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                />
                            )}
                        </Link>
                    ))}
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;
