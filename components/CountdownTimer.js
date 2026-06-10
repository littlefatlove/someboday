function CountdownTimer() {
    const [minutes, setMinutes] = React.useState(5);
    const [seconds, setSeconds] = React.useState(0);
    const [timeLeft, setTimeLeft] = React.useState(300);
    const [isRunning, setIsRunning] = React.useState(false);

    React.useEffect(() => {
        let timer;
        if (isRunning && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0) {
            setIsRunning(false);
            alert('時間到！');
        }
        return () => clearInterval(timer);
    }, [isRunning, timeLeft]);

    const handleStart = () => {
        if (!isRunning && timeLeft === 0) {
            setTimeLeft(minutes * 60 + seconds);
        }
        setIsRunning(true);
    };

    const handleReset = () => {
        setIsRunning(false);
        setTimeLeft(minutes * 60 + seconds);
    };

    const displayMins = Math.floor(timeLeft / 60);
    const displaySecs = timeLeft % 60;

    return (
        <div className="flex-1 bg-gray-50 p-6 overflow-y-auto w-full">
            <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <div className="icon-timer-reset mr-3 text-[var(--primary-color)]"></div>
                    倒數計時器
                </h2>
                
                <div className="text-center py-10">
                    <div className="text-7xl font-bold text-gray-800 font-mono mb-8">
                        {String(displayMins).padStart(2, '0')}:{String(displaySecs).padStart(2, '0')}
                    </div>
                    
                    {!isRunning && (
                        <div className="flex justify-center items-center space-x-4 mb-8">
                            <div className="flex flex-col items-center">
                                <label className="text-sm text-gray-500 mb-1">分鐘</label>
                                <input 
                                    type="number" min="0" max="99" 
                                    value={minutes} 
                                    onChange={e => {setMinutes(parseInt(e.target.value) || 0); setTimeLeft((parseInt(e.target.value) || 0) * 60 + seconds);}}
                                    className="w-20 text-center border-gray-200 rounded-lg"
                                />
                            </div>
                            <div className="text-2xl font-bold">:</div>
                            <div className="flex flex-col items-center">
                                <label className="text-sm text-gray-500 mb-1">秒數</label>
                                <input 
                                    type="number" min="0" max="59" 
                                    value={seconds} 
                                    onChange={e => {setSeconds(parseInt(e.target.value) || 0); setTimeLeft(minutes * 60 + (parseInt(e.target.value) || 0));}}
                                    className="w-20 text-center border-gray-200 rounded-lg"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-center space-x-4">
                        <button 
                            onClick={handleStart}
                            disabled={isRunning}
                            className="px-8 py-3 bg-[var(--primary-color)] text-white rounded-xl hover:bg-[var(--primary-hover)] transition disabled:opacity-50 font-bold shadow-lg shadow-emerald-200"
                        >
                            開始
                        </button>
                        <button 
                            onClick={() => setIsRunning(false)}
                            disabled={!isRunning}
                            className="px-8 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition disabled:opacity-50 font-bold shadow-lg shadow-yellow-200"
                        >
                            暫停
                        </button>
                        <button 
                            onClick={handleReset}
                            className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-bold"
                        >
                            重設
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}