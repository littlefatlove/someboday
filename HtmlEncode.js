function HtmlEncode() {
    const [input, setInput] = React.useState('');
    const [output, setOutput] = React.useState('');

    const encode = () => {
        const div = document.createElement('div');
        div.innerText = input;
        setOutput(div.innerHTML);
    };

    const decode = () => {
        const div = document.createElement('div');
        div.innerHTML = input;
        setOutput(div.textContent || div.innerText || '');
    };

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mr-4">
                        <div className="icon-code text-2xl text-slate-600"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">HTML 編碼/解碼</h2>
                </div>
                
                <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="輸入 HTML 標籤或文字..." className="w-full h-32 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-200 outline-none mb-4 custom-scrollbar resize-none font-mono text-sm"></textarea>
                
                <div className="flex space-x-4 mb-4">
                    <button onClick={encode} className="flex-1 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-800 font-bold shadow-md transition-colors">編碼 (Encode)</button>
                    <button onClick={decode} className="flex-1 py-3 bg-slate-200 text-slate-800 rounded-xl hover:bg-slate-300 font-bold shadow-md transition-colors">解碼 (Decode)</button>
                </div>
                
                <textarea value={output} readOnly placeholder="轉換結果..." className="w-full h-32 p-4 rounded-xl border border-gray-200 bg-gray-50 outline-none custom-scrollbar resize-none font-mono text-sm text-gray-700"></textarea>
            </div>
        </div>
    );
}