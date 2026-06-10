function NumberBaseConverter() {
    const [dec, setDec] = React.useState('');
    const [hex, setHex] = React.useState('');
    const [bin, setBin] = React.useState('');
    const [oct, setOct] = React.useState('');

    const updateFromDec = (val) => {
        if (val === '') { setDec(''); setHex(''); setBin(''); setOct(''); return; }
        const num = parseInt(val, 10);
        if (isNaN(num)) return;
        setDec(val);
        setHex(num.toString(16).toUpperCase());
        setBin(num.toString(2));
        setOct(num.toString(8));
    };

    const updateFromHex = (val) => {
        setHex(val.toUpperCase());
        if (val === '') { setDec(''); setBin(''); setOct(''); return; }
        const num = parseInt(val, 16);
        if (isNaN(num)) return;
        setDec(num.toString(10));
        setBin(num.toString(2));
        setOct(num.toString(8));
    };

    const updateFromBin = (val) => {
        setBin(val);
        if (val === '') { setDec(''); setHex(''); setOct(''); return; }
        const num = parseInt(val, 2);
        if (isNaN(num)) return;
        setDec(num.toString(10));
        setHex(num.toString(16).toUpperCase());
        setOct(num.toString(8));
    };

    const updateFromOct = (val) => {
        setOct(val);
        if (val === '') { setDec(''); setHex(''); setBin(''); return; }
        const num = parseInt(val, 8);
        if (isNaN(num)) return;
        setDec(num.toString(10));
        setHex(num.toString(16).toUpperCase());
        setBin(num.toString(2));
    };

    const clearAll = () => { setDec(''); setHex(''); setBin(''); setOct(''); };

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                            <div className="icon-binary text-2xl text-green-600"></div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">進制轉換</h2>
                    </div>
                    <button onClick={clearAll} className="text-gray-400 hover:text-green-600 p-2"><div className="icon-trash-2"></div></button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">十進制 (Decimal)</label>
                        <input type="text" value={dec} onChange={e => updateFromDec(e.target.value.replace(/[^0-9-]/g, ''))} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-100 outline-none font-mono" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">十六進制 (Hexadecimal)</label>
                        <input type="text" value={hex} onChange={e => updateFromHex(e.target.value.replace(/[^0-9A-Fa-f-]/g, ''))} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-100 outline-none font-mono uppercase" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">二進制 (Binary)</label>
                        <input type="text" value={bin} onChange={e => updateFromBin(e.target.value.replace(/[^01-]/g, ''))} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-100 outline-none font-mono" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">八進制 (Octal)</label>
                        <input type="text" value={oct} onChange={e => updateFromOct(e.target.value.replace(/[^0-7-]/g, ''))} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-100 outline-none font-mono" />
                    </div>
                </div>
            </div>
        </div>
    );
}