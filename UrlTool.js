function UrlTool() {
    const [input, setInput] = React.useState('');
    const [output, setOutput] = React.useState('');

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mr-4">
                        <div className="icon-link text-2xl text-cyan-600"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">URL 編解碼轉換</h2>
                </div>
                
                <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="輸入 URL 或字串..." className="w-full h-32 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-100 outline-none mb-4 custom-scrollbar resize-none"></textarea>
                
                <div className="flex space-x-4 mb-6">
                    <button onClick={() => setOutput(encodeURIComponent(input))} className="flex-1 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 font-bold shadow-md transition-colors">URL Encode</button>
                    <button onClick={() => setOutput(decodeURIComponent(input))} className="flex-1 py-3 bg-slate-200 text-slate-800 rounded-xl hover:bg-slate-300 font-bold shadow-md transition-colors">URL Decode</button>
                </div>
                
                <textarea value={output} readOnly placeholder="轉換結果..." className="w-full h-32 p-4 rounded-xl border border-gray-200 bg-gray-50 outline-none custom-scrollbar resize-none"></textarea>
            </div>
        </div>
    );
}