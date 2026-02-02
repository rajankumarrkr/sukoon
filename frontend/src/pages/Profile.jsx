import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Loader2, UserPlus, UserMinus, Grid, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Profile = () => {
    const { userId } = useParams();
    const { user: currentUser, API_URL } = useAuth();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);

    const isOwnProfile = currentUser?.id === userId;

    useEffect(() => {
        fetchProfile();
        fetchUserPosts();
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Profile Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-8 mb-8"
            >
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
                    {/* Profile Picture */}
                    <img
                        src={profile?.profilePic || 'https://via.placeholder.com/150'}
                        alt={profile?.username}
                        className="w-32 h-32 rounded-full object-cover border-4 border-primary-200"
                    />

                    {/* Profile Info */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-4 mb-4">
                            <h1 className="text-2xl font-bold text-gray-800">{profile?.username}</h1>
                            {!isOwnProfile && (
                                <button
                                    onClick={handleFollow}
                                    className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-semibold transition-all ${isFollowing
                                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            : 'bg-primary-600 text-white hover:bg-primary-700'
                                        }`}
                                >
                                    {isFollowing ? (
                                        <>
                                            <UserMinus className="w-4 h-4" />
                                            <span>Unfollow</span>
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-4 h-4" />
                                            <span>Follow</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="flex justify-center md:justify-start space-x-8 mb-4">
                            <div className="text-center">
                                <p className="font-bold text-xl text-gray-800">{posts.length}</p>
                                <p className="text-gray-600 text-sm">Posts</p>
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-xl text-gray-800">
                                    {profile?.followers?.length || 0}
                                </p>
                                <p className="text-gray-600 text-sm">Followers</p>
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-xl text-gray-800">
                                    {profile?.following?.length || 0}
                                </p>
                                <p className="text-gray-600 text-sm">Following</p>
                            </div>
                        </div>

                        {/* Bio */}
                        <div>
                            <p className="font-semibold text-gray-800">{profile?.name}</p>
                            {profile?.bio && <p className="text-gray-600 mt-1">{profile.bio}</p>}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Posts Grid */}
            <div className="mb-6">
                <div className="flex items-center space-x-2 mb-4">
                    <Grid className="w-5 h-5 text-gray-600" />
                    <h2 className="text-lg font-semibold text-gray-800">Posts</h2>
                </div>

                {posts.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow">
                        <p className="text-gray-600">No posts yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-1 md:gap-4">
                        {posts.map((post) => (
                            <motion.div
                                key={post._id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative aspect-square group cursor-pointer overflow-hidden rounded-lg"
                            >
                                <img
                                    src={post.imageUrl}
                                    alt="Post"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-6 text-white">
                                    <div className="flex items-center space-x-2">
                                        <Heart className="w-6 h-6 fill-white" />
                                        <span className="font-semibold">{post.likes?.length || 0}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
