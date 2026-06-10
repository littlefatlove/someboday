function LoanCalc() {
    const [amount, setAmount] = React.useState(1000000);
    const [rate, setRate] = React.useState(2);
    const [years, setYears] = React.useState(20);
    const [result, setResult] = React.useState(null);

    const calculate = () => {
        const p = Number(amount);
        const r = Number(rate) / 100 / 12;
        const n = Number(years) * 12;
        if (p && r && n) {
            const monthly = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
            const totalPay = monthly * n;
            const totalInt = totalPay - p;
            setResult({ monthly, totalPay, totalInt });
        }
    };

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="icon-landmark text-4xl text-blue-600 mb-4 mx-auto"></div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">貸款計算機 (本息攤還)</h2>

                <div className="space-y-4 mb-6 text-left">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">貸款總額</label>
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">年利率 (%)</label>
                        <input type="number" value={rate} onChange={e => setRate(e.target.value)} step="0.1" className="w-full p-3 rounded-xl border border-gray-200 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">貸款年限 (年)</label>
                        <input type="number" value={years} onChange={e => setYears(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 outline-none" />
                    </div>
                </div>

                <button onClick={calculate} className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-200 mb-6 transition-colors">
                    計算
                </button>

                {result && (
                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-left">
                        <div className="flex justify-between mb-2"><span className="text-blue-700">每月應繳:</span> <span className="font-bold text-blue-800">${Math.round(result.monthly).toLocaleString()}</span></div>
                        <div className="flex justify-between mb-2"><span className="text-gray-600">總利息:</span> <span className="font-bold text-gray-700">${Math.round(result.totalInt).toLocaleString()}</span></div>
                        <div className="flex justify-between pt-2 border-t border-blue-200"><span className="text-blue-600 font-bold">應繳總額:</span> <span className="font-bold text-blue-600">${Math.round(result.totalPay).toLocaleString()}</span></div>
                    </div>
                )}
            </div>
        </div>
    );
}