import { useState, useEffect, useRef } from 'react';
import Peer from 'simple-peer';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Buffer } from 'buffer';

// Polyfill Buffer for simple-peer
window.Buffer = Buffer;

const CallWindow = ({
    activeCall,
    currentUser,
    socket,
    onEndCall
}) => {
    const [stream, setStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(activeCall.callType === 'audio');

    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();

    useEffect(() => {
        const initCall = async () => {
            try {
                const currentStream = await navigator.mediaDevices.getUserMedia({
                    video: activeCall.callType === 'video',
                    audio: true
                });
                setStream(currentStream);
                if (myVideo.current) {
                    myVideo.current.srcObject = currentStream;
                }

                if (activeCall.isIncoming) {
                    answerCall(currentStream);
                } else {
                    callUser(currentStream);
                }
            } catch (err) {
                console.error('Failed to get media stream', err);
            }
        };

        initCall();

        socket.on('call_accepted', (signal) => {
            setCallAccepted(true);
            connectionRef.current.signal(signal);
        });

        socket.on('call_ended', () => {
            handleEndCall();
        });

        socket.on('call_rejected', () => {
            handleEndCall();
        });

        return () => {
            handleEndCall();
            socket.off('call_accepted');
            socket.off('call_ended');
            socket.off('call_rejected');
        };
    }, []);

    const callUser = (stream) => {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: stream
        });

        peer.on('signal', (data) => {
            socket.emit('call_user', {
                userToCall: activeCall.otherUser._id,
                signalData: data,
                from: currentUser.id,
                name: currentUser.name || currentUser.username,
                callType: activeCall.callType
            });
        });

        peer.on('stream', (remoteStream) => {
            setRemoteStream(remoteStream);
            if (userVideo.current) {
                userVideo.current.srcObject = remoteStream;
            }
        });

        connectionRef.current = peer;
    };

    const answerCall = (stream) => {
        setCallAccepted(true);
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: stream
        });

        peer.on('signal', (data) => {
            socket.emit('answer_call', { signal: data, to: activeCall.otherUser._id });
        });

        peer.on('stream', (remoteStream) => {
            setRemoteStream(remoteStream);
            if (userVideo.current) {
                userVideo.current.srcObject = remoteStream;
            }
        });

        peer.signal(activeCall.signal);
        connectionRef.current = peer;
    };

    const handleEndCall = () => {
        if (connectionRef.current) {
            connectionRef.current.destroy();
        }
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        socket.emit('end_call', { to: activeCall.otherUser._id });
        onEndCall();
    };

    const toggleMute = () => {
        if (stream) {
            const audioTrack = stream.getAudioTracks()[0];
            audioTrack.enabled = !audioTrack.enabled;
            setIsMuted(!audioTrack.enabled);
        }
    };

    const toggleVideo = () => {
        if (stream && activeCall.callType === 'video') {
            const videoTrack = stream.getVideoTracks()[0];
            videoTrack.enabled = !videoTrack.enabled;
            setIsVideoOff(!videoTrack.enabled);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-8">
            <div className="relative w-full max-w-4xl aspect-video bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                {/* Remote Video */}
                {activeCall.callType === 'video' ? (
                    <div className="w-full h-full relative">
                        {callAccepted ? (
                            <video
                                playsInline
                                ref={userVideo}
                                autoPlay
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                                <div className="w-24 h-24 bg-primary-500/20 rounded-full flex items-center justify-center animate-pulse">
                                    <User size={48} className="text-primary-500" />
                                </div>
                                <p className="text-white font-medium">Calling {activeCall.otherUser.name || activeCall.otherUser.username}...</p>
                            </div>
                        )}

                        {/* My Video (Picture in Picture) */}
                        <div className="absolute top-4 right-4 w-32 md:w-48 aspect-video bg-gray-800 rounded-xl overflow-hidden border-2 border-white/20 shadow-lg">
                            <video
                                playsInline
                                muted
                                ref={myVideo}
                                autoPlay
                                className="w-full h-full object-cover"
                            />
                            {isVideoOff && (
                                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                                    <VideoOff size={24} className="text-gray-500" />
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Audio Call UI */
                    <div className="w-full h-full flex flex-col items-center justify-center space-y-8 bg-gradient-to-br from-gray-900 to-primary-900/20">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary-500/20 rounded-full animate-ping scale-150 opacity-20"></div>
                            <div className="absolute inset-0 bg-primary-500/10 rounded-full animate-ping scale-125 opacity-40 delay-300"></div>
                            <img
                                src={activeCall.otherUser.profilePic || 'https://via.placeholder.com/150'}
                                alt=""
                                className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white/10 relative z-10 object-cover shadow-2xl"
                            />
                        </div>
                        <div className="text-center space-y-2 relative z-10">
                            <h2 className="text-2xl md:text-3xl font-bold text-white">
                                {activeCall.otherUser.name || activeCall.otherUser.username}
                            </h2>
                            <p className="text-primary-400 font-medium">
                                {callAccepted ? 'Calling connected' : 'Calling...'}
                            </p>
                        </div>
                        {/* Hidden videos for audio call streams */}
                        <video playsInline ref={myVideo} autoPlay muted className="hidden" />
                        <video playsInline ref={userVideo} autoPlay className="hidden" />
                    </div>
                )}

                {/* Call Controls */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-4 md:space-x-6">
                    <button
                        onClick={toggleMute}
                        className={`p-4 md:p-5 rounded-full transition-all active:scale-90 ${isMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    >
                        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                    </button>

                    {activeCall.callType === 'video' && (
                        <button
                            onClick={toggleVideo}
                            className={`p-4 md:p-5 rounded-full transition-all active:scale-90 ${isVideoOff ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        >
                            {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                        </button>
                    )}

                    <button
                        onClick={handleEndCall}
                        className="p-4 md:p-5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all active:scale-90 shadow-xl shadow-red-900/20"
                    >
                        <PhoneOff size={24} />
                    </button>
                </div>
            </div>

            <button
                onClick={handleEndCall}
                className="mt-8 text-gray-400 hover:text-white transition-colors flex items-center space-x-2"
            >
                <X size={20} />
                <span className="font-medium">Close Window</span>
            </button>
        </div>
    );
};

export default CallWindow;
