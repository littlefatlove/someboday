function Music() {
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [currentSongIndex, setCurrentSongIndex] = React.useState(0);
    const [progress, setProgress] = React.useState(0);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [duration, setDuration] = React.useState(0);
    
    const [songs, setSongs] = React.useState([
        { title: "Midnight City", artist: "Synthwave", url: "", cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=300&q=80", isMock: true },
        { title: "Ocean Breeze", artist: "Chillout", url: "", cover: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80", isMock: true },
        { title: "Urban Dreams", artist: "Lofi Beats", url: "", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80", isMock: true }
    ]);

    const audioRef = React.useRef(null);
    const fileInputRef = React.useRef(null);
    const currentSong = songs[currentSongIndex];

    React.useEffect(() => {
        if (audioRef.current && !currentSong.isMock) {
            if (isPlaying) {
                audioRef.current.play().catch(e => console.error("Playback failed", e));
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, currentSongIndex, currentSong]);

    const handleTimeUpdate = () => {
        if (audioRef.current && !currentSong.isMock) {
            setCurrentTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration || 0);
            setProgress((audioRef.current.currentTime / (audioRef.current.duration || 1)) * 100);
        }
    };

    const handleEnded = () => {
        handleNext();
    };

    const handleNext = () => {
        setCurrentSongIndex((prev) => (prev === songs.length - 1 ? 0 : prev + 1));
        if (songs[currentSongIndex === songs.length - 1 ? 0 : currentSongIndex + 1].isMock) {
            setProgress(0);
            setCurrentTime(0);
            setIsPlaying(false);
        } else {
            setIsPlaying(true);
        }
    };

    const handlePrev = () => {
        setCurrentSongIndex((prev) => (prev === 0 ? songs.length - 1 : prev - 1));
        if (songs[currentSongIndex === 0 ? songs.length - 1 : currentSongIndex - 1].isMock) {
            setProgress(0);
            setCurrentTime(0);
            setIsPlaying(false);
        } else {
            setIsPlaying(true);
        }
    };

    const handleSeek = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        if (audioRef.current && !currentSong.isMock) {
            audioRef.current.currentTime = percentage * duration;
        } else {
            setProgress(percentage * 100);
        }
    };

    const formatTime = (time) => {
        if (isNaN(time) || time === Infinity) return "0:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('audio/')) {
            alert('請上傳音訊檔案 (.mp3, .wav 等)');
            return;
        }

        const url = URL.createObjectURL(file);
        const newSong = {
            title: file.name.replace(/\.[^/.]+$/, ""),
            artist: "本地音樂",
            url: url,
            cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80",
            isMock: false
        };

        setSongs(prev => [newSong, ...prev]);
        setCurrentSongIndex(0);
        setIsPlaying(true);
        e.target.value = null; // reset input
    };

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
        // If it's a mock song, just toggle the animation state
        if (currentSong.isMock && !isPlaying) {
            // Fake progress for mock songs if started playing
            setProgress(prev => prev > 0 ? prev : 5);
        }
    };

    return (
        <div className="flex-1 bg-gray-900 p-6 overflow-y-auto w-full relative">
            {/* Background Blur */}
            <div className="absolute inset-0 opacity-30 bg-cover bg-center blur-[80px] transition-all duration-1000" style={{ backgroundImage: `url(${currentSong.cover})` }}></div>
            
            <div className="max-w-md mx-auto relative z-10 flex flex-col h-full min-h-[500px]">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <h2 className="text-xl font-bold text-white flex items-center drop-shadow-md">
                        <div className="icon-music mr-3 text-emerald-400"></div>
                        音樂播放器
                    </h2>
                    <div className="flex space-x-2">
                        <button 
                            onClick={() => fileInputRef.current.click()}
                            className="flex items-center text-sm font-bold bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition-colors backdrop-blur-sm border border-white/10"
                        >
                            <div className="icon-plus mr-1"></div> 上傳
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileUpload} 
                            accept="audio/*" 
                            className="hidden" 
                        />
                    </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center">
                    {/* Cover Art */}
                    <div className={`w-64 h-64 md:w-72 md:h-72 rounded-full shadow-[0_0_50px_rgba(0,0,0,0.5)] mb-10 overflow-hidden border-4 border-gray-800 transition-transform duration-700 ${isPlaying ? 'animate-[spin_12s_linear_infinite]' : ''}`}>
                        <img src={currentSong.cover} className="w-full h-full object-cover" alt="Album Cover" />
                    </div>
                    
                    {/* Info */}
                    <h3 className="text-3xl font-bold text-white mb-2 text-center drop-shadow-md truncate w-full px-4">{currentSong.title}</h3>
                    <p className="text-gray-400 text-center mb-10 font-medium text-lg flex items-center justify-center">
                        {currentSong.artist}
                        {currentSong.isMock && <span className="ml-2 text-[10px] bg-gray-800 px-2 py-0.5 rounded border border-gray-700">展示用</span>}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full mb-10 px-4">
                        <div className="flex justify-between text-xs text-gray-400 mb-3 font-medium">
                            <span>{currentSong.isMock ? "0:00" : formatTime(currentTime)}</span>
                            <span>{currentSong.isMock ? "3:45" : formatTime(duration)}</span>
                        </div>
                        <div 
                            className="w-full h-2 bg-gray-800/80 rounded-full overflow-hidden cursor-pointer backdrop-blur-sm relative"
                            onClick={handleSeek}
                        >
                            <div 
                                className="absolute left-0 top-0 bottom-0 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] transition-all duration-100 ease-linear pointer-events-none" 
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center space-x-10 w-full">
                        <button 
                            className="text-gray-400 hover:text-white transition-colors active:scale-95" 
                            onClick={handlePrev}
                        >
                            <div className="icon-skip-back text-3xl"></div>
                        </button>
                        <button 
                            className="w-20 h-20 bg-emerald-400 rounded-full flex items-center justify-center text-gray-900 hover:bg-emerald-300 hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(52,211,153,0.3)]"
                            onClick={togglePlay}
                        >
                            <div className={`text-3xl ${isPlaying ? 'icon-pause' : 'icon-play ml-1'}`}></div>
                        </button>
                        <button 
                            className="text-gray-400 hover:text-white transition-colors active:scale-95" 
                            onClick={handleNext}
                        >
                            <div className="icon-skip-forward text-3xl"></div>
                        </button>
                    </div>
                </div>

                {/* Hidden Audio Element */}
                {!currentSong.isMock && (
                    <audio 
                        ref={audioRef}
                        src={currentSong.url}
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={handleEnded}
                        onLoadedMetadata={handleTimeUpdate}
                        className="hidden"
                    />
                )}
            </div>
        </div>
    );
}