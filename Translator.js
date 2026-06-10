function Translator({ updateUserPoints }) {
    const [sourceText, setSourceText] = React.useState('');
    const [translatedText, setTranslatedText] = React.useState('');
    const [targetLang, setTargetLang] = React.useState('English');
    const [isLoading, setIsLoading] = React.useState(false);

    const languages = [
        { code: 'English', name: '英文 (English)' },
        { code: 'Traditional Chinese', name: '繁體中文' },
        { code: 'Simplified Chinese', name: '簡體中文' },
        { code: 'Japanese', name: '日文 (日本語)' },
        { code: 'Korean', name: '韓文 (한국어)' },
        { code: 'Spanish', name: '西班牙文 (Español)' },
        { code: 'French', name: '法文 (Français)' },
        { code: 'German', name: '德文 (Deutsch)' },
    ];

    const handleTranslate = async () => {
        if (!sourceText.trim() || isLoading) return;

        if (updateUserPoints) {
            const hasPoints = await updateUserPoints(-1, '使用 AI 翻譯');
            if (!hasPoints) return;
        }
        
        setIsLoading(true);
        try {
            const systemPrompt = `You are a professional, highly accurate translator. Your task is to translate the user's text into ${targetLang}. Return ONLY the translated text, without any explanations, quotes, or markdown formatting.`;
            const result = await window.invokeAIAgent(systemPrompt, sourceText);
            setTranslatedText(result);
        } catch (error) {
            console.error("Translation error:", error);
            setTranslatedText("翻譯失敗，請稍後再試。");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (translatedText) {
            navigator.clipboard.writeText(translatedText);
            alert("已複製翻譯結果！");
        }
    };

    const handleClear = () => {
        setSourceText('');
        setTranslatedText('');
    };

    return (
        <div className="flex-1 bg-gray-50 p-6 overflow-y-auto w-full">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                        <div className="icon-languages mr-3 text-[var(--primary-color)]"></div>
                        AI 翻譯工具
                    </h2>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
                    {/* Source Area */}
                    <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-bold text-gray-700">自動偵測語言</span>
                            <button onClick={handleClear} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                                清除
                            </button>
                        </div>
                        <textarea
                            value={sourceText}
                            onChange={(e) => setSourceText(e.target.value)}
                            placeholder="請輸入要翻譯的文字..."
                            className="flex-1 min-h-[200px] w-full resize-none border-none focus:ring-0 p-0 text-gray-700 bg-transparent custom-scrollbar text-lg"
                        ></textarea>
                    </div>

                    {/* Target Area */}
                    <div className="flex-1 p-6 flex flex-col bg-gray-50/30">
                        <div className="flex justify-between items-center mb-4">
                            <select 
                                value={targetLang}
                                onChange={(e) => setTargetLang(e.target.value)}
                                className="bg-white border border-gray-200 text-gray-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[var(--primary-color)] font-bold text-sm"
                            >
                                {languages.map(lang => (
                                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                                ))}
                            </select>
                            
                            {translatedText && (
                                <button onClick={handleCopy} className="text-gray-400 hover:text-[var(--primary-color)] transition-colors p-1" title="複製">
                                    <div className="icon-copy text-lg"></div>
                                </button>
                            )}
                        </div>
                        <div className="flex-1 min-h-[200px] w-full relative">
                            {isLoading ? (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="flex flex-col items-center text-emerald-500">
                                        <div className="icon-loader animate-spin text-3xl mb-2"></div>
                                        <span className="text-sm font-medium">翻譯中...</span>
                                    </div>
                                </div>
                            ) : (
                                <textarea
                                    value={translatedText}
                                    readOnly
                                    placeholder="翻譯結果將顯示於此..."
                                    className="w-full h-full resize-none border-none focus:ring-0 p-0 text-gray-800 bg-transparent custom-scrollbar text-lg"
                                ></textarea>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button 
                        onClick={handleTranslate}
                        disabled={!sourceText.trim() || isLoading}
                        className="px-8 py-3 bg-[var(--primary-color)] text-white rounded-xl shadow-lg shadow-emerald-200 hover:bg-[var(--primary-hover)] transition-all font-bold text-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="icon-arrow-right-left mr-2"></div>
                        立即翻譯
                    </button>
                </div>
            </div>
        </div>
    );
}