function RandomNumber() {
    const [min, setMin] = React.useState(1);
    const [max, setMax] = React.useState(100);
    const [result, setResult] = React.useState(null);

    const generate = () => {
        const minNum = parseInt(min);
        const maxNum = parseInt(max);
        if (minNum >= maxNum) {
            alert('最小值必須小於最大值');
            return;
        }
        const random = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
        setResult(random);
    };

    return (
        <div className="flex-1 bg-gray-50 p-6 overflow-y-auto w-full">
            <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <div className="icon-dices mr-3 text-green-500"></div>
                    隨機亂數生成器
                </h2>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm text-gray-600 mb-2">最小值</label>
                        <input 
                            type="number" 
                            value={min} 
                            onChange={e => setMin(e.target.value)}
                            className="w-full border-gray-200 rounded-xl focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-2">最大值</label>
                        <input 
                            type="number" 
                            value={max} 
                            onChange={e => setMax(e.target.value)}
                            className="w-full border-gray-200 rounded-xl focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                        />
                    </div>
                </div>

                <button 
                    onClick={generate}
                    className="w-full py-4 bg-[var(--primary-color)] text-white rounded-xl hover:bg-[var(--primary-hover)] transition font-bold shadow-md shadow-emerald-200 mb-8"
                >
                    產生亂數
                </button>

                {result !== null && (
                    <div className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="text-sm text-gray-500 mb-2">結果</div>
                        <div className="text-6xl font-bold text-[var(--primary-color)]">{result}</div>
                    </div>
                )}
            </div>
        </div>
    );
}