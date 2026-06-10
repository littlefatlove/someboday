function HabitTracker({ currentUser }) {
    const [habits, setHabits] = React.useState([]);
    const [newHabit, setNewHabit] = React.useState('');

    React.useEffect(() => {
        if (currentUser) {
            const saved = localStorage.getItem(`habits_${currentUser.objectId}`);
            if (saved) setHabits(JSON.parse(saved));
        }
    }, [currentUser]);

    const saveHabits = (newHabits) => {
        setHabits(newHabits);
        if (currentUser) localStorage.setItem(`habits_${currentUser.objectId}`, JSON.stringify(newHabits));
    };

    const addHabit = (e) => {
        e.preventDefault();
        if (!newHabit.trim()) return;
        saveHabits([...habits, { id: Date.now(), name: newHabit, streak: 0, lastDone: null }]);
        setNewHabit('');
    };

    const markDone = (id) => {
        const today = new Date().toDateString();
        saveHabits(habits.map(h => {
            if (h.id === id) {
                if (h.lastDone === today) return h; // Already done today
                const isYesterday = new Date(h.lastDone).getTime() === new Date(Date.now() - 86400000).setHours(0,0,0,0);
                return { ...h, streak: isYesterday ? h.streak + 1 : 1, lastDone: today };
            }
            return h;
        }));
    };

    const deleteHabit = (id) => saveHabits(habits.filter(h => h.id !== id));

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center mb-8">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mr-4">
                        <div className="icon-calendar-check text-2xl text-emerald-500"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">習慣追蹤</h2>
                </div>

                <form onSubmit={addHabit} className="flex space-x-2 mb-8">
                    <input 
                        type="text" value={newHabit} onChange={e => setNewHabit(e.target.value)} 
                        placeholder="新增一個好習慣，例如：喝水 2000cc" 
                        className="flex-1 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-100 outline-none"
                    />
                    <button type="submit" className="px-6 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 font-bold shadow-md shadow-emerald-200">新增</button>
                </form>

                <div className="space-y-4">
                    {habits.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">尚未建立任何習慣，現在就開始吧！</div>
                    ) : habits.map(h => {
                        const isDoneToday = h.lastDone === new Date().toDateString();
                        return (
                            <div key={h.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group">
                                <div className="flex items-center flex-1">
                                    <button 
                                        onClick={() => markDone(h.id)}
                                        disabled={isDoneToday}
                                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${isDoneToday ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 text-transparent hover:border-emerald-400'}`}
                                    >
                                        <div className="icon-check text-sm font-bold"></div>
                                    </button>
                                    <div>
                                        <div className={`font-bold ${isDoneToday ? 'text-emerald-700 line-through opacity-70' : 'text-gray-800'}`}>{h.name}</div>
                                        <div className="text-xs text-gray-500 mt-1 flex items-center">
                                            <div className="icon-flame mr-1 text-orange-400"></div> 連續 {h.streak} 天
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => deleteHabit(h.id)} className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="icon-trash-2"></div>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}