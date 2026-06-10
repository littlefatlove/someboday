function RomanNumeral() {
    const [arab, setArab] = React.useState('');
    const [roman, setRoman] = React.useState('');

    const toRoman = (num) => {
        if(num < 1 || num > 3999) return "超出範圍 (1-3999)";
        const lookup = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1};
        let romanStr = '';
        for (let i in lookup ) {
            while ( num >= lookup[i] ) {
                romanStr += i;
                num -= lookup[i];
            }
        }
        return romanStr;
    };

    const toArab = (str) => {
        str = str.toUpperCase();
        const lookup = {I:1,V:5,X:10,L:50,C:100,D:500,M:1000};
        let arabNum = 0, i = str.length;
        while (i--) {
            if (lookup[str[i]] < lookup[str[i+1]]) arabNum -= lookup[str[i]];
            else arabNum += lookup[str[i]];
        }
        return arabNum || "無效輸入";
    };

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="icon-columns-2 text-4xl text-stone-500 mb-4 mx-auto"></div>
                <h2 className="text-2xl font-bold text-gray-800 mb-8">羅馬數字轉換</h2>

                <div className="space-y-6 text-left">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">阿拉伯數字 (1-3999)</label>
                        <input type="number" value={arab} onChange={e => {setArab(e.target.value); setRoman(toRoman(parseInt(e.target.value)));}} className="w-full p-3 rounded-xl border border-gray-200 outline-none" placeholder="輸入數字..." />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">羅馬數字 (I, V, X, L, C, D, M)</label>
                        <input type="text" value={roman} onChange={e => {setRoman(e.target.value.toUpperCase()); setArab(toArab(e.target.value));}} className="w-full p-3 rounded-xl border border-gray-200 outline-none uppercase font-mono" placeholder="輸入羅馬數字..." />
                    </div>
                </div>
            </div>
        </div>
    );
}