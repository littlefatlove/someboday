function BMICalculator() {
    const [height, setHeight] = React.useState('');
    const [weight, setWeight] = React.useState('');
    const [bmi, setBmi] = React.useState(null);

    const calculate = () => {
        const h = parseFloat(height) / 100;
        const w = parseFloat(weight);
        if (h > 0 && w > 0) {
            setBmi((w / (h * h)).toFixed(1));
        }
    };

    const getStatus = () => {
        if (!bmi) return null;
        if (bmi < 18.5) return { text: '體重過輕', color: 'text-blue-500' };
        if (bmi < 24) return { text: '健康體重', color: 'text-green-500' };
        if (bmi < 27) return { text: '過重', color: 'text-yellow-500' };
        return { text: '肥胖', color: 'text-red-500' };
    };

    const status = getStatus();

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="icon-activity text-4xl text-lime-500 mb-4 mx-auto"></div>
                <h2 className="text-2xl font-bold text-gray-800 mb-8">BMI 計算機</h2>
                
                <div className="space-y-4 mb-8 text-left">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">身高 (公分)</label>
                        <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="例如：170" className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-lime-100 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">體重 (公斤)</label>
                        <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="例如：65" className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-lime-100 outline-none" />
                    </div>
                </div>

                <button onClick={calculate} className="w-full py-3 bg-lime-500 text-white rounded-xl hover:bg-lime-600 transition-colors font-bold shadow-lg shadow-lime-200 mb-8">
                    計算 BMI
                </button>

                {bmi && (
                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="text-sm text-gray-500 mb-1">你的 BMI 指數</div>
                        <div className="text-5xl font-bold text-gray-800 mb-2">{bmi}</div>
                        <div className={`text-lg font-bold ${status.color}`}>{status.text}</div>
                    </div>
                )}
            </div>
        </div>
    );
}