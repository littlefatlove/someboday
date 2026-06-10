function Base64Tool() {
    const [input, setInput] = React.useState('');
    const [output, setOutput] = React.useState('');
    const [error, setError] = React.useState('');

    const handleEncode = () => {
        try { setOutput(btoa(unescape(encodeURIComponent(input)))); setError(''); } 
        catch (e) { setError('編碼失敗'); }
    };

    const handleDecode = () => {
        try { setOutput(decodeURIComponent(escape(atob(input)))); setError(''); } 
        catch (e) { setError('解碼失敗：無效的 Base64 格式'); }
    };

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mr-4">
                        <div className="icon-file-code text-2xl text-slate-600"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Base64 轉換工具</h2>
                </div>
                
                <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="輸入要編碼或解碼的文字..." className="w-full h-32 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-200 outline-none mb-4 custom-scrollbar resize-none"></textarea>
                
                <div className="flex space-x-4 mb-4">
                    <button onClick={handleEncode} className="flex-1 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-900 font-bold shadow-md transition-colors">編碼 (Encode)</button>
                    <button onClick={handleDecode} className="flex-1 py-3 bg-slate-200 text-slate-800 rounded-xl hover:bg-slate-300 font-bold shadow-md transition-colors">解碼 (Decode)</button>
                </div>
                
                {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
                
                <textarea value={output} readOnly placeholder="轉換結果..." className="w-full h-32 p-4 rounded-xl border border-gray-200 bg-gray-50 outline-none custom-scrollbar resize-none"></textarea>
            </div>
        </div>
    );
}