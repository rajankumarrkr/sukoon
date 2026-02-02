import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const CreatePost = () => {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [caption, setCaption] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { API_URL } = useAuth();
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            toast.error('Please select an image to post');
            return;
        }

        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('caption', caption.trim());

            await axios.post(`${API_URL}/posts`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success('Post created successfully! 🎉');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create post');
            console.error('Create post error:', error);
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
                    {/* File Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Image
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                                id="fileInput"
                                required
                            />
                            <label
                                htmlFor="fileInput"
                                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <ImageIcon className="w-12 h-12 text-gray-400 mb-3" />
                                        <p className="text-sm text-gray-500">
                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-500">PNG, JPG or JPEG (Max 5MB)</p>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>

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
                            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                            <span>{isLoading ? 'Creating...' : 'Create Post'}</span>
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
