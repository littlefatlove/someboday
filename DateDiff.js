function DateDiff() {
    const [start, setStart] = React.useState('');
    const [end, setEnd] = React.useState('');
    const [diff, setDiff] = React.useState(null);

    const calculate = () => {
        if (!start || !end) return;
        const d1 = new Date(start);
        const d2 = new Date(end);
        const timeDiff = Math.abs(d2.getTime() - d1.getTime());
        const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        setDiff(diffDays);
    };

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="icon-calendar-range text-4xl text-indigo-500 mb-4 mx-auto"></div>
                <h2 className="text-2xl font-bold text-gray-800 mb-8">日期相距計算</h2>

                <div className="space-y-4 mb-6 text-left">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">開始日期</label>
                        <input type="date" value={start} onChange={e => setStart(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">結束日期</label>
                        <input type="date" value={end} onChange={e => setEnd(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100" />
                    </div>
                </div>

                <button onClick={calculate} disabled={!start || !end} className="w-full py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 disabled:opacity-50 font-bold shadow-lg shadow-indigo-200 mb-8 transition-colors">
                    計算天數
                </button>

                {diff !== null && (
                    <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 text-indigo-800">
                        <div className="text-sm text-indigo-600 mb-2 font-bold">相距天數:</div>
                        <div className="text-4xl font-bold">{diff} <span className="text-xl">天</span></div>
                    </div>
                )}
            </div>
        </div>
    );
}