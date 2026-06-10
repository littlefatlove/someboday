function AgeCalculator() {
    const [dob, setDob] = React.useState('');
    const [result, setResult] = React.useState(null);

    const calculate = () => {
        if (!dob) return;
        const birthDate = new Date(dob);
        const today = new Date();
        
        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();
        let days = today.getDate() - birthDate.getDate();

        if (days < 0) {
            months--;
            const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            days += prevMonth.getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        setResult({ years, months, days });
    };

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="icon-calendar-days text-4xl text-rose-400 mb-4 mx-auto"></div>
                <h2 className="text-2xl font-bold text-gray-800 mb-8">年齡計算機</h2>

                <div className="mb-6 text-left">
                    <label className="block text-sm font-bold text-gray-700 mb-2">出生日期</label>
                    <input type="date" value={dob} onChange={e => setDob(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-rose-100" />
                </div>

                <button onClick={calculate} disabled={!dob} className="w-full py-3 bg-rose-400 text-white rounded-xl hover:bg-rose-500 disabled:opacity-50 font-bold shadow-lg shadow-rose-200 mb-8 transition-colors">
                    計算年齡
                </button>

                {result && (
                    <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 text-rose-800">
                        <div className="text-sm text-rose-600 mb-2 font-bold">你的精確年齡為:</div>
                        <div className="text-3xl font-bold mb-2">{result.years} <span className="text-lg">歲</span> {result.months} <span className="text-lg">個月</span> {result.days} <span className="text-lg">天</span></div>
                    </div>
                )}
            </div>
        </div>
    );
}