import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Bookmark, MoreVertical, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ShareSheet from './ShareSheet';

const PostCard = ({ post, onLike, onComment }) => {
    const { user, API_URL } = useAuth();
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [isLiked, setIsLiked] = useState(post.likes?.includes(user?.id) || false);
    const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
    const [showShareSheet, setShowShareSheet] = useState(false);

    const handleLike = async () => {
        try {
            const response = await axios.post(`${API_URL}/posts/like/${post._id}`);
            setIsLiked(response.data.isLiked);
            setLikesCount(response.data.likesCount);
            if (onLike) onLike(post._id, response.data.isLiked);
        } catch (error) {
            toast.error('Failed to like post');
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        try {
            await axios.post(`${API_URL}/posts/comment/${post._id}`, {
                text: commentText
            });
            setCommentText('');
            toast.success('Comment added!');
            if (onComment) onComment(post._id);
        } catch (error) {
            toast.error('Failed to add comment');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white md:rounded-xl md:shadow-lg overflow-hidden mb-4 md:mb-6 border-b border-gray-100 md:border-none"
        >
            {/* Post Header */}
            <div className="flex items-center justify-between p-4">
                <Link
                    to={`/profile/${post.userId?._id}`}
                    className="flex items-center space-x-3 hover:opacity-80 transition"
                >
                    <img
                        src={post.userId?.profilePic || 'https://via.placeholder.com/40'}
                        alt={post.userId?.username}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                        <p className="font-semibold text-gray-800">{post.userId?.username}</p>
                        <p className="text-xs text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </Link>
                <button className="text-gray-600 hover:text-gray-800">
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>

            {/* Post Image */}
            <img
                src={post.imageUrl}
                alt="Post"
                className="w-full max-h-[600px] object-cover"
            />

            {/* Post Actions */}
            <div className="p-4">
                <div className="flex items-center space-x-4 mb-3">
                    <button
                        onClick={handleLike}
                        className="hover:scale-110 transition-transform"
                    >
                        <Heart
                            className={`w-7 h-7 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-700'
                                }`}
                        />
                    </button>
                    <button
                        onClick={() => setShowComments(!showComments)}
                        className="hover:scale-110 transition-transform"
                    >
                        <MessageCircle className="w-7 h-7 text-gray-700" />
                    </button>
                    <button
                        onClick={() => setShowShareSheet(true)}
                        className="hover:scale-110 transition-transform"
                    >
                        <Send className="w-7 h-7 text-gray-700" />
                    </button>
                    <button className="hover:scale-110 transition-transform">
                        <Bookmark className="w-7 h-7 text-gray-700" />
                    </button>
                </div>

                {/* Likes Count */}
                <p className="font-semibold text-gray-800 mb-2">
                    {likesCount} {likesCount === 1 ? 'like' : 'likes'}
                </p>

                {/* Caption */}
                {post.caption && (
                    <p className="text-gray-800 mb-2">
                        <Link
                            to={`/profile/${post.userId?._id}`}
                            className="font-semibold mr-2 hover:text-primary-600"
                        >
                            {post.userId?.username}
                        </Link>
                        {post.caption}
                    </p>
                )}

                {/* Comments */}
                {post.comments?.length > 0 && (
                    <button
                        onClick={() => setShowComments(!showComments)}
                        className="text-gray-500 text-sm mb-2 hover:text-gray-700"
                    >
                        View all {post.comments.length} comments
                    </button>
                )}

                {showComments && (
                    <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                        {post.comments?.map((comment, index) => (
                            <div key={index} className="text-sm">
                                <span className="font-semibold mr-2">{comment.userId?.username}</span>
                                <span className="text-gray-700">{comment.text}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Comment */}
                <form onSubmit={handleComment} className="mt-3 flex items-center space-x-2">
                    <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                    <button
                        type="submit"
                        disabled={!commentText.trim()}
                        className="text-primary-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Post
                    </button>
                </form>
            </div>

            <AnimatePresence>
                {showShareSheet && (
                    <ShareSheet
                        item={post}
                        type="post"
                        onClose={() => setShowShareSheet(false)}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default PostCard;
