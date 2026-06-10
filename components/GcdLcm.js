function GcdLcm() {
    const [num1, setNum1] = React.useState('');
    const [num2, setNum2] = React.useState('');
    const [result, setResult] = React.useState(null);

    const calc = () => {
        let a = Math.abs(parseInt(num1));
        let b = Math.abs(parseInt(num2));
        if (!a || !b) return;

        let tempA = a, tempB = b;
        while (tempB) {
            let t = tempB;
            tempB = tempA % tempB;
            tempA = t;
        }
        const gcd = tempA;
        const lcm = (a * b) / gcd;
        setResult({ gcd, lcm });
    };

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="icon-divide text-4xl text-purple-500 mb-4 mx-auto"></div>
                <h2 className="text-2xl font-bold text-gray-800 mb-8">最大公因數 & 最小公倍數</h2>

                <div className="flex space-x-4 mb-6">
                    <input type="number" value={num1} onChange={e => setNum1(e.target.value)} placeholder="數字 1" className="w-full p-3 rounded-xl border border-gray-200 outline-none text-center" />
                    <input type="number" value={num2} onChange={e => setNum2(e.target.value)} placeholder="數字 2" className="w-full p-3 rounded-xl border border-gray-200 outline-none text-center" />
                </div>

                <button onClick={calc} className="w-full py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 font-bold shadow-lg shadow-purple-200 mb-6 transition-colors">計算</button>

                {result && (
                    <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                        <div className="text-lg text-purple-800 mb-2">最大公因數 (GCD): <span className="font-bold text-2xl ml-2">{result.gcd}</span></div>
                        <div className="text-lg text-purple-800">最小公倍數 (LCM): <span className="font-bold text-2xl ml-2">{result.lcm}</span></div>
                    </div>
                )}
            </div>
        </div>
    );
}