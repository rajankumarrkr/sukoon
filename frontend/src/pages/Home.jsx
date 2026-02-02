import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { API_URL } = useAuth();

    useEffect(() => {
        fetchFeed();
    }, []);

    const fetchFeed = async () => {
        try {
            const response = await axios.get(`${API_URL}/posts/feed`);
            setPosts(response.data.posts);
        } catch (error) {
            toast.error('Failed to load feed');
            console.error('Feed error:', error);
        } finally {
            setLoading(false);
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
        <div className="max-w-2xl mx-auto px-4 py-8">
            {posts.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg mb-4">No posts yet</p>
                    <p className="text-gray-500">
                        Follow users or create your first post to see content here
                    </p>
                </div>
            ) : (
                posts.map((post) => (
                    <PostCard
                        key={post._id}
                        post={post}
                        onLike={() => fetchFeed()}
                        onComment={() => fetchFeed()}
                    />
                ))
            )}
        </div>
    );
};

export default Home;
