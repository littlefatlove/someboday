function UUIDGen() {
    const [uuids, setUuids] = React.useState([]);

    const generate = () => {
        const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        setUuids([uuid, ...uuids].slice(0, 10)); // keep last 10
    };

    const copy = (text) => {
        navigator.clipboard.writeText(text);
        alert('已複製 UUID!');
    };

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="icon-fingerprint text-4xl text-teal-500 mb-4 mx-auto"></div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">UUID 產生器</h2>

                <button onClick={generate} className="w-full py-4 bg-teal-500 text-white rounded-xl hover:bg-teal-600 font-bold shadow-lg shadow-teal-200 mb-8 transition-transform active:scale-95 flex items-center justify-center text-lg">
                    <div className="icon-plus mr-2"></div> 產生新 UUID
                </button>

                {uuids.length > 0 && (
                    <div className="text-left space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                        <div className="text-sm font-bold text-gray-500 mb-2">最近產生 (最多10筆)</div>
                        {uuids.map((id, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100 group hover:border-teal-200 transition-colors">
                                <span className="font-mono text-gray-700 text-sm select-all">{id}</span>
                                <button onClick={() => copy(id)} className="text-gray-400 hover:text-teal-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="icon-copy"></div>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}