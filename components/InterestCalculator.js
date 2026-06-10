function InterestCalculator() {
    const [principal, setPrincipal] = React.useState(10000);
    const [rate, setRate] = React.useState(5);
    const [years, setYears] = React.useState(10);
    const [addition, setAddition] = React.useState(0);
    const [result, setResult] = React.useState(null);

    const calculate = () => {
        let total = Number(principal);
        const r = Number(rate) / 100;
        const y = Number(years);
        const add = Number(addition);

        for (let i = 0; i < y; i++) {
            total = total * (1 + r) + add * 12; // Assume monthly addition
        }
        
        const totalInvested = Number(principal) + (add * 12 * y);
        const interest = total - totalInvested;
        setResult({ total, totalInvested, interest });
    };

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="icon-trending-up text-4xl text-emerald-500 mb-4 mx-auto"></div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">複利計算機</h2>

                <div className="space-y-4 mb-6 text-left">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">初始本金</label>
                        <input type="number" value={principal} onChange={e => setPrincipal(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">年利率 (%)</label>
                        <input type="number" value={rate} onChange={e => setRate(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">投資年限</label>
                        <input type="number" value={years} onChange={e => setYears(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">每月定期定額</label>
                        <input type="number" value={addition} onChange={e => setAddition(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 outline-none" />
                    </div>
                </div>

                <button onClick={calculate} className="w-full py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 font-bold shadow-lg shadow-emerald-200 mb-6 transition-colors">
                    計算
                </button>

                {result && (
                    <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 text-left">
                        <div className="flex justify-between mb-2"><span className="text-emerald-700">期末總金額:</span> <span className="font-bold text-emerald-800">${Math.round(result.total).toLocaleString()}</span></div>
                        <div className="flex justify-between mb-2"><span className="text-gray-600">總投入本金:</span> <span className="font-bold text-gray-700">${Math.round(result.totalInvested).toLocaleString()}</span></div>
                        <div className="flex justify-between pt-2 border-t border-emerald-200"><span className="text-emerald-600 font-bold">總獲利(利息):</span> <span className="font-bold text-emerald-600">+${Math.round(result.interest).toLocaleString()}</span></div>
                    </div>
                )}
            </div>
        </div>
    );
}