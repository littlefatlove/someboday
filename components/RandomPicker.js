function RandomPicker() {
    const [items, setItems] = React.useState('');
    const [result, setResult] = React.useState('');
    const [isPicking, setIsPicking] = React.useState(false);

    const pickRandom = () => {
        const list = items.split('\n').map(i => i.trim()).filter(i => i);
        if (list.length === 0) return;
        
        setIsPicking(true);
        setResult('...');
        
        let count = 0;
        const interval = setInterval(() => {
            setResult(list[Math.floor(Math.random() * list.length)]);
            count++;
            if (count > 20) {
                clearInterval(interval);
                setIsPicking(false);
            }
        }, 50);
    };

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="icon-dices text-4xl text-purple-400 mb-4 mx-auto"></div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">隨機抽籤</h2>

                <div className="mb-6">
                    <textarea 
                        value={items} 
                        onChange={e => setItems(e.target.value)} 
                        placeholder="輸入選項，每行一個..." 
                        className="w-full h-32 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-100 outline-none resize-none text-sm"
                    ></textarea>
                </div>

                <button 
                    onClick={pickRandom} 
                    disabled={isPicking || !items.trim()}
                    className="w-full py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 disabled:opacity-50 transition-colors font-bold shadow-lg shadow-purple-200 mb-8"
                >
                    開始抽籤
                </button>

                {result && (
                    <div className="p-8 bg-purple-50 rounded-2xl border border-purple-100">
                        <div className="text-sm text-purple-400 mb-2 font-bold">抽籤結果</div>
                        <div className={`text-3xl font-bold text-purple-700 break-all ${isPicking ? 'animate-pulse' : 'animate-bounce'}`}>{result}</div>
                    </div>
                )}
            </div>
        </div>
    );
}