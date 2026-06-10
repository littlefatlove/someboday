function WaterTracker() {
    const [current, setCurrent] = React.useState(() => {
        return parseInt(localStorage.getItem('water_current') || '0');
    });
    const goal = 2000; // 2000 ml per day

    React.useEffect(() => {
        localStorage.setItem('water_current', current.toString());
    }, [current]);

    const addWater = (amount) => {
        setCurrent(prev => prev + amount);
    };

    const reset = () => {
        if(confirm('確定要重設今日進度嗎？')) setCurrent(0);
    };

    const percentage = Math.min((current / goal) * 100, 100);

    return (
        <div className="flex-1 bg-gray-50 p-6 overflow-y-auto w-full">
            <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center">
                    <div className="icon-droplet mr-3 text-cyan-500 fill-cyan-500"></div>
                    每日喝水紀錄
                </h2>
                <p className="text-sm text-gray-500 mb-8">目標：{goal} ml</p>
                
                <div className="relative w-48 h-48 mx-auto mb-8 rounded-full border-8 border-gray-100 flex items-center justify-center overflow-hidden bg-white shadow-inner">
                    <div 
                        className="absolute bottom-0 left-0 right-0 bg-cyan-400 transition-all duration-1000 ease-in-out opacity-80"
                        style={{ height: `${percentage}%` }}
                    ></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <span className="text-4xl font-bold text-gray-800">{current}</span>
                        <span className="text-sm text-gray-500 font-bold mt-1">ml</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <button 
                        onClick={() => addWater(250)}
                        className="p-4 bg-cyan-50 text-cyan-700 rounded-2xl hover:bg-cyan-100 transition font-bold shadow-sm"
                    >
                        + 250 ml<br/><span className="text-xs font-normal">一杯水</span>
                    </button>
                    <button 
                        onClick={() => addWater(500)}
                        className="p-4 bg-blue-50 text-blue-700 rounded-2xl hover:bg-blue-100 transition font-bold shadow-sm"
                    >
                        + 500 ml<br/><span className="text-xs font-normal">一瓶水</span>
                    </button>
                </div>

                <button 
                    onClick={reset}
                    className="text-sm text-gray-400 hover:text-red-500 transition-colors underline"
                >
                    重設進度
                </button>
            </div>
        </div>
    );
}