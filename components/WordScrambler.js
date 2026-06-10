function WordScrambler() {
    const [input, setInput] = React.useState('');
    const [output, setOutput] = React.useState('');
    const [mode, setMode] = React.useState('words'); // words, chars

    const scramble = () => {
        if (!input.trim()) return;
        
        let result = '';
        if (mode === 'words') {
            result = input.split(' ').sort(() => Math.random() - 0.5).join(' ');
        } else {
            result = input.split('').sort(() => Math.random() - 0.5).join('');
        }
        setOutput(result);
    };

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mr-4">
                        <div className="icon-shuffle text-2xl text-yellow-600"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">文字打亂器</h2>
                </div>

                <div className="flex justify-center space-x-4 mb-6">
                    <label className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                        <input type="radio" checked={mode === 'words'} onChange={() => setMode('words')} className="text-yellow-600 focus:ring-yellow-500" />
                        <span className="font-bold text-gray-700">打亂單字/詞彙順序</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                        <input type="radio" checked={mode === 'chars'} onChange={() => setMode('chars')} className="text-yellow-600 focus:ring-yellow-500" />
                        <span className="font-bold text-gray-700">打亂所有字元</span>
                    </label>
                </div>

                <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="輸入要打亂的文字..." className="w-full h-32 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-yellow-100 outline-none mb-4 custom-scrollbar resize-none"></textarea>
                
                <button onClick={scramble} className="w-full py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 font-bold shadow-lg shadow-yellow-200 mb-4 transition-colors">
                    隨機打亂
                </button>

                <textarea value={output} readOnly placeholder="結果..." className="w-full h-32 p-4 rounded-xl border border-gray-200 bg-gray-50 outline-none custom-scrollbar resize-none text-gray-700"></textarea>
            </div>
        </div>
    );
}