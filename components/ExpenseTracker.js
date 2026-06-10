function ExpenseTracker() {
    const [expenses, setExpenses] = React.useState(() => {
        try {
            const saved = localStorage.getItem('chat_expenses');
            return saved ? JSON.parse(saved) : [];
        } catch(e) { return []; }
    });
    const [desc, setDesc] = React.useState('');
    const [amount, setAmount] = React.useState('');
    const [type, setType] = React.useState('expense');

    React.useEffect(() => {
        localStorage.setItem('chat_expenses', JSON.stringify(expenses));
    }, [expenses]);

    const handleAdd = (e) => {
        e.preventDefault();
        if (!desc || !amount) return;
        const newRecord = {
            id: Date.now().toString(),
            desc,
            amount: parseFloat(amount),
            type,
            date: new Date().toISOString()
        };
        setExpenses([newRecord, ...expenses]);
        setDesc('');
        setAmount('');
    };

    const handleDelete = (id) => {
        setExpenses(expenses.filter(e => e.id !== id));
    };

    const totalIncome = expenses.filter(e => e.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = expenses.filter(e => e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const balance = totalIncome - totalExpense;

    return (
        <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                        <div className="icon-wallet mr-3 text-[var(--primary-color)]"></div>
                        簡易記帳本
                    </h2>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
                        <div className="text-gray-400 text-xs font-bold mb-1">總收入</div>
                        <div className="text-emerald-500 font-bold text-xl">${totalIncome.toLocaleString()}</div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
                        <div className="text-gray-400 text-xs font-bold mb-1">總支出</div>
                        <div className="text-red-500 font-bold text-xl">${totalExpense.toLocaleString()}</div>
                    </div>
                    <div className={`p-4 rounded-2xl shadow-sm border border-gray-100 text-center ${balance >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                        <div className="text-gray-500 text-xs font-bold mb-1">結餘</div>
                        <div className={`font-bold text-xl ${balance >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>${balance.toLocaleString()}</div>
                    </div>
                </div>

                <form onSubmit={handleAdd} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-3">
                    <select value={type} onChange={(e) => setType(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100">
                        <option value="expense">支出</option>
                        <option value="income">收入</option>
                    </select>
                    <input type="text" placeholder="項目描述..." value={desc} onChange={(e) => setDesc(e.target.value)} className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100" />
                    <input type="number" placeholder="金額" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full md:w-32 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100" min="0" step="any" />
                    <button type="submit" disabled={!desc || !amount} className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-xl font-bold hover:bg-[var(--primary-hover)] transition-colors shadow-sm disabled:opacity-50">新增</button>
                </form>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {expenses.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">尚無記帳紀錄</div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {expenses.map((item) => (
                                <li key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div>
                                        <div className="font-bold text-gray-800">{item.desc}</div>
                                        <div className="text-xs text-gray-400 mt-0.5">{new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString()}</div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className={`font-bold tabular-nums ${item.type === 'income' ? 'text-emerald-500' : 'text-gray-800'}`}>
                                            {item.type === 'income' ? '+' : '-'}${item.amount.toLocaleString()}
                                        </span>
                                        <button onClick={() => handleDelete(item.id)} className="text-gray-300 hover:text-red-500 p-1">
                                            <div className="icon-trash-2 text-sm"></div>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}