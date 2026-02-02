import { useState } from 'react';
import { X, Camera, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const EditProfileModal = ({ profile, onClose, onUpdate, API_URL }) => {
    const [name, setName] = useState(profile?.name || '');
    const [bio, setBio] = useState(profile?.bio || '');
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(profile?.profilePic || null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('bio', bio);
        if (selectedFile) {
            formData.append('profilePic', selectedFile);
        }

        try {
            const response = await axios.put(`${API_URL}/users/update`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Profile updated! ✨');
            onUpdate(response.data.user);
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <button onClick={onClose} className="text-gray-500 font-medium active:scale-95 transition-transform">Cancel</button>
                    <h3 className="font-bold text-gray-900">Edit profile</h3>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="text-primary-600 font-bold active:scale-95 transition-transform disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Done'}
                    </button>
                </div>

                <div className="p-6">
                    {/* DP Upload */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-upload').click()}>
                            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-100 shadow-inner bg-gray-50 relative">
                                <img
                                    src={previewUrl || 'https://via.placeholder.com/150'}
                                    alt="Preview"
                                    className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                    <Camera className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <button className="mt-3 text-primary-600 text-sm font-bold active:scale-95 transition-transform">
                                Change profile photo
                            </button>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-gray-50/50 border-b border-gray-200 focus:border-primary-600 py-2 outline-none transition-colors text-gray-800"
                                placeholder="Your name"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Bio</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={3}
                                className="w-full bg-gray-50/50 border-b border-gray-200 focus:border-primary-600 py-2 outline-none transition-colors resize-none text-gray-800"
                                placeholder="Tell us about yourself..."
                            />
                        </div>
                    </div>

                    <div className="mt-8 border-t border-gray-100 pt-6">
                        <p className="text-center text-gray-400 text-xs leading-relaxed px-4">
                            Changing your profile details will be visible to everyone on Sukoon. 🤍
                        </p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default EditProfileModal;
