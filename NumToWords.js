function NumToWords() {
    const [num, setNum] = React.useState('');
    const [words, setWords] = React.useState('');

    const convert = (n) => {
        const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
        const b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];

        if ((n = n.toString()).length > 9) return 'Overflow';
        n = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
        if (!n) return; let str = '';
        str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
        str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
        str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
        str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
        str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
        return str.trim() || 'Zero';
    };

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="icon-spell-check text-4xl text-cyan-500 mb-4 mx-auto"></div>
                <h2 className="text-2xl font-bold text-gray-800 mb-8">數字轉英文文字</h2>

                <input type="number" value={num} onChange={e => {setNum(e.target.value); setWords(convert(e.target.value));}} className="w-full p-4 rounded-xl border border-gray-200 outline-none text-2xl text-center mb-6 focus:ring-2 focus:ring-cyan-100" placeholder="輸入數字..." />

                <div className="bg-cyan-50 p-6 rounded-2xl border border-cyan-100 min-h-[100px] flex items-center justify-center">
                    <p className="text-xl font-bold text-cyan-800 capitalize leading-relaxed">{words}</p>
                </div>
            </div>
        </div>
    );
}