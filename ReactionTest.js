function ReactionTest() {
    // states: waiting, ready, clicked, result
    const [gameState, setGameState] = React.useState('waiting');
    const [startTime, setStartTime] = React.useState(0);
    const [result, setResult] = React.useState(null);
    const timeoutRef = React.useRef(null);

    const start = () => {
        setGameState('ready');
        setResult(null);
        const randomDelay = Math.floor(Math.random() * 3000) + 2000; // 2s to 5s
        timeoutRef.current = setTimeout(() => {
            setGameState('clicked');
            setStartTime(Date.now());
        }, randomDelay);
    };

    const handleClick = () => {
        if (gameState === 'waiting' || gameState === 'result') {
            start();
        } else if (gameState === 'ready') {
            clearTimeout(timeoutRef.current);
            setGameState('result');
            setResult('太早按了！');
        } else if (gameState === 'clicked') {
            const time = Date.now() - startTime;
            setGameState('result');
            setResult(`${time} 毫秒`);
        }
    };

    React.useEffect(() => {
        return () => clearTimeout(timeoutRef.current);
    }, []);

    let bgColor = 'bg-blue-500 hover:bg-blue-600';
    let text = '點擊開始';
    
    if (gameState === 'ready') {
        bgColor = 'bg-red-500';
        text = '等畫面變綠色...';
    } else if (gameState === 'clicked') {
        bgColor = 'bg-green-500';
        text = '馬上點擊！';
    } else if (gameState === 'result') {
        bgColor = 'bg-blue-500 hover:bg-blue-600';
        text = typeof result === 'string' && result.includes('早') ? result + ' (點擊重試)' : `反應時間：${result} (點擊重試)`;
    }

    return (
        <div className="flex-1 bg-gray-50 p-6 overflow-y-auto w-full flex flex-col">
            <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
                <div className="absolute top-6 left-6 flex items-center z-10">
                    <div className="icon-zap mr-2 text-white/80"></div>
                    <span className="font-bold text-white/80 mix-blend-difference">反應力測試</span>
                </div>
                
                <div 
                    className={`flex-1 flex items-center justify-center cursor-pointer transition-colors duration-200 select-none ${bgColor}`}
                    onMouseDown={handleClick}
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-white text-center px-4">
                        {text}
                    </h2>
                </div>
            </div>
        </div>
    );
}