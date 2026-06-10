function MarginCalc() {
    const [cost, setCost] = React.useState('');
    const [revenue, setRevenue] = React.useState('');
    const [margin, setMargin] = React.useState('');
    const [profit, setProfit] = React.useState('');

    const calcFromRevenue = (rev) => {
        setRevenue(rev);
        if (cost && rev) {
            const p = rev - cost;
            setProfit(p);
            setMargin(((p / rev) * 100).toFixed(2));
        }
    };

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="icon-dollar-sign text-4xl text-green-500 mb-4 mx-auto"></div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">毛利計算機</h2>

                <div className="space-y-4 mb-6 text-left">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">成本 (Cost)</label>
                        <input type="number" value={cost} onChange={e => {setCost(e.target.value); calcFromRevenue(revenue);}} placeholder="輸入成本..." className="w-full p-3 rounded-xl border border-gray-200 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">售價/營收 (Revenue)</label>
                        <input type="number" value={revenue} onChange={e => calcFromRevenue(e.target.value)} placeholder="輸入售價..." className="w-full p-3 rounded-xl border border-gray-200 outline-none" />
                    </div>
                </div>

                {margin !== '' && (
                    <div className="bg-green-50 p-6 rounded-2xl border border-green-100 text-left">
                        <div className="flex justify-between mb-2"><span className="text-green-700">毛利潤 (Profit):</span> <span className="font-bold text-green-800">${profit}</span></div>
                        <div className="flex justify-between pt-2 border-t border-green-200"><span className="text-green-600 font-bold">毛利率 (Margin):</span> <span className="font-bold text-green-600">{margin}%</span></div>
                    </div>
                )}
            </div>
        </div>
    );
}