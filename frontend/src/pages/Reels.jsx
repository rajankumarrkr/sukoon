import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Heart, MessageCircle, Share2, Music, UserPlus, Loader2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ShareSheet from '../components/ShareSheet';

const ReelItem = ({ reel, isActive, onShare }) => {
    const videoRef = useRef(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(reel.likes?.length || 0);
    const { API_URL } = useAuth();

    useEffect(() => {
        if (isActive) {
            videoRef.current?.play();
        } else {
            videoRef.current?.pause();
        }
    }, [isActive]);

    const handleLike = async () => {
        try {
            const response = await axios.post(`${API_URL}/reels/like/${reel._id}`);
            setIsLiked(response.data.isLiked);
            setLikesCount(response.data.likesCount);
        } catch (error) {
            toast.error('Failed to like reel');
        }
    };

    return (
        <div className="relative h-full w-full bg-black flex items-center justify-center overflow-hidden">
            <video
                ref={videoRef}
                src={reel.videoUrl}
                className="h-full w-full object-contain"
                loop
                playsInline
                onClick={() => videoRef.current?.paused ? videoRef.current.play() : videoRef.current.pause()}
            />

            {/* Overlay Info */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 pointer-events-none" />

            {/* Side Actions */}
            <div className="absolute right-4 bottom-8 flex flex-col items-center space-y-6 z-10">
                <div className="flex flex-col items-center space-y-1">
                    <button onClick={handleLike} className="p-3 transition-transform active:scale-90">
                        <Heart className={`w-8 h-8 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                    </button>
                    <span className="text-white text-xs font-semibold">{likesCount}</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                    <button className="p-3 text-white">
                        <MessageCircle className="w-8 h-8" />
                    </button>
                    <span className="text-white text-xs font-semibold">{reel.comments?.length || 0}</span>
                </div>
                <button
                    onClick={() => onShare(reel)}
                    className="p-3 text-white transition-transform active:scale-95"
                >
                    <Share2 className="w-8 h-8" />
                </button>
                <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden animate-spin-slow shadow-lg">
                    <img src={reel.userId?.profilePic || 'https://via.placeholder.com/40'} alt="Music" className="w-full h-full object-cover" />
                </div>
            </div>

            {/* Bottom Info */}
            <div className="absolute left-4 bottom-8 right-16 z-10 pointer-events-none text-white shadow-text">
                <div className="flex items-center space-x-3 mb-4">
                    <img src={reel.userId?.profilePic || 'https://via.placeholder.com/40'} alt="User" className="w-10 h-10 rounded-full border-2 border-white shadow-lg" />
                    <span className="text-white font-bold drop-shadow-md">@{reel.userId?.username}</span>
                    <button className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs rounded-lg font-semibold pointer-events-auto hover:bg-white/30 transition-colors">
                        Follow
                    </button>
                </div>
                <p className="text-white text-sm mb-3 line-clamp-2 drop-shadow-md">{reel.caption}</p>
                <div className="flex items-center space-x-2 text-white/90">
                    <div className="bg-white/20 backdrop-blur-md p-1.5 rounded-lg flex items-center space-x-2">
                        <Music className="w-3 h-3" />
                        <span className="text-[10px] font-bold tracking-tight uppercase">Original Audio</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Reels = () => {
    const { API_URL } = useAuth();
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [sharingReel, setSharingReel] = useState(null);
    const containerRef = useRef(null);

    useEffect(() => {
        fetchReels();
    }, []);

    const fetchReels = async () => {
        try {
            const response = await axios.get(`${API_URL}/reels`);
            setReels(response.data.reels);
        } catch (error) {
            console.error('Fetch reels error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleScroll = () => {
        if (!containerRef.current) return;
        const index = Math.round(containerRef.current.scrollTop / containerRef.current.clientHeight);
        setActiveIndex(index);
    };

    if (loading) {
        return (
            <div className="h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            className="h-[calc(100vh-64px)] w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide bg-gray-50"
        >
            {reels.length > 0 ? (
                reels.map((reel, index) => (
                    <div key={reel._id} className="snap-start h-full w-full flex items-center justify-center md:pb-8">
                        <div className="h-full w-full max-w-[450px] bg-black rounded-none md:rounded-[40px] overflow-hidden shadow-2xl relative">
                            <ReelItem
                                reel={reel}
                                isActive={index === activeIndex}
                                onShare={(r) => setSharingReel(r)}
                            />
                        </div>
                    </div>
                ))
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                    <div className="w-24 h-24 rounded-full border-4 border-dashed border-gray-200 flex items-center justify-center">
                        <Plus className="w-12 h-12" />
                    </div>
                    <p className="font-bold text-lg">No peaceful reels yet</p>
                </div>
            )}

            {/* Share Sheet Modal */}
            <AnimatePresence>
                {sharingReel && (
                    <ShareSheet
                        reel={sharingReel}
                        onClose={() => setSharingReel(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Reels;
