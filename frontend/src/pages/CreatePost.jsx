import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Upload, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const CreatePost = () => {
    const [imageUrl, setImageUrl] = useState('');
    const [caption, setCaption] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { API_URL } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!imageUrl.trim()) {
            toast.error('Please provide an image URL');
            return;
        }

        setIsLoading(true);

        try {
            await axios.post(`${API_URL}/posts`, {
                imageUrl: imageUrl.trim(),
                caption: caption.trim()
            });
            toast.success('Post created successfully! 🎉');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create post');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-8"
            >
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-primary-100 rounded-full">
                        <Upload className="w-6 h-6 text-primary-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Create New Post</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Image URL Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Image URL
                        </label>
                        <div className="relative">
                            <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="url"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                className="input-field pl-11"
                                placeholder="https://example.com/image.jpg"
                                required
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Enter a direct link to your image
                        </p>
                    </div>

                    {/* Image Preview */}
                    {imageUrl && (
                        <div className="rounded-lg overflow-hidden border border-gray-200">
                            <img
                                src={imageUrl}
                                alt="Preview"
                                className="w-full max-h-96 object-cover"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/400x300?text=Invalid+Image+URL';
                                }}
                            />
                        </div>
                    )}

                    {/* Caption */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Caption (Optional)
                        </label>
                        <textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            className="input-field resize-none"
                            rows="4"
                            placeholder="Write a caption..."
                            maxLength={2200}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {caption.length}/2200 characters
                        </p>
                    </div>

                    {/* Submit Button */}
                    <div className="flex space-x-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Creating...' : 'Create Post'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default CreatePost;
