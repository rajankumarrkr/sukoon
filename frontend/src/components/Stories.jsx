import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Stories = ({ onStoryClick }) => {
    const { user: currentUser, API_URL } = useAuth();
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchStories();
    }, []);

    const fetchStories = async () => {
        try {
            const response = await axios.get(`${API_URL}/stories`);
            setStories(response.data.stories);
        } catch (error) {
            console.error('Fetch stories error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            await axios.post(`${API_URL}/stories`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Story posted! ✨');
            fetchStories();
        } catch (error) {
            toast.error('Failed to post story');
        } finally {
            setUploading(false);
        }
    };

    if (loading && stories.length === 0) {
        return (
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide px-4 py-2 md:px-0">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex-shrink-0 w-16 h-16 rounded-full bg-gray-100 animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide mb-6 px-4 py-2 md:px-0">
            {/* Add Story */}
            <div className="flex flex-col items-center space-y-1 flex-shrink-0">
                <label className="relative cursor-pointer group">
                    <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 group-hover:border-primary-500 transition-colors">
                        {uploading ? <Loader2 className="w-6 h-6 text-primary-500 animate-spin" /> : <Plus className="w-6 h-6 text-gray-400 group-hover:text-primary-500" />}
                    </div>
                </label>
                <span className="text-xs text-gray-500">Your Story</span>
            </div>

            {/* User Stories */}
            {stories.map((storyGroup) => (
                <button
                    key={storyGroup.user._id}
                    onClick={() => onStoryClick(storyGroup)}
                    className="flex flex-col items-center space-y-1 flex-shrink-0 focus:outline-none"
                >
                    <div className="p-[2px] rounded-full bg-gradient-to-tr from-yellow-400 to-fuchsia-600">
                        <div className="p-[2px] rounded-full bg-white">
                            <img
                                src={storyGroup.user.profilePic || 'https://via.placeholder.com/60'}
                                alt={storyGroup.user.username}
                                className="w-14 h-14 rounded-full object-cover"
                            />
                        </div>
                    </div>
                    <span className="text-xs text-gray-700 truncate w-16 text-center">
                        {storyGroup.user.username}
                    </span>
                </button>
            ))}
        </div>
    );
};

export default Stories;
