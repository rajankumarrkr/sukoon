import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
    Loader2, Grid, Heart, LogOut, Film, Play, Plus,
    MoreVertical, ChevronDown, Menu, Share2, UserPlus,
    Camera, AtSign, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import EditProfileModal from '../components/EditProfileModal';

const Profile = () => {
    const { userId } = useParams();
    const { user: currentUser, logout, API_URL } = useAuth();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [activeTab, setActiveTab] = useState('posts');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const isOwnProfile = currentUser?.id === userId;

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchProfile();
        fetchUserPosts();
        fetchUserReels();
    }, [userId]);

    const fetchProfile = async () => {
        try {
            const response = await axios.get(`${API_URL}/users/${userId}`);
            setProfile(response.data.user);
            setIsFollowing(response.data.user.followers?.some(f => f._id === currentUser?.id));
        } catch (error) {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserPosts = async () => {
        try {
            const response = await axios.get(`${API_URL}/posts/user/${userId}`);
            setPosts(response.data.posts);
        } catch (error) {
            console.error('Failed to load posts:', error);
        }
    };

    const fetchUserReels = async () => {
        try {
            const response = await axios.get(`${API_URL}/reels/user/${userId}`);
            setReels(response.data.reels || []);
        } catch (error) {
            console.error('Failed to load reels:', error);
        }
    };

    const handleFollow = async () => {
        try {
            const response = await axios.post(`${API_URL}/users/follow/${userId}`);
            setIsFollowing(response.data.isFollowing);
            toast.success(response.data.message);
            fetchProfile();
        } catch (error) {
            toast.error('Failed to follow/unfollow');
        }
    };

    const handleShareProfile = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        toast.success('Profile link copied! 🔗');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
            {/* Top Navigation Header */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center space-x-4">
                    <Plus className="w-7 h-7 text-gray-700" />
                </div>

                <button className="flex items-center space-x-1">
                    <span className="font-bold text-lg">{profile?.username}</span>
                    <ChevronDown className="w-4 h-4" />
                    {isOwnProfile && <div className="w-2 h-2 bg-red-500 rounded-full ml-1" />}
                </button>

                <div className="flex items-center space-x-5">
                    <AtSign className="w-6 h-6" />
                    <Menu className="w-7 h-7" />
                </div>
            </div>

            <div className="px-4 py-4 max-w-2xl mx-auto">
                {/* Profile Header */}
                <div className="flex items-start mb-6">
                    {/* Left: Avatar with Vibe */}
                    <div className="relative mr-8">
                        {isOwnProfile && (
                            <div className="absolute -top-6 -left-2 bg-white px-2 py-1 rounded-xl text-[10px] font-bold text-gray-400 shadow-sm border border-gray-100 flex items-center">
                                Today's vibe...
                            </div>
                        )}
                        <div className="w-24 h-24 md:w-28 md:h-28 rounded-full">
                            <div className="w-full h-full rounded-full overflow-hidden bg-white shadow-inner">
                                <img
                                    src={profile?.profilePic || 'https://via.placeholder.com/150'}
                                    alt={profile?.username}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right: Stats */}
                    <div className="flex-1 flex justify-around mt-4">
                        <div className="text-center">
                            <div className="font-bold text-lg">{posts.length}</div>
                            <div className="text-sm text-gray-500">posts</div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-lg">{profile?.followers?.length || 0}</div>
                            <div className="text-sm text-gray-500">followers</div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-lg">{profile?.following?.length || 0}</div>
                            <div className="text-sm text-gray-500">following</div>
                        </div>
                    </div>
                </div>

                {/* Name & Bio */}
                <div className="mb-6 px-1">
                    <h2 className="font-bold text-base mb-0.5">{profile?.name}</h2>
                    <p className="text-sm text-gray-700 leading-snug">
                        {profile?.bio || 'Add a bio... ✨'}
                    </p>
                </div>

                {/* Dashboard */}
                {isOwnProfile && (
                    <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
                        <div>
                            <h3 className="text-sm font-bold text-gray-800">Professional dashboard</h3>
                            <p className="text-xs text-gray-400 mt-1 font-medium">219 accounts reached in the last 30 days.</p>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2 mb-8">
                    {isOwnProfile ? (
                        <>
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 py-2 rounded-lg text-sm font-bold text-gray-800 transition-colors"
                            >
                                Edit profile
                            </button>
                            <button
                                onClick={handleShareProfile}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 py-2 rounded-lg text-sm font-bold text-gray-800 transition-colors"
                            >
                                Share profile
                            </button>
                            <button className="bg-gray-100 p-2 rounded-lg">
                                <UserPlus className="w-5 h-5 text-gray-700" />
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleFollow}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${isFollowing
                                    ? 'bg-gray-200 text-gray-800'
                                    : 'bg-primary-600 text-white'
                                    }`}
                            >
                                {isFollowing ? 'Following' : 'Follow'}
                            </button>
                            <button className="flex-1 bg-gray-100 py-2 rounded-lg text-sm font-bold text-gray-800">
                                Message
                            </button>
                            <button className="bg-gray-100 p-2 rounded-lg">
                                <UserPlus className="w-5 h-5 text-gray-700" />
                            </button>
                        </>
                    )}
                </div>

                {/* Tabs & Content */}
                <div className="flex border-t border-gray-100 mb-0.5">
                    <button
                        onClick={() => setActiveTab('posts')}
                        className={`flex-1 flex justify-center py-4 border-b-2 transition-all ${activeTab === 'posts' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-400'
                            }`}
                    >
                        <Grid className="w-7 h-7" />
                    </button>
                    <button
                        onClick={() => setActiveTab('reels')}
                        className={`flex-1 flex justify-center py-4 border-b-2 transition-all ${activeTab === 'reels' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-400'
                            }`}
                    >
                        <Film className="w-7 h-7" />
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-[2px]">
                    {activeTab === 'posts' ? (
                        posts.map((post) => (
                            <div key={post._id} className="aspect-square bg-white overflow-hidden relative group">
                                <img
                                    src={post.imageUrl}
                                    className="w-full h-full object-cover transition-transform"
                                />
                            </div>
                        ))
                    ) : (
                        reels.map((reel) => (
                            <Link to="/reels" key={reel._id} className="aspect-[9/16] bg-black overflow-hidden relative group flex items-center justify-center">
                                <video src={reel.videoUrl} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/10 transition-colors" />
                                <div className="absolute bottom-2 left-2 flex items-center text-white text-[10px] font-bold drop-shadow-md">
                                    <Play className="w-3 h-3 mr-1 fill-white" />
                                    {reel.views?.length || 0}
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>

            {/* Account Logout */}
            {isOwnProfile && (
                <div className="px-4 py-8 max-w-2xl mx-auto">
                    <button
                        onClick={logout}
                        className="w-full flex items-center p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
                    >
                        <div className="flex items-center space-x-3 text-red-500 font-bold">
                            <LogOut className="w-5 h-5" />
                            <span>Logout from Sukoon</span>
                        </div>
                    </button>
                </div>
            )}

            {/* Edit Modal */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <EditProfileModal
                        profile={profile}
                        onClose={() => setIsEditModalOpen(false)}
                        onUpdate={(updatedUser) => {
                            setProfile(updatedUser);
                            setIsEditModalOpen(false);
                        }}
                        API_URL={API_URL}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Profile;
