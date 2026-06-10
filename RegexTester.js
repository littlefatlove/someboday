function RegexTester() {
    const [regex, setRegex] = React.useState('');
    const [flags, setFlags] = React.useState('g');
    const [text, setText] = React.useState('');
    const [matches, setMatches] = React.useState([]);
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        if (!regex || !text) { setMatches([]); setError(''); return; }
        try {
            const re = new RegExp(regex, flags);
            const m = [...text.matchAll(re)];
            setMatches(m);
            setError('');
        } catch (e) {
            setError(e.message);
            setMatches([]);
        }
    }, [regex, flags, text]);

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 h-full flex flex-col">
                <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                        <div className="icon-code text-2xl text-purple-600"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">正則表達式測試</h2>
                </div>

                <div className="flex space-x-2 mb-4">
                    <div className="flex-1 flex items-center bg-gray-50 rounded-xl border border-gray-200 px-3 focus-within:ring-2 focus-within:ring-purple-100">
                        <span className="text-gray-400 font-mono text-lg">/</span>
                        <input type="text" value={regex} onChange={e => setRegex(e.target.value)} placeholder="正則表達式..." className="w-full bg-transparent p-3 outline-none font-mono text-purple-700" />
                        <span className="text-gray-400 font-mono text-lg">/</span>
                    </div>
                    <input type="text" value={flags} onChange={e => setFlags(e.target.value)} placeholder="flags" className="w-20 bg-gray-50 p-3 rounded-xl border border-gray-200 outline-none font-mono text-purple-700 text-center focus:ring-2 focus:ring-purple-100" />
                </div>

                {error && <div className="text-red-500 text-sm mb-4 font-mono">{error}</div>}

                <textarea value={text} onChange={e => setText(e.target.value)} placeholder="輸入測試文本..." className="w-full h-32 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-100 outline-none mb-4 custom-scrollbar resize-none font-mono text-sm"></textarea>

                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="text-sm font-bold text-gray-500 mb-3">匹配結果 ({matches.length})</div>
                    {matches.length > 0 ? (
                        <ul className="space-y-2">
                            {matches.map((m, i) => (
                                <li key={i} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm font-mono text-sm break-all">
                                    <span className="text-purple-600 font-bold mr-2">#{i+1}</span>
                                    {m[0]} <span className="text-gray-400 text-xs ml-2">(Index: {m.index})</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-gray-400 text-sm italic">無匹配項目</div>
                    )}
                </div>
            </div>
        </div>
    );
}