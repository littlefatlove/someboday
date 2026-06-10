function LoremGen() {
    const [paras, setParas] = React.useState(3);
    const [text, setText] = React.useState('');

    const generate = () => {
        const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
        let res = [];
        for(let i=0; i<paras; i++) {
            res.push(lorem);
        }
        setText(res.join('\n\n'));
    };

    React.useEffect(() => { generate(); }, []);

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center mr-4">
                        <div className="icon-file-text text-2xl text-stone-600"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">假文產生器</h2>
                </div>

                <div className="flex items-center space-x-4 mb-6">
                    <span className="font-bold text-gray-700">段落數:</span>
                    <input type="number" min="1" max="50" value={paras} onChange={e => setParas(Number(e.target.value))} className="w-24 p-2 rounded-lg border border-gray-200 outline-none" />
                    <button onClick={generate} className="px-4 py-2 bg-stone-600 text-white rounded-lg hover:bg-stone-700 font-bold transition-colors">產生</button>
                    <button onClick={() => { navigator.clipboard.writeText(text); alert('複製成功!'); }} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-bold transition-colors flex items-center"><div className="icon-copy mr-2"></div>複製全部</button>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 min-h-[300px] whitespace-pre-wrap text-gray-600 leading-relaxed">
                    {text}
                </div>
            </div>
        </div>
    );
}