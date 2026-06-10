function TextCounter() {
    const [text, setText] = React.useState('');

    const stats = React.useMemo(() => {
        const trimmed = text.trim();
        const chars = text.length;
        const noSpaces = text.replace(/\s/g, '').length;
        const words = trimmed ? trimmed.split(/\s+/).length : 0;
        const lines = text ? text.split(/\n/).length : 0;
        return { chars, noSpaces, words, lines };
    }, [text]);

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center mb-8">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mr-4">
                        <div className="icon-whole-word text-2xl text-indigo-500"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">字數統計</h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                        <div className="text-sm text-gray-500 mb-1">總字元數</div>
                        <div className="text-2xl font-bold text-indigo-600">{stats.chars}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                        <div className="text-sm text-gray-500 mb-1">不含空白</div>
                        <div className="text-2xl font-bold text-indigo-600">{stats.noSpaces}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                        <div className="text-sm text-gray-500 mb-1">單字數</div>
                        <div className="text-2xl font-bold text-indigo-600">{stats.words}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                        <div className="text-sm text-gray-500 mb-1">行數</div>
                        <div className="text-2xl font-bold text-indigo-600">{stats.lines}</div>
                    </div>
                </div>

                <textarea 
                    value={text} 
                    onChange={e => setText(e.target.value)} 
                    placeholder="在此貼上或輸入文字進行統計..." 
                    className="w-full h-64 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-100 outline-none resize-none text-sm leading-relaxed custom-scrollbar"
                ></textarea>
                
                <div className="flex justify-end mt-4">
                    <button onClick={() => setText('')} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors font-bold">
                        清空內容
                    </button>
                </div>
            </div>
        </div>
    );
}