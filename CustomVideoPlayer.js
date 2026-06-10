function CustomVideoPlayer({ src, className = "", autoPlay = false, loop = false, onBack }) {
    const videoRef = React.useRef(null);
    const containerRef = React.useRef(null);
    const [isPlaying, setIsPlaying] = React.useState(autoPlay);
    const [progress, setProgress] = React.useState(0);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [duration, setDuration] = React.useState(0);
    const [isMuted, setIsMuted] = React.useState(false);
    const [isFullscreen, setIsFullscreen] = React.useState(false);
    const [showControls, setShowControls] = React.useState(true);
    const controlsTimeoutRef = React.useRef(null);

    React.useEffect(() => {
        if (autoPlay && videoRef.current) {
            videoRef.current.play().catch(e => console.log("Auto-play prevented", e));
        }
    }, [autoPlay]);

    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const togglePlay = (e) => {
        if (e) e.stopPropagation();
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play().catch(e => console.error("Play failed", e));
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = (e) => {
        if (e) e.stopPropagation();
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const toggleFullscreen = (e) => {
        if (e) e.stopPropagation();
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
            setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleSeek = (e) => {
        if (e) e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        if (videoRef.current) {
            videoRef.current.currentTime = percentage * videoRef.current.duration;
            setProgress(percentage * 100);
        }
    };

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 2000);
    };

    const handleMouseLeave = () => {
        if (isPlaying) setShowControls(false);
    };

    return (
        <div 
            ref={containerRef}
            className={`relative group bg-black overflow-hidden flex flex-col justify-center items-center ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={togglePlay}
        >
            <video
                ref={videoRef}
                src={src}
                className="w-full h-full object-contain"
                loop={loop}
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => !loop && setIsPlaying(false)}
                onClick={(e) => e.stopPropagation()} // Let container handle click
            />

            {/* Back Button */}
            {onBack && (
                <div 
                    className={`absolute top-4 right-4 z-10 transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}
                >
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onBack();
                        }}
                        className="w-10 h-10 bg-black/40 hover:bg-[var(--primary-color)] backdrop-blur-md rounded-full flex items-center justify-center text-white border-none shadow-none transition-colors"
                    >
                        <div className="icon-x text-xl"></div>
                    </button>
                </div>
            )}

            {/* Play/Pause Center Button Overlay (Shows when paused) */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                    <div className="w-20 h-20 bg-[var(--primary-color)] bg-opacity-90 backdrop-blur-sm rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                        <div className="icon-play text-4xl ml-2"></div>
                    </div>
                </div>
            )}

            {/* Controls Bar */}
            <div 
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-16 transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Progress Bar */}
                <div 
                    className="w-full h-1.5 bg-white/30 rounded-full mb-3 cursor-pointer group/progress relative"
                    onClick={handleSeek}
                >
                    <div 
                        className="absolute top-0 left-0 h-full bg-[var(--primary-color)] rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                    ></div>
                    <div 
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[var(--primary-color)] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)] border-2 border-white opacity-0 group-hover/progress:opacity-100 transition-opacity"
                        style={{ left: `calc(${progress}% - 8px)` }}
                    ></div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between text-white">
                    <div className="flex items-center space-x-4">
                        <button onClick={togglePlay} className="hover:text-[var(--primary-color)] transition-colors">
                            <div className={`text-xl ${isPlaying ? 'icon-pause' : 'icon-play'}`}></div>
                        </button>
                        <button onClick={toggleMute} className="hover:text-[var(--primary-color)] transition-colors">
                            <div className={`text-xl ${isMuted ? 'icon-volume-x' : 'icon-volume-2'}`}></div>
                        </button>
                        <div className="text-xs font-medium">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </div>
                    </div>
                    
                    <button onClick={toggleFullscreen} className="hover:text-[var(--primary-color)] transition-colors">
                        <div className={`text-xl ${isFullscreen ? 'icon-shrink' : 'icon-expand'}`}></div>
                    </button>
                </div>
            </div>
        </div>
    );
}