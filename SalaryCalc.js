function SalaryCalc() {
    const [amount, setAmount] = React.useState(50000);
    const [type, setType] = React.useState('monthly'); // hourly, daily, monthly, yearly
    
    // Assumptions
    const hoursPerDay = 8;
    const daysPerMonth = 22;
    const monthsPerYear = 12;

    const calculate = () => {
        let baseHourly = 0;
        let val = Number(amount);
        if (!val) return null;
        
        if (type === 'hourly') baseHourly = val;
        else if (type === 'daily') baseHourly = val / hoursPerDay;
        else if (type === 'monthly') baseHourly = val / (daysPerMonth * hoursPerDay);
        else if (type === 'yearly') baseHourly = val / (monthsPerYear * daysPerMonth * hoursPerDay);

        return {
            hourly: baseHourly,
            daily: baseHourly * hoursPerDay,
            monthly: baseHourly * hoursPerDay * daysPerMonth,
            yearly: baseHourly * hoursPerDay * daysPerMonth * monthsPerYear
        };
    };

    const result = calculate();

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="icon-banknote text-4xl text-teal-500 mb-4 mx-auto"></div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">薪資換算</h2>
                <p className="text-xs text-gray-400 mb-6">假設: 每天 8 小時, 每月 22 個工作日</p>

                <div className="flex space-x-2 mb-4">
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="flex-1 p-3 rounded-xl border border-gray-200 outline-none" />
                    <select value={type} onChange={e => setType(e.target.value)} className="w-24 p-3 rounded-xl border border-gray-200 outline-none bg-gray-50">
                        <option value="hourly">時薪</option>
                        <option value="daily">日薪</option>
                        <option value="monthly">月薪</option>
                        <option value="yearly">年薪</option>
                    </select>
                </div>

                {result && (
                    <div className="bg-teal-50 p-6 rounded-2xl border border-teal-100 text-left space-y-3 mt-6">
                        <div className="flex justify-between"><span className="text-teal-700">時薪:</span> <span className="font-bold">${Math.round(result.hourly).toLocaleString()}</span></div>
                        <div className="flex justify-between"><span className="text-teal-700">日薪:</span> <span className="font-bold">${Math.round(result.daily).toLocaleString()}</span></div>
                        <div className="flex justify-between"><span className="text-teal-700">月薪:</span> <span className="font-bold">${Math.round(result.monthly).toLocaleString()}</span></div>
                        <div className="flex justify-between pt-3 border-t border-teal-200"><span className="text-teal-800 font-bold">年薪:</span> <span className="font-bold text-teal-800">${Math.round(result.yearly).toLocaleString()}</span></div>
                    </div>
                )}
            </div>
        </div>
    );
}