function HashGenerator() {
    const [input, setInput] = React.useState('');
    const [algorithm, setAlgorithm] = React.useState('SHA-256');
    const [hash, setHash] = React.useState('');

    React.useEffect(() => {
        const generateHash = async () => {
            if (!input) {
                setHash('');
                return;
            }
            try {
                const msgBuffer = new TextEncoder().encode(input);
                const hashBuffer = await crypto.subtle.digest(algorithm, msgBuffer);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                setHash(hashHex);
            } catch (err) {
                setHash('生成失敗');
            }
        };
        generateHash();
    }, [input, algorithm]);

    return (
        <div className="flex-1 bg-gray-50 p-6 overflow-y-auto w-full">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <div className="icon-hash mr-3 text-purple-500"></div>
                    雜湊生成器 (Hash)
                </h2>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">輸入文字</label>
                        <textarea 
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="輸入要雜湊的文字..."
                            className="w-full h-32 border-gray-200 rounded-xl focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] resize-none"
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">演算法</label>
                        <select 
                            value={algorithm}
                            onChange={e => setAlgorithm(e.target.value)}
                            className="w-full border-gray-200 rounded-xl focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                        >
                            <option value="SHA-1">SHA-1</option>
                            <option value="SHA-256">SHA-256</option>
                            <option value="SHA-384">SHA-384</option>
                            <option value="SHA-512">SHA-512</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">雜湊結果 (Hex)</label>
                        <div className="relative">
                            <textarea 
                                readOnly
                                value={hash}
                                placeholder="結果將顯示於此..."
                                className="w-full h-24 bg-gray-50 border-gray-200 rounded-xl text-sm font-mono text-gray-600 resize-none pr-12"
                            ></textarea>
                            {hash && (
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(hash);
                                        alert('已複製！');
                                    }}
                                    className="absolute right-3 top-3 p-2 text-gray-400 hover:text-[var(--primary-color)] bg-white rounded-lg shadow-sm"
                                    title="複製"
                                >
                                    <div className="icon-copy"></div>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}