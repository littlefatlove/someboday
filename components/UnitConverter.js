function UnitConverter() {
    const [category, setCategory] = React.useState('length');
    const [inputValue, setInputValue] = React.useState('');
    const [fromUnit, setFromUnit] = React.useState('m');
    const [toUnit, setToUnit] = React.useState('cm');

    const units = {
        length: {
            title: '長度',
            items: {
                m: { name: '公尺 (m)', rate: 1 },
                cm: { name: '公分 (cm)', rate: 100 },
                km: { name: '公里 (km)', rate: 0.001 },
                inch: { name: '英吋 (in)', rate: 39.3701 },
                ft: { name: '英呎 (ft)', rate: 3.28084 }
            }
        },
        weight: {
            title: '重量',
            items: {
                kg: { name: '公斤 (kg)', rate: 1 },
                g: { name: '公克 (g)', rate: 1000 },
                lb: { name: '磅 (lb)', rate: 2.20462 },
                oz: { name: '盎司 (oz)', rate: 35.274 }
            }
        },
        temp: {
            title: '溫度',
            items: {
                c: { name: '攝氏 (°C)' },
                f: { name: '華氏 (°F)' }
            }
        }
    };

    React.useEffect(() => {
        // Reset default units when category changes
        const keys = Object.keys(units[category].items);
        setFromUnit(keys[0]);
        setToUnit(keys[1] || keys[0]);
        setInputValue('');
    }, [category]);

    const calculateResult = () => {
        if (!inputValue || isNaN(inputValue)) return '';
        const val = parseFloat(inputValue);

        if (category === 'temp') {
            if (fromUnit === 'c' && toUnit === 'f') return ((val * 9/5) + 32).toFixed(2);
            if (fromUnit === 'f' && toUnit === 'c') return ((val - 32) * 5/9).toFixed(2);
            return val.toFixed(2);
        }

        const baseVal = val / units[category].items[fromUnit].rate;
        const result = baseVal * units[category].items[toUnit].rate;
        
        // Handle floating point precision safely
        return Number.isInteger(result) ? result.toString() : result.toFixed(4).replace(/\.?0+$/, '');
    };

    const handleSwap = () => {
        setFromUnit(toUnit);
        setToUnit(fromUnit);
    };

    return (
        <div className="flex-1 bg-gray-50 flex items-center justify-center p-6 overflow-y-auto">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 w-full max-w-md">
                <div className="flex items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                        <div className="icon-arrow-right-left mr-2 text-[var(--primary-color)]"></div>
                        單位換算
                    </h2>
                </div>

                <div className="flex space-x-2 mb-6 p-1 bg-gray-50 rounded-xl border border-gray-100">
                    {Object.keys(units).map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${category === cat ? 'bg-white text-[var(--primary-color)] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {units[cat].title}
                        </button>
                    ))}
                </div>

                <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <div className="text-xs font-bold text-gray-400 mb-2">來源單位</div>
                        <div className="flex space-x-3">
                            <input 
                                type="number" 
                                value={inputValue} 
                                onChange={(e) => setInputValue(e.target.value)} 
                                placeholder="0"
                                className="w-2/3 bg-white border border-gray-200 rounded-xl px-3 py-2 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-100" 
                            />
                            <select 
                                value={fromUnit} 
                                onChange={(e) => setFromUnit(e.target.value)}
                                className="w-1/3 bg-white border border-gray-200 rounded-xl px-2 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-100"
                            >
                                {Object.keys(units[category].items).map(k => (
                                    <option key={k} value={k}>{units[category].items[k].name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-center -my-2 relative z-10">
                        <button onClick={handleSwap} className="p-2 bg-[var(--primary-color)] text-white rounded-full shadow-md shadow-emerald-200 hover:bg-[var(--primary-hover)] transition-transform hover:scale-110 active:scale-95">
                            <div className="icon-arrow-up-down"></div>
                        </button>
                    </div>

                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                        <div className="text-xs font-bold text-emerald-600 mb-2">目標單位</div>
                        <div className="flex space-x-3">
                            <div className="w-2/3 bg-white border border-emerald-200 rounded-xl px-3 py-2 font-bold text-gray-800 flex items-center overflow-x-auto">
                                {calculateResult() || '0'}
                            </div>
                            <select 
                                value={toUnit} 
                                onChange={(e) => setToUnit(e.target.value)}
                                className="w-1/3 bg-white border border-emerald-200 rounded-xl px-2 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-100"
                            >
                                {Object.keys(units[category].items).map(k => (
                                    <option key={k} value={k}>{units[category].items[k].name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}