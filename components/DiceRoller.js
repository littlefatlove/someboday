function DiceRoller() {
    const [dice, setDice] = React.useState([1]);
    const [isRolling, setIsRolling] = React.useState(false);
    const [count, setCount] = React.useState(1);

    const rollDice = () => {
        setIsRolling(true);
        setTimeout(() => {
            const newDice = Array(count).fill(0).map(() => Math.floor(Math.random() * 6) + 1);
            setDice(newDice);
            setIsRolling(false);
        }, 500);
    };

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="icon-hexagon text-4xl text-orange-400 mb-4 mx-auto"></div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">擲骰子</h2>
                
                <div className="flex justify-center items-center space-x-4 mb-8">
                    <span className="text-gray-600 font-bold">骰子數量:</span>
                    <select value={count} onChange={e => setCount(Number(e.target.value))} className="p-2 rounded-lg border border-gray-200 outline-none">
                        {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} 顆</option>)}
                    </select>
                </div>

                <div className="flex flex-wrap justify-center gap-4 mb-8 min-h-[80px]">
                    {dice.map((val, idx) => (
                        <div key={idx} className={`w-16 h-16 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center text-3xl font-bold shadow-sm border border-orange-200 ${isRolling ? 'animate-spin' : 'animate-bounce'}`}>
                            {val}
                        </div>
                    ))}
                </div>

                {dice.length > 1 && !isRolling && (
                    <div className="text-gray-500 font-bold mb-6">總和: {dice.reduce((a, b) => a + b, 0)}</div>
                )}

                <button onClick={rollDice} disabled={isRolling} className="w-full py-3 bg-orange-400 text-white rounded-xl hover:bg-orange-500 disabled:opacity-50 font-bold shadow-lg shadow-orange-200 transition-colors">
                    {isRolling ? '擲骰中...' : '擲骰子'}
                </button>
            </div>
        </div>
    );
}