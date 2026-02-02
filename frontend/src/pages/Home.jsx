import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import Stories from '../components/Stories';
import StoryViewer from '../components/StoryViewer';
import { AnimatePresence } from 'framer-motion';

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStoryGroup, setSelectedStoryGroup] = useState(null);
    const { API_URL } = useAuth();

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await axios.get(`${API_URL}/posts/feed`);
            setPosts(response.data.posts);
        } catch (error) {
            console.error('Failed to fetch posts:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse bg-white rounded-xl shadow-lg overflow-hidden h-[400px]" />
                ))}
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-6">
            <Stories onStoryClick={(group) => setSelectedStoryGroup(group)} />

            <div className="space-y-6">
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <PostCard key={post._id} post={post} onLike={() => { }} onComment={() => { }} />
                    ))
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 font-medium">No posts to show. Start following people!</p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {selectedStoryGroup && (
                    <StoryViewer
                        storyGroup={selectedStoryGroup}
                        onClose={() => setSelectedStoryGroup(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Home;
