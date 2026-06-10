function PercentageCalc() {
    const [a, setA] = React.useState('');
    const [b, setB] = React.useState('');
    
    const [x, setX] = React.useState('');
    const [y, setY] = React.useState('');

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center justify-center mb-8">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mr-4">
                        <div className="icon-percent text-2xl text-emerald-500"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">百分比計算機</h2>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-6">
                    <div className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                        <input type="number" value={a} onChange={e => setA(e.target.value)} className="w-20 p-2 mr-2 border rounded-lg" placeholder="A" />
                        是
                        <input type="number" value={b} onChange={e => setB(e.target.value)} className="w-20 p-2 mx-2 border rounded-lg" placeholder="B" />
                        的多少百分比？
                    </div>
                    <div className="text-xl font-bold text-emerald-600">
                        {a && b && Number(b) !== 0 ? ((Number(a) / Number(b)) * 100).toFixed(2) + '%' : '-'}
                    </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                    <div className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                        <input type="number" value={x} onChange={e => setX(e.target.value)} className="w-24 p-2 mr-2 border rounded-lg" placeholder="X" />
                        的
                        <input type="number" value={y} onChange={e => setY(e.target.value)} className="w-20 p-2 mx-2 border rounded-lg" placeholder="Y" />
                        % 是多少？
                    </div>
                    <div className="text-xl font-bold text-emerald-600">
                        {x && y ? ((Number(x) * Number(y)) / 100).toFixed(2) : '-'}
                    </div>
                </div>
            </div>
        </div>
    );
}