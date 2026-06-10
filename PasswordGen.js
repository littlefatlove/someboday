function PasswordGen() {
    const [password, setPassword] = React.useState('');
    const [length, setLength] = React.useState(16);
    const [options, setOptions] = React.useState({ uppercase: true, lowercase: true, numbers: true, symbols: true });

    const generatePassword = React.useCallback(() => {
        let charset = '';
        if (options.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (options.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
        if (options.numbers) charset += '0123456789';
        if (options.symbols) charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';
        
        if (!charset) return setPassword('');
        
        let res = '';
        for (let i = 0; i < length; i++) {
            res += charset[Math.floor(Math.random() * charset.length)];
        }
        setPassword(res);
    }, [length, options]);

    React.useEffect(() => { generatePassword(); }, [generatePassword]);

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mr-4">
                        <div className="icon-key text-2xl text-slate-600"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">密碼產生器</h2>
                </div>

                <div className="relative mb-8">
                    <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-center text-xl font-mono text-gray-800 break-all select-all">
                        {password || '請選擇至少一個條件'}
                    </div>
                    <button 
                        onClick={() => {
                            navigator.clipboard.writeText(password);
                            alert('密碼已複製！');
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        <div className="icon-copy"></div>
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>密碼長度</span>
                            <span className="font-bold">{length}</span>
                        </div>
                        <input 
                            type="range" min="8" max="32" value={length} 
                            onChange={(e) => setLength(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-slate-600"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { id: 'uppercase', label: '大寫字母 (A-Z)' },
                            { id: 'lowercase', label: '小寫字母 (a-z)' },
                            { id: 'numbers', label: '數字 (0-9)' },
                            { id: 'symbols', label: '特殊符號 (!@#)' }
                        ].map(opt => (
                            <label key={opt.id} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                                <input 
                                    type="checkbox" 
                                    checked={options[opt.id]}
                                    onChange={(e) => setOptions({...options, [opt.id]: e.target.checked})}
                                    className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                                />
                                <span className="text-sm text-gray-700">{opt.label}</span>
                            </label>
                        ))}
                    </div>
                    <button 
                        onClick={generatePassword}
                        className="w-full py-3 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-colors font-bold shadow-lg shadow-slate-200 flex items-center justify-center"
                    >
                        <div className="icon-refresh-cw mr-2 text-sm"></div> 重新產生
                    </button>
                </div>
            </div>
        </div>
    );
}