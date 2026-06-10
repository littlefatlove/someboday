function CaseConvert() {
    const [text, setText] = React.useState('');

    const applyCase = (type) => {
        if (!text) return;
        let res = text;
        switch(type) {
            case 'upper': res = text.toUpperCase(); break;
            case 'lower': res = text.toLowerCase(); break;
            case 'camel': 
                res = text.replace(/(?:^\w|[A-Z]|\b\w)/g, (w, i) => i === 0 ? w.toLowerCase() : w.toUpperCase()).replace(/\s+/g, '');
                break;
            case 'pascal': 
                res = text.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase()).replace(/\s+/g, '');
                break;
            case 'snake':
                res = text.replace(/\s+/g, '_').toLowerCase();
                break;
            case 'kebab':
                res = text.replace(/\s+/g, '-').toLowerCase();
                break;
        }
        setText(res);
    };

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mr-4">
                        <div className="icon-type text-2xl text-indigo-500"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">大小寫轉換</h2>
                </div>

                <textarea value={text} onChange={e => setText(e.target.value)} placeholder="輸入文字..." className="w-full h-40 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-100 outline-none mb-6 custom-scrollbar resize-none"></textarea>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <button onClick={() => applyCase('upper')} className="p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 font-bold text-gray-700 transition-colors text-sm">UPPERCASE</button>
                    <button onClick={() => applyCase('lower')} className="p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 font-bold text-gray-700 transition-colors text-sm">lowercase</button>
                    <button onClick={() => applyCase('camel')} className="p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 font-bold text-gray-700 transition-colors text-sm">camelCase</button>
                    <button onClick={() => applyCase('pascal')} className="p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 font-bold text-gray-700 transition-colors text-sm">PascalCase</button>
                    <button onClick={() => applyCase('snake')} className="p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 font-bold text-gray-700 transition-colors text-sm">snake_case</button>
                    <button onClick={() => applyCase('kebab')} className="p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 font-bold text-gray-700 transition-colors text-sm">kebab-case</button>
                </div>
            </div>
        </div>
    );
}