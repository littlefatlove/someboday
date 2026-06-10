function TipCalculator() {
    const [bill, setBill] = React.useState('');
    const [tipPercent, setTipPercent] = React.useState(10);
    const [people, setPeople] = React.useState(1);

    const tipAmount = (bill * tipPercent) / 100;
    const total = Number(bill) + tipAmount;
    const perPerson = total / (people || 1);

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="icon-coins text-4xl text-yellow-400 mb-4 mx-auto"></div>
                <h2 className="text-2xl font-bold text-gray-800 mb-8">小費計算機</h2>
                
                <div className="space-y-4 mb-8 text-left">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">帳單金額</label>
                        <input type="number" value={bill} onChange={e => setBill(e.target.value)} placeholder="輸入金額..." className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-yellow-100 outline-none" />
                    </div>
                    <div className="py-2">
                        <label className="block text-sm font-bold text-gray-700 mb-3">小費比例 ({tipPercent}%)</label>
                        <input type="range" min="0" max="30" step="1" value={tipPercent} onChange={e => setTipPercent(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">分攤人數</label>
                        <input type="number" min="1" value={people} onChange={e => setPeople(Number(e.target.value))} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-yellow-100 outline-none" />
                    </div>
                </div>

                <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100">
                    <div className="flex justify-between text-yellow-800 mb-2"><span>小費總額:</span> <span className="font-bold">${tipAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between text-yellow-800 mb-2"><span>帳單總計:</span> <span className="font-bold">${total.toFixed(2)}</span></div>
                    <div className="flex justify-between text-xl font-bold text-yellow-600 mt-4 pt-4 border-t border-yellow-200">
                        <span>每人應付:</span> <span>${perPerson.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}