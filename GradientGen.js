function GradientGen() {
    const [color1, setColor1] = React.useState('#10b981');
    const [color2, setColor2] = React.useState('#3b82f6');
    const [angle, setAngle] = React.useState(90);

    const gradient = `linear-gradient(${angle}deg, ${color1}, ${color2})`;

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center mb-8">
                    <div className="w-12 h-12 bg-fuchsia-100 rounded-xl flex items-center justify-center mr-4">
                        <div className="icon-paint-bucket text-2xl text-fuchsia-500"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">漸層產生器</h2>
                </div>

                <div className="w-full h-48 rounded-2xl shadow-inner mb-8 transition-all border border-gray-100" style={{ background: gradient }}></div>

                <div className="space-y-6 mb-8">
                    <div className="flex justify-between space-x-4">
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-700 mb-2">顏色 1</label>
                            <div className="relative w-full h-12 rounded-xl overflow-hidden shadow-sm border border-gray-200 cursor-pointer">
                                <input type="color" value={color1} onChange={e => setColor1(e.target.value)} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-24 cursor-pointer border-0 p-0" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-700 mb-2">顏色 2</label>
                            <div className="relative w-full h-12 rounded-xl overflow-hidden shadow-sm border border-gray-200 cursor-pointer">
                                <input type="color" value={color2} onChange={e => setColor2(e.target.value)} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-24 cursor-pointer border-0 p-0" />
                            </div>
                        </div>
                    </div>
                    <div className="py-2">
                        <label className="block text-sm font-bold text-gray-700 mb-3">角度: {angle}°</label>
                        <input type="range" min="0" max="360" value={angle} onChange={e => setAngle(e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-fuchsia-500" />
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative group">
                    <pre className="text-sm font-mono text-gray-700 overflow-x-auto">background: {gradient};</pre>
                    <button 
                        onClick={() => { navigator.clipboard.writeText(`background: ${gradient};`); alert('已複製 CSS!'); }}
                        className="absolute right-2 top-2 p-2 bg-white rounded-lg border border-gray-200 shadow-sm text-gray-500 hover:text-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <div className="icon-copy text-sm"></div>
                    </button>
                </div>
            </div>
        </div>
    );
}