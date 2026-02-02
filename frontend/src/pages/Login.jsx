import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
    const [formData, setFormData] = useState({
        emailOrUsername: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await login(formData.emailOrUsername, formData.password);
            toast.success('Welcome back to Sukoon! ✨');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/assets/background.png')" }}
        >
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="glass-card w-full max-w-md p-8 relative z-10"
            >
                <div className="text-center mb-8">
                    <motion.img
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        src="/assets/logo.png"
                        alt="Sukoon Logo"
                        className="w-24 h-24 mx-auto mb-4 drop-shadow-2xl rounded-2xl"
                    />
                    <h1 className="text-4xl font-black bg-clip-text text-transparent premium-gradient mb-2">
                        SUKOON
                    </h1>
                    <p className="text-gray-600 font-medium italic">Find your inner peace in social.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 px-1">
                            Email or Username
                        </label>
                        <div className="relative group">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                            <input
                                type="text"
                                name="emailOrUsername"
                                value={formData.emailOrUsername}
                                onChange={handleChange}
                                className="input-field pl-11"
                                placeholder="Enter your email or username"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 px-1">
                            Password
                        </label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="input-field pl-11"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full flex items-center justify-center space-x-2 py-4"
                    >
                        {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                        <span className="text-lg">{isLoading ? 'Signing In...' : 'Sign In'}</span>
                    </button>
                </form>

                <p className="text-center mt-8 text-gray-600 font-medium">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary-600 hover:text-primary-700 font-bold underline decoration-2 underline-offset-4">
                        Register
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
