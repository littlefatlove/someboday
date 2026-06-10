function CoinFlipper() {
    const [result, setResult] = React.useState('heads');
    const [isFlipping, setIsFlipping] = React.useState(false);

    const flipCoin = () => {
        setIsFlipping(true);
        setTimeout(() => {
            setResult(Math.random() > 0.5 ? 'heads' : 'tails');
            setIsFlipping(false);
        }, 800);
    };

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto flex items-center">
            <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center w-full">
                <h2 className="text-2xl font-bold text-gray-800 mb-10">擲硬幣</h2>
                
                <div className="flex justify-center mb-10 perspective-[1000px]">
                    <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center text-3xl font-bold shadow-xl transition-all duration-700 ${isFlipping ? 'rotate-y-[1800deg] scale-125' : ''} ${result === 'heads' ? 'bg-yellow-400 border-yellow-500 text-white' : 'bg-gray-200 border-gray-400 text-gray-700'}`}>
                        {result === 'heads' ? '正面' : '反面'}
                    </div>
                </div>

                <button onClick={flipCoin} disabled={isFlipping} className="w-full py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 disabled:opacity-50 font-bold shadow-lg shadow-yellow-200 transition-colors">
                    拋擲硬幣
                </button>
            </div>
        </div>
    );
}