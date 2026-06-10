function MorseCode() {
    const [input, setInput] = React.useState('');
    const [output, setOutput] = React.useState('');
    
    const morseDict = {
        'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---',
        'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-',
        'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--', 'Z': '--..',
        '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
        '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...',
        ':': '---...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-', '"': '.-..-.', '$': '...-..-', '@': '...-.-', ' ': '/'
    };
    const reverseDict = Object.fromEntries(Object.entries(morseDict).map(([k, v]) => [v, k]));

    const encode = () => {
        setOutput(input.toUpperCase().split('').map(c => morseDict[c] || c).join(' '));
    };

    const decode = () => {
        setOutput(input.split(' ').map(c => reverseDict[c] || c).join('').replace(/\//g, ' '));
    };

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mr-4">
                        <div className="icon-radio text-2xl text-slate-700"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">摩斯密碼</h2>
                </div>
                
                <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="輸入文字或摩斯密碼 (單字用斜線 / 隔開)..." className="w-full h-32 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-200 outline-none mb-4 custom-scrollbar resize-none"></textarea>
                
                <div className="flex space-x-4 mb-4">
                    <button onClick={encode} className="flex-1 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-800 font-bold shadow-md transition-colors">編碼 (Encode)</button>
                    <button onClick={decode} className="flex-1 py-3 bg-slate-200 text-slate-800 rounded-xl hover:bg-slate-300 font-bold shadow-md transition-colors">解碼 (Decode)</button>
                </div>
                
                <textarea value={output} readOnly placeholder="轉換結果..." className="w-full h-32 p-4 rounded-xl border border-gray-200 bg-gray-50 outline-none custom-scrollbar resize-none"></textarea>
            </div>
        </div>
    );
}