function TextToSpeech() {
    const [text, setText] = React.useState('');
    const [isSpeaking, setIsSpeaking] = React.useState(false);

    const speak = () => {
        if (!text.trim() || !window.speechSynthesis) return;
        
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
    };

    const stop = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    };

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-4">
                        <div className="icon-mic text-2xl text-orange-500"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">文字轉語音</h2>
                </div>

                <textarea 
                    value={text} 
                    onChange={e => setText(e.target.value)} 
                    placeholder="在此輸入要朗讀的文字..." 
                    className="w-full h-48 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-100 outline-none mb-6 custom-scrollbar resize-none text-gray-700 leading-relaxed"
                ></textarea>

                <div className="flex space-x-4">
                    <button 
                        onClick={speak} 
                        disabled={isSpeaking || !text.trim()}
                        className="flex-1 py-4 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 font-bold shadow-lg shadow-orange-200 transition-colors flex items-center justify-center"
                    >
                        <div className="icon-play mr-2"></div> 播放語音
                    </button>
                    {isSpeaking && (
                        <button onClick={stop} className="px-6 py-4 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 font-bold transition-colors">
                            停止
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}