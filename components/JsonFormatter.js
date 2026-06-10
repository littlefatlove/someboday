function JsonFormatter() {
    const [input, setInput] = React.useState('');
    const [error, setError] = React.useState('');

    const formatJson = () => {
        if (!input.trim()) return;
        try {
            const parsed = JSON.parse(input);
            setInput(JSON.stringify(parsed, null, 4));
            setError('');
        } catch (e) {
            setError(e.message);
        }
    };

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                            <div className="icon-braces text-2xl text-blue-600"></div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">JSON 格式化</h2>
                    </div>
                    <button onClick={formatJson} className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-md transition-colors">格式化</button>
                </div>
                
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-100 font-mono">{error}</div>}
                
                <textarea 
                    value={input} 
                    onChange={e => setInput(e.target.value)} 
                    placeholder='貼上 JSON 內容... 例如: {"name": "Test"}' 
                    className="flex-1 w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none font-mono text-sm custom-scrollbar min-h-[300px] resize-none whitespace-pre"
                    spellCheck="false"
                ></textarea>
            </div>
        </div>
    );
}