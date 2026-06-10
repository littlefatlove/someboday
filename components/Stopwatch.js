function Stopwatch() {
    const [time, setTime] = React.useState(0);
    const [isRunning, setIsRunning] = React.useState(false);
    const [laps, setLaps] = React.useState([]);

    React.useEffect(() => {
        let intervalId;
        if (isRunning) {
            intervalId = setInterval(() => setTime(t => t + 10), 10);
        }
        return () => clearInterval(intervalId);
    }, [isRunning]);

    const formatTime = (ms) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const centiseconds = Math.floor((ms % 1000) / 10);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="icon-timer text-4xl text-fuchsia-500 mb-4 mx-auto"></div>
                <h2 className="text-2xl font-bold text-gray-800 mb-8">碼錶</h2>
                <div className="text-6xl font-mono font-bold text-gray-800 mb-10 tabular-nums tracking-tight">
                    {formatTime(time)}
                </div>
                <div className="flex justify-center space-x-4 mb-8">
                    <button 
                        onClick={() => setIsRunning(!isRunning)}
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 ${isRunning ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-fuchsia-500 hover:bg-fuchsia-600 shadow-fuchsia-200'}`}
                    >
                        <div className={`text-2xl ${isRunning ? 'icon-pause' : 'icon-play'}`}></div>
                    </button>
                    <button 
                        onClick={() => {
                            if (isRunning) {
                                setLaps([time, ...laps]);
                            } else {
                                setTime(0);
                                setLaps([]);
                            }
                        }}
                        className="w-16 h-16 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center transition-transform active:scale-95"
                    >
                        <div className={`text-2xl ${isRunning ? 'icon-flag' : 'icon-rotate-ccw'}`}></div>
                    </button>
                </div>
                {laps.length > 0 && (
                    <div className="text-left border-t border-gray-100 pt-4 max-h-48 overflow-y-auto custom-scrollbar">
                        {laps.map((lap, i) => (
                            <div key={i} className="flex justify-between py-2 text-gray-600 font-mono">
                                <span>圈 {laps.length - i}</span>
                                <span>{formatTime(lap)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}