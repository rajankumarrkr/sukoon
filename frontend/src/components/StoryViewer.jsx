import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const StoryViewer = ({ storyGroup, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const stories = storyGroup.items;

    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentIndex < stories.length - 1) {
                setCurrentIndex(prev => prev + 1);
            } else {
                onClose();
            }
        }, 5000); // 5 seconds per story

        return () => clearTimeout(timer);
    }, [currentIndex, stories, onClose]);

    const handleNext = () => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            onClose();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-50 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
            >
                <X className="w-8 h-8" />
            </button>

            {/* Progress Bar */}
            <div className="absolute top-4 left-4 right-12 z-50 flex space-x-1 h-1">
                {stories.map((_, index) => (
                    <div key={index} className="flex-1 bg-white/30 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: '0%' }}
                            animate={{ width: index === currentIndex ? '100%' : index < currentIndex ? '100%' : '0%' }}
                            transition={{ duration: index === currentIndex ? 5 : 0, ease: 'linear' }}
                            className="h-full bg-white"
                        />
                    </div>
                ))}
            </div>

            {/* User Info */}
            <div className="absolute top-8 left-4 z-50 flex items-center space-x-3">
                <img
                    src={storyGroup.user.profilePic || 'https://via.placeholder.com/40'}
                    alt="User"
                    className="w-10 h-10 rounded-full object-cover border-2 border-white"
                />
                <span className="text-white font-bold">{storyGroup.user.username}</span>
            </div>

            {/* Content */}
            <div className="relative w-full max-w-lg aspect-[9/16] bg-black flex items-center justify-center">
                <img
                    src={stories[currentIndex].imageUrl}
                    alt="Story"
                    className="w-full h-full object-contain"
                />

                {/* Navigation Buttons */}
                <button
                    onClick={handlePrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-white/50 hover:text-white transition"
                >
                    <ChevronLeft className="w-10 h-10" />
                </button>
                <button
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white/50 hover:text-white transition"
                >
                    <ChevronRight className="w-10 h-10" />
                </button>
            </div>
        </motion.div>
    );
};

export default StoryViewer;
