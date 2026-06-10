function Pomodoro() {
    const [timeLeft, setTimeLeft] = React.useState(25 * 60);
    const [isRunning, setIsRunning] = React.useState(false);
    const [mode, setMode] = React.useState('work'); // work, break

    React.useEffect(() => {
        let timer;
        if (isRunning && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
        } else if (timeLeft === 0) {
            setIsRunning(false);
            new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play().catch(()=>{});
        }
        return () => clearInterval(timer);
    }, [isRunning, timeLeft]);

    const switchMode = (newMode) => {
        setMode(newMode);
        setIsRunning(false);
        setTimeLeft(newMode === 'work' ? 25 * 60 : 5 * 60);
    };

    const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const secs = (timeLeft % 60).toString().padStart(2, '0');

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="icon-clock text-4xl text-red-400 mb-4 mx-auto"></div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">番茄鐘</h2>

                <div className="flex justify-center space-x-2 mb-8">
                    <button onClick={() => switchMode('work')} className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${mode === 'work' ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:bg-gray-100'}`}>工作 (25分)</button>
                    <button onClick={() => switchMode('break')} className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${mode === 'break' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}>休息 (5分)</button>
                </div>

                <div className="w-64 h-64 mx-auto border-8 border-gray-100 rounded-full flex items-center justify-center mb-8 relative">
                    <div className="text-6xl font-bold text-gray-800 tabular-nums">{mins}:{secs}</div>
                </div>

                <div className="flex justify-center space-x-4">
                    <button onClick={() => setIsRunning(!isRunning)} className="w-16 h-16 bg-red-400 text-white rounded-full flex items-center justify-center text-2xl hover:bg-red-500 shadow-lg shadow-red-200 transition-transform active:scale-95">
                        <div className={isRunning ? 'icon-pause' : 'icon-play'}></div>
                    </button>
                    <button onClick={() => switchMode(mode)} className="w-16 h-16 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-2xl hover:bg-gray-200 transition-transform active:scale-95">
                        <div className="icon-rotate-ccw"></div>
                    </button>
                </div>
            </div>
        </div>
    );
}