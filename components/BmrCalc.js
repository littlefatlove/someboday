function BmrCalc() {
    const [gender, setGender] = React.useState('male');
    const [age, setAge] = React.useState(25);
    const [height, setHeight] = React.useState(170);
    const [weight, setWeight] = React.useState(65);
    const [bmr, setBmr] = React.useState(null);

    const calc = () => {
        // Mifflin-St Jeor Equation
        let val = (10 * weight) + (6.25 * height) - (5 * age);
        val += gender === 'male' ? 5 : -161;
        setBmr(Math.round(val));
    };

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="icon-flame text-4xl text-red-500 mb-4 mx-auto"></div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">BMR 基礎代謝計算</h2>
                <p className="text-xs text-gray-400 mb-6">了解你每天維持生命所需的最低熱量</p>

                <div className="flex justify-center space-x-4 mb-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" checked={gender === 'male'} onChange={() => setGender('male')} className="text-red-500 focus:ring-red-500" />
                        <span className="font-bold text-gray-700">男性</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" checked={gender === 'female'} onChange={() => setGender('female')} className="text-red-500 focus:ring-red-500" />
                        <span className="font-bold text-gray-700">女性</span>
                    </label>
                </div>

                <div className="space-y-4 mb-6 text-left">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">年齡 (歲)</label>
                        <input type="number" value={age} onChange={e => setAge(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">身高 (公分)</label>
                        <input type="number" value={height} onChange={e => setHeight(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">體重 (公斤)</label>
                        <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 outline-none" />
                    </div>
                </div>

                <button onClick={calc} className="w-full py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 font-bold shadow-lg shadow-red-200 mb-6 transition-colors">計算 BMR</button>

                {bmr && (
                    <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                        <div className="text-sm font-bold text-red-600 mb-1">你的基礎代謝率</div>
                        <div className="text-3xl font-bold text-red-800">{bmr} <span className="text-lg">大卡 (kcal)</span></div>
                    </div>
                )}
            </div>
        </div>
    );
}