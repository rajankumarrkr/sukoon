import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Upload, Film, Loader2, X, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const CreateReel = () => {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [caption, setCaption] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { API_URL } = useAuth();
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (!selectedFile.type.startsWith('video/')) {
                toast.error('Please select a video file');
                return;
            }
            if (selectedFile.size > 50 * 1024 * 1024) { // 50MB limit
                toast.error('Video size should be less than 50MB');
                return;
            }
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            toast.error('Please select a video for your reel');
            return;
        }

        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('video', file);
            formData.append('caption', caption.trim());

            await axios.post(`${API_URL}/reels`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success('Reel created successfully! 🎬');
            navigate('/reels');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create reel');
            console.error('Create reel error:', error);
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
                <div className="flex flex-col space-y-4 mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-primary-100 rounded-full">
                                <Film className="w-6 h-6 text-primary-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-800">Create New</h1>
                        </div>
                    </div>

                    <div className="flex p-1 bg-gray-100 rounded-xl">
                        <button
                            onClick={() => navigate('/create')}
                            className="flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-gray-500 font-semibold hover:text-gray-700 transition-all"
                        >
                            <ImageIcon className="w-4 h-4" />
                            <span>Photo Post</span>
                        </button>
                        <button
                            className="flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg bg-white shadow-sm text-primary-600 font-bold transition-all"
                        >
                            <Film className="w-4 h-4" />
                            <span>Video Reel</span>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* File Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Video
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                accept="video/*"
                                onChange={handleFileChange}
                                className="hidden"
                                id="videoInput"
                                required
                            />
                            {previewUrl ? (
                                <div className="relative w-full h-80 bg-black rounded-lg overflow-hidden group">
                                    <video
                                        src={previewUrl}
                                        className="w-full h-full object-contain"
                                        controls
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFile(null);
                                            setPreviewUrl('');
                                        }}
                                        className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <label
                                    htmlFor="videoInput"
                                    className="flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                                        <Upload className="w-12 h-12 text-gray-400 mb-3" />
                                        <p className="text-sm text-gray-500">
                                            <span className="font-semibold">Click to upload video</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-400 mt-2">
                                            MP4, MOV or WebM (Max 50MB, Recommended 9:16 aspect ratio)
                                        </p>
                                    </div>
                                </label>
                            )}
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
                            className="input-field resize-none w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            rows="3"
                            placeholder="Write a caption for your reel..."
                            maxLength={500}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {caption.length}/500 characters
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
                            <span>{isLoading ? 'Uploading...' : 'Share Reel'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/reels')}
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

export default CreateReel;
