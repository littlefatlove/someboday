function ColorPicker() {
    const [color, setColor] = React.useState('#10b981');

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert(`已複製: ${text}`);
    };

    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : null;
    };

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="icon-pipette text-4xl text-pink-400 mb-4 mx-auto"></div>
                <h2 className="text-2xl font-bold text-gray-800 mb-8">調色盤</h2>

                <div 
                    className="w-full h-48 rounded-2xl shadow-inner mb-8 border border-gray-200 transition-colors duration-200"
                    style={{ backgroundColor: color }}
                ></div>

                <div className="flex justify-center mb-8">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden shadow-lg border-4 border-white cursor-pointer hover:scale-105 transition-transform ring-4 ring-gray-50">
                        <input 
                            type="color" 
                            value={color} 
                            onChange={e => setColor(e.target.value)} 
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 cursor-pointer border-0 p-0"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <span className="text-gray-500 font-bold text-sm">HEX</span>
                        <div className="flex items-center">
                            <span className="font-mono text-gray-800 mr-3 uppercase">{color}</span>
                            <button onClick={() => copyToClipboard(color.toUpperCase())} className="text-gray-400 hover:text-pink-500"><div className="icon-copy"></div></button>
                        </div>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <span className="text-gray-500 font-bold text-sm">RGB</span>
                        <div className="flex items-center">
                            <span className="font-mono text-gray-800 mr-3">{hexToRgb(color)}</span>
                            <button onClick={() => copyToClipboard(hexToRgb(color))} className="text-gray-400 hover:text-pink-500"><div className="icon-copy"></div></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}