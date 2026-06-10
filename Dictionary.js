function Dictionary() {
    const [word, setWord] = React.useState('');
    const [result, setResult] = React.useState(null);
    const [loading, setLoading] = React.useState(false);

    const searchWord = async (e) => {
        e.preventDefault();
        if (!word.trim()) return;
        
        setLoading(true);
        try {
            const systemPrompt = "你是一本精通多國語言的 AI 字典。請提供該詞彙的：1. 語言與詞性 2. 解釋與翻譯 3. 兩個例句。請用排版簡潔的格式回答，無需寒暄。";
            const response = await invokeAIAgent(systemPrompt, word);
            setResult(response);
        } catch (error) {
            setResult('查詢失敗，請稍後再試。');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center mb-8">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                        <div className="icon-book-open text-2xl text-blue-500"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">AI 字典</h2>
                </div>

                <form onSubmit={searchWord} className="relative mb-8">
                    <input 
                        type="text" 
                        value={word} 
                        onChange={e => setWord(e.target.value)} 
                        placeholder="輸入要查詢的單字或句子..." 
                        className="w-full pl-5 pr-14 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none shadow-sm"
                    />
                    <button type="submit" disabled={loading} className="absolute right-2 top-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50">
                        {loading ? <div className="icon-loader animate-spin"></div> : <div className="icon-search"></div>}
                    </button>
                </form>

                {result && (
                    <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                        <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm md:text-base">
                            {result}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}