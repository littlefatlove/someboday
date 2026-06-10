function WhiteNoise() {
    const [isPlaying, setIsPlaying] = React.useState(false);
    const audioCtxRef = React.useRef(null);
    const noiseNodeRef = React.useRef(null);

    const togglePlay = () => {
        if (isPlaying) {
            if (audioCtxRef.current) {
                audioCtxRef.current.close();
                audioCtxRef.current = null;
            }
            setIsPlaying(false);
        } else {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioContext();
            audioCtxRef.current = ctx;

            const bufferSize = ctx.sampleRate * 2; // 2 seconds
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const output = buffer.getChannelData(0);

            // Generate Pink Noise (softer than white noise)
            let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0;
            for (let i = 0; i < bufferSize; i++) {
                let white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                output[i] *= 0.11; // gain adjustment
                b6 = white * 0.115926;
            }

            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            noise.loop = true;

            const gain = ctx.createGain();
            gain.gain.value = 0.2; // Volume

            noise.connect(gain);
            gain.connect(ctx.destination);
            noise.start();
            noiseNodeRef.current = noise;

            setIsPlaying(true);
        }
    };

    React.useEffect(() => {
        return () => {
            if (audioCtxRef.current) {
                audioCtxRef.current.close();
            }
        };
    }, []);

    return (
        <div className="flex-1 bg-gray-50 p-6 overflow-y-auto w-full">
            <div className="max-w-md mx-auto bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center">
                    <div className="icon-waves mr-3 text-slate-500"></div>
                    粉紅噪音 (專注/放鬆)
                </h2>
                <p className="text-sm text-gray-500 mb-10">產生存粹的音頻幫助您集中注意力</p>
                
                <div className={`w-40 h-40 mx-auto rounded-full flex items-center justify-center cursor-pointer transition-all duration-500 ${isPlaying ? 'bg-slate-100 shadow-[0_0_40px_rgba(100,116,139,0.3)] animate-pulse' : 'bg-gray-50 hover:bg-gray-100'}`} onClick={togglePlay}>
                    {isPlaying ? (
                        <div className="icon-pause text-5xl text-slate-600 fill-current"></div>
                    ) : (
                        <div className="icon-play text-5xl text-slate-400 pl-2"></div>
                    )}
                </div>

                <div className="mt-10 font-bold text-gray-600">
                    {isPlaying ? '播放中...' : '點擊開始播放'}
                </div>
            </div>
        </div>
    );
}