function TallyCounter() {
    const [count, setCount] = React.useState(0);

    return (
        <div className="flex-1 bg-gray-50 p-6 overflow-y-auto w-full">
            <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center justify-center">
                    <div className="icon-calculator mr-3 text-blue-500"></div>
                    計數器
                </h2>
                
                <div className="text-8xl font-bold text-gray-800 my-10 font-mono tracking-tighter">
                    {count}
                </div>
                
                <div className="flex justify-center items-center space-x-6 mb-8">
                    <button 
                        onClick={() => setCount(c => c - 1)}
                        className="w-16 h-16 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center text-3xl hover:bg-red-200 transition-colors shadow-sm"
                    >
                        -
                    </button>
                    <button 
                        onClick={() => setCount(0)}
                        className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors font-bold"
                    >
                        重設
                    </button>
                    <button 
                        onClick={() => setCount(c => c + 1)}
                        className="w-16 h-16 bg-[var(--primary-color)] text-white rounded-2xl flex items-center justify-center text-3xl hover:bg-[var(--primary-hover)] transition-colors shadow-lg shadow-emerald-200"
                    >
                        +
                    </button>
                </div>
            </div>
        </div>
    );
}