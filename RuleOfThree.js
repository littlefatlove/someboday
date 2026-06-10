function RuleOfThree() {
    const [a, setA] = React.useState('');
    const [b, setB] = React.useState('');
    const [c, setC] = React.useState('');
    const [x, setX] = React.useState('');

    const calc = () => {
        if(a && b && c && Number(a) !== 0) {
            setX((Number(b) * Number(c)) / Number(a));
        }
    };

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="icon-equal text-4xl text-orange-500 mb-4 mx-auto"></div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">比例計算 (三數定律)</h2>
                <p className="text-sm text-gray-500 mb-8">如果 A = B, 那麼 C = X</p>

                <div className="grid grid-cols-2 gap-6 mb-8 text-left">
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-1">A</label>
                        <input type="number" value={a} onChange={e => setA(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 text-center outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-1">B</label>
                        <input type="number" value={b} onChange={e => setB(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 text-center outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-1">C</label>
                        <input type="number" value={c} onChange={e => setC(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 text-center outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-orange-500 mb-1">X (結果)</label>
                        <input type="text" value={x} readOnly className="w-full p-3 rounded-xl border-2 border-orange-200 bg-orange-50 text-orange-700 font-bold text-center outline-none" />
                    </div>
                </div>

                <button onClick={calc} className="w-full py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 font-bold shadow-lg shadow-orange-200 transition-colors">
                    計算 X
                </button>
            </div>
        </div>
    );
}