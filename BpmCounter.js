function BpmCounter() {
    const [taps, setTaps] = React.useState([]);
    const [bpm, setBpm] = React.useState(0);

    const handleTap = () => {
        const now = Date.now();
        const newTaps = [...taps, now].filter(t => now - t < 5000); // Keep taps from last 5 seconds
        setTaps(newTaps);

        if (newTaps.length >= 2) {
            const duration = (newTaps[newTaps.length - 1] - newTaps[0]) / 1000; // in seconds
            const beats = newTaps.length - 1;
            setBpm(Math.round((beats / duration) * 60));
        }
    };

    const reset = () => {
        setTaps([]);
        setBpm(0);
    };

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto flex items-center">
            <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center w-full">
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                        <div className="icon-audio-waveform text-pink-500 mr-2"></div> BPM 計拍器
                    </h2>
                    <button onClick={reset} className="text-gray-400 hover:text-gray-600 text-sm font-bold flex items-center"><div className="icon-rotate-ccw mr-1"></div> 重設</button>
                </div>
                
                <div className="text-7xl font-bold text-gray-800 mb-2 tabular-nums">{bpm || '--'}</div>
                <div className="text-gray-500 font-bold mb-10 tracking-widest uppercase">BEATS PER MINUTE</div>

                <button 
                    onPointerDown={handleTap} 
                    className="w-48 h-48 rounded-full bg-pink-500 text-white flex items-center justify-center text-3xl font-bold shadow-2xl shadow-pink-200 hover:bg-pink-600 active:scale-95 transition-transform mx-auto select-none touch-none"
                >
                    TAP
                </button>
            </div>
        </div>
    );
}