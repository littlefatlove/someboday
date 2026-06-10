function AspectRatioCalc() {
    const [w1, setW1] = React.useState('1920');
    const [h1, setH1] = React.useState('1080');
    const [w2, setW2] = React.useState('');
    const [h2, setH2] = React.useState('');

    const calcW2 = (newH2) => {
        setH2(newH2);
        if(w1 && h1 && newH2) setW2(Math.round((newH2 * w1) / h1));
    };

    const calcH2 = (newW2) => {
        setW2(newW2);
        if(w1 && h1 && newW2) setH2(Math.round((newW2 * h1) / w1));
    };

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="icon-monitor text-4xl text-blue-500 mb-4 mx-auto"></div>
                <h2 className="text-2xl font-bold text-gray-800 mb-8">長寬比計算機</h2>
                
                <div className="bg-blue-50 p-4 rounded-xl mb-6">
                    <div className="text-sm text-blue-800 font-bold mb-3">原始比例</div>
                    <div className="flex items-center space-x-4">
                        <input type="number" value={w1} onChange={e => setW1(e.target.value)} className="w-full p-2 rounded-lg border border-blue-200 text-center" placeholder="寬 (W1)" />
                        <span className="font-bold text-blue-400">:</span>
                        <input type="number" value={h1} onChange={e => setH1(e.target.value)} className="w-full p-2 rounded-lg border border-blue-200 text-center" placeholder="高 (H1)" />
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="text-sm text-gray-600 font-bold mb-3">目標尺寸</div>
                    <div className="flex items-center space-x-4">
                        <input type="number" value={w2} onChange={e => calcH2(e.target.value)} className="w-full p-2 rounded-lg border border-gray-300 text-center focus:ring-2 focus:ring-blue-100 outline-none" placeholder="新寬度 (W2)" />
                        <span className="font-bold text-gray-400">:</span>
                        <input type="number" value={h2} onChange={e => calcW2(e.target.value)} className="w-full p-2 rounded-lg border border-gray-300 text-center focus:ring-2 focus:ring-blue-100 outline-none" placeholder="新高度 (H2)" />
                    </div>
                </div>
                
                <div className="mt-8 flex justify-center">
                    <div 
                        className="border-2 border-blue-400 bg-blue-100 flex items-center justify-center text-blue-500 font-bold text-xs"
                        style={{ width: '100%', aspectRatio: `${w1}/${h1}`, maxHeight: '150px' }}
                    >
                        {w1} x {h1}
                    </div>
                </div>
            </div>
        </div>
    );
}