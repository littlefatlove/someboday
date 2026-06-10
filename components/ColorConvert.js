function ColorConvert() {
    const [hex, setHex] = React.useState('#10b981');
    const [rgb, setRgb] = React.useState('rgb(16, 185, 129)');
    
    const hexToRgb = (hex) => {
        let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : '';
    };

    const rgbToHex = (rgb) => {
        let result = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (!result) return '';
        const r = parseInt(result[1]).toString(16).padStart(2, '0');
        const g = parseInt(result[2]).toString(16).padStart(2, '0');
        const b = parseInt(result[3]).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
    };

    const handleHex = (val) => {
        setHex(val);
        if (/^#?([a-f\d]{3}|[a-f\d]{6})$/i.test(val)) {
            setRgb(hexToRgb(val));
        }
    };

    const handleRgb = (val) => {
        setRgb(val);
        if (/^rgb\(\d+,\s*\d+,\s*\d+\)$/.test(val)) {
            setHex(rgbToHex(val));
        }
    };

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="icon-paintbrush text-4xl text-pink-500 mb-4 mx-auto"></div>
                <h2 className="text-2xl font-bold text-gray-800 mb-8">色碼轉換</h2>

                <div className="w-full h-32 rounded-2xl shadow-inner mb-8 border border-gray-200 transition-colors duration-300" style={{ backgroundColor: hex.length >= 4 ? hex : '#fff' }}></div>

                <div className="space-y-4 text-left">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">HEX</label>
                        <input type="text" value={hex} onChange={e => handleHex(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-100 outline-none uppercase font-mono" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">RGB</label>
                        <input type="text" value={rgb} onChange={e => handleRgb(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-100 outline-none font-mono" />
                    </div>
                </div>
            </div>
        </div>
    );
}