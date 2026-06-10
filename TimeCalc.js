function TimeCalc() {
    const [time, setTime] = React.useState('12:00');
    const [addHrs, setAddHrs] = React.useState(0);
    const [addMins, setAddMins] = React.useState(0);
    const [result, setResult] = React.useState('');

    React.useEffect(() => {
        if(!time) return;
        const [h, m] = time.split(':').map(Number);
        let date = new Date();
        date.setHours(h, m, 0);
        date.setHours(date.getHours() + Number(addHrs));
        date.setMinutes(date.getMinutes() + Number(addMins));
        setResult(date.toTimeString().slice(0,5));
    }, [time, addHrs, addMins]);

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="icon-clock-4 text-4xl text-fuchsia-500 mb-4 mx-auto"></div>
                <h2 className="text-2xl font-bold text-gray-800 mb-8">時間加減計算</h2>

                <div className="space-y-6 text-left mb-8">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">起始時間</label>
                        <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-fuchsia-100" />
                    </div>
                    <div className="flex space-x-4">
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-700 mb-2">加/減 (小時)</label>
                            <input type="number" value={addHrs} onChange={e => setAddHrs(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 outline-none text-center" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-700 mb-2">加/減 (分鐘)</label>
                            <input type="number" value={addMins} onChange={e => setAddMins(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 outline-none text-center" />
                        </div>
                    </div>
                </div>

                <div className="bg-fuchsia-50 p-6 rounded-2xl border border-fuchsia-100 text-fuchsia-800">
                    <div className="text-sm font-bold text-fuchsia-600 mb-2">結果時間</div>
                    <div className="text-5xl font-bold">{result}</div>
                </div>
            </div>
        </div>
    );
}