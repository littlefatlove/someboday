function CalendarApp() {
    const [currentDate, setCurrentDate] = React.useState(new Date());

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const today = new Date();

    const isToday = (day) => {
        return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    };

    const days = [];
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }
    for (let d = 1; d <= daysInMonth; d++) {
        days.push(
            <div key={`day-${d}`} className={`aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-colors cursor-pointer ${isToday(d) ? 'bg-[var(--primary-color)] text-white shadow-md shadow-emerald-200' : 'hover:bg-emerald-50 text-gray-700'}`}>
                {d}
            </div>
        );
    }

    const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
    const dayNames = ["日", "一", "二", "三", "四", "五", "六"];

    return (
        <div className="flex-1 bg-gray-50 flex flex-col items-center p-6 overflow-y-auto">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                        <div className="icon-calendar mr-2 text-[var(--primary-color)]"></div>
                        行事曆
                    </h2>
                    <button onClick={() => setCurrentDate(new Date())} className="text-xs bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-100 transition-colors">今天</button>
                </div>
                
                <div className="flex items-center justify-between mb-6 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                    <button onClick={prevMonth} className="p-2 hover:bg-white rounded-xl transition-colors text-gray-500"><div className="icon-chevron-left"></div></button>
                    <div className="font-bold text-gray-800 text-lg">{year}年 {monthNames[month]}</div>
                    <button onClick={nextMonth} className="p-2 hover:bg-white rounded-xl transition-colors text-gray-500"><div className="icon-chevron-right"></div></button>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-gray-400">
                    {dayNames.map(day => <div key={day}>{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {days}
                </div>
            </div>
        </div>
    );
}