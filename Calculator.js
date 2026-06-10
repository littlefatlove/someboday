function Calculator() {
    const [display, setDisplay] = React.useState('0');
    const [equation, setEquation] = React.useState('');
    const [waitingForOperand, setWaitingForOperand] = React.useState(false);
    const [operator, setOperator] = React.useState(null);
    const [value, setValue] = React.useState(null);

    const inputDigit = (digit) => {
        if (waitingForOperand) {
            setDisplay(String(digit));
            setWaitingForOperand(false);
        } else {
            setDisplay(display === '0' ? String(digit) : display + digit);
        }
    };

    const inputDot = () => {
        if (waitingForOperand) {
            setDisplay('0.');
            setWaitingForOperand(false);
        } else if (display.indexOf('.') === -1) {
            setDisplay(display + '.');
        }
    };

    const clearAll = () => {
        setDisplay('0');
        setEquation('');
        setWaitingForOperand(false);
        setOperator(null);
        setValue(null);
    };

    const performOperation = (nextOperator) => {
        const inputValue = parseFloat(display);

        if (value == null) {
            setValue(inputValue);
            setEquation(`${inputValue} ${nextOperator}`);
        } else if (operator) {
            const currentValue = value || 0;
            let newValue = currentValue;
            
            if (operator === '+') newValue = currentValue + inputValue;
            else if (operator === '-') newValue = currentValue - inputValue;
            else if (operator === '*') newValue = currentValue * inputValue;
            else if (operator === '/') newValue = currentValue / inputValue;

            setValue(newValue);
            setDisplay(String(newValue));
            setEquation(`${newValue} ${nextOperator === '=' ? '' : nextOperator}`);
        }

        setWaitingForOperand(true);
        if (nextOperator !== '=') {
            setOperator(nextOperator);
        } else {
            setOperator(null);
        }
    };

    const buttons = [
        { label: 'C', onClick: clearAll, className: 'col-span-2 bg-red-100 text-red-500 hover:bg-red-200' },
        { label: '⌫', onClick: () => setDisplay(display.length > 1 ? display.slice(0, -1) : '0'), className: 'bg-gray-200 hover:bg-gray-300' },
        { label: '÷', onClick: () => performOperation('/'), className: 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' },
        { label: '7', onClick: () => inputDigit(7) },
        { label: '8', onClick: () => inputDigit(8) },
        { label: '9', onClick: () => inputDigit(9) },
        { label: '×', onClick: () => performOperation('*'), className: 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' },
        { label: '4', onClick: () => inputDigit(4) },
        { label: '5', onClick: () => inputDigit(5) },
        { label: '6', onClick: () => inputDigit(6) },
        { label: '-', onClick: () => performOperation('-'), className: 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' },
        { label: '1', onClick: () => inputDigit(1) },
        { label: '2', onClick: () => inputDigit(2) },
        { label: '3', onClick: () => inputDigit(3) },
        { label: '+', onClick: () => performOperation('+'), className: 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' },
        { label: '0', onClick: () => inputDigit(0), className: 'col-span-2' },
        { label: '.', onClick: inputDot },
        { label: '=', onClick: () => performOperation('='), className: 'bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)]' }
    ];

    return (
        <div className="flex-1 bg-gray-50 flex items-center justify-center p-6 overflow-y-auto">
            <div className="bg-white p-6 rounded-3xl shadow-xl w-full max-w-sm border border-gray-100">
                <div className="flex items-center mb-6 text-[var(--primary-color)] font-bold text-xl">
                    <div className="icon-calculator mr-2 text-2xl"></div> 計算機
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl mb-6 text-right border border-gray-100">
                    <div className="text-gray-400 text-sm h-5 tracking-wider">{equation}</div>
                    <div className="text-4xl font-bold text-gray-800 tracking-wider truncate">{display}</div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                    {buttons.map((btn, idx) => (
                        <button
                            key={idx}
                            onClick={btn.onClick}
                            className={`p-4 text-xl font-bold rounded-2xl transition-transform active:scale-95 flex items-center justify-center ${btn.className || 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}