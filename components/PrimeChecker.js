function PrimeChecker() {
    const [num, setNum] = React.useState('');
    const [result, setResult] = React.useState(null);

    const check = () => {
        const n = parseInt(num);
        if (isNaN(n) || n < 2) { setResult(false); return; }
        for (let i = 2, s = Math.sqrt(n); i <= s; i++) {
            if (n % i === 0) { setResult(false); return; }
        }
        setResult(true);
    };

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="icon-hash text-4xl text-rose-500 mb-4 mx-auto"></div>
                <h2 className="text-2xl font-bold text-gray-800 mb-8">質數檢查器</h2>

                <input type="number" value={num} onChange={e => {setNum(e.target.value); setResult(null);}} placeholder="輸入大於 1 的整數..." className="w-full p-4 rounded-xl border border-gray-200 outline-none text-center text-xl mb-6 focus:ring-2 focus:ring-rose-100" />

                <button onClick={check} className="w-full py-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 font-bold shadow-lg shadow-rose-200 mb-6 transition-colors">檢查</button>

                {result !== null && num !== '' && (
                    <div className={`p-6 rounded-2xl border ${result ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                        <div className="text-2xl font-bold">{num}</div>
                        <div className="text-lg mt-2">{result ? '是質數 (Prime Number) !' : '不是質數'}</div>
                    </div>
                )}
            </div>
        </div>
    );
}