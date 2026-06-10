function CsvToJson() {
    const [csv, setCsv] = React.useState('');
    const [json, setJson] = React.useState('');

    const convert = () => {
        if (!csv.trim()) {
            setJson('');
            return;
        }
        try {
            const lines = csv.split('\n').filter(line => line.trim());
            if (lines.length < 2) {
                setJson('[]\n// 需要標題列和至少一行資料');
                return;
            }
            const headers = lines[0].split(',').map(h => h.trim());
            const result = [];

            for (let i = 1; i < lines.length; i++) {
                const obj = {};
                const currentline = lines[i].split(',');

                for (let j = 0; j < headers.length; j++) {
                    obj[headers[j]] = currentline[j] ? currentline[j].trim() : '';
                }
                result.push(obj);
            }
            setJson(JSON.stringify(result, null, 4));
        } catch (e) {
            setJson('解析錯誤，請確認 CSV 格式。');
        }
    };

    return (
        <div className="flex-1 bg-gray-50 p-6 overflow-y-auto w-full">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <div className="icon-file-json mr-3 text-yellow-500"></div>
                    CSV 轉 JSON
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-bold text-gray-700">CSV 內容</label>
                            <button onClick={() => setCsv('')} className="text-xs text-red-500 hover:underline">清空</button>
                        </div>
                        <textarea 
                            value={csv}
                            onChange={e => setCsv(e.target.value)}
                            placeholder="name,age,city&#10;Alice,25,Taipei&#10;Bob,30,Tainan"
                            className="w-full h-96 border-gray-200 rounded-xl focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] font-mono text-sm resize-none whitespace-pre"
                        ></textarea>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-bold text-gray-700">JSON 結果</label>
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(json);
                                    alert('已複製 JSON！');
                                }}
                                className="text-xs text-[var(--primary-color)] hover:underline"
                            >
                                複製結果
                            </button>
                        </div>
                        <textarea 
                            readOnly
                            value={json}
                            placeholder="結果將顯示於此..."
                            className="w-full h-96 bg-gray-50 border-gray-200 rounded-xl font-mono text-sm text-gray-700 resize-none whitespace-pre"
                        ></textarea>
                    </div>
                </div>

                <div className="mt-6 flex justify-center">
                    <button 
                        onClick={convert}
                        className="px-10 py-3 bg-[var(--primary-color)] text-white rounded-xl hover:bg-[var(--primary-hover)] transition font-bold shadow-lg shadow-emerald-200"
                    >
                        轉換
                    </button>
                </div>
            </div>
        </div>
    );
}