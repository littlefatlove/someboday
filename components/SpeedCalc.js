function SpeedCalc() {
    const [distance, setDistance] = React.useState('');
    const [time, setTime] = React.useState('');
    const [speed, setSpeed] = React.useState('');

    const calcSpeed = () => {
        if(distance && time) setSpeed((distance / time).toFixed(2));
    };

    const calcTime = () => {
        if(distance && speed) setTime((distance / speed).toFixed(2));
    };

    const calcDistance = () => {
        if(speed && time) setDistance((speed * time).toFixed(2));
    };

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="icon-gauge text-4xl text-sky-500 mb-4 mx-auto"></div>
                <h2 className="text-2xl font-bold text-gray-800 mb-8">速度 / 距離 / 時間 計算</h2>

                <div className="space-y-4 mb-8 text-left">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">距離 (例如: km)</label>
                        <input type="number" value={distance} onChange={e => setDistance(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-100" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">時間 (例如: 小時)</label>
                        <input type="number" value={time} onChange={e => setTime(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-100" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">速度 (例如: km/h)</label>
                        <input type="number" value={speed} onChange={e => setSpeed(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-100" />
                    </div>
                </div>

                <div className="flex space-x-3">
                    <button onClick={calcSpeed} className="flex-1 py-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 font-bold transition-colors text-sm">算速度</button>
                    <button onClick={calcTime} className="flex-1 py-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 font-bold transition-colors text-sm">算時間</button>
                    <button onClick={calcDistance} className="flex-1 py-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 font-bold transition-colors text-sm">算距離</button>
                </div>
            </div>
        </div>
    );
}