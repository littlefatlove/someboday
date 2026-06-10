function Whiteboard() {
    const canvasRef = React.useRef(null);
    const contextRef = React.useRef(null);
    const drawingData = React.useRef({
        isDrawing: false,
        points: [],
        lastWidth: 5
    });

    const [color, setColor] = React.useState('#000000');
    const [brushSize, setBrushSize] = React.useState(5);

    const setupCanvas = React.useCallback((isResize = false) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const container = canvas.parentElement;
        const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
        
        const rect = container.getBoundingClientRect();
        // Force high DPI rendering for crisp lines without pixelation
        const dpr = Math.max(window.devicePixelRatio || 1, 2); 
        
        let tempCanvas;
        if (isResize) {
            tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            tempCanvas.getContext('2d').drawImage(canvas, 0, 0);
        }

        // Set actual pixel sizes
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        // Set display sizes
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        
        // Scale context to match DPI
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        if (isResize && tempCanvas) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, rect.width, rect.height);
            ctx.save();
            ctx.scale(1/dpr, 1/dpr);
            ctx.drawImage(tempCanvas, 0, 0);
            ctx.restore();
        } else {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, rect.width, rect.height);
        }
        
        // Optimize rendering quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        contextRef.current = ctx;
    }, []);

    React.useEffect(() => {
        setupCanvas();
        
        let timeoutId = null;
        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => setupCanvas(true), 150);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [setupCanvas]);

    const getCoordinates = (event) => {
        const rect = canvasRef.current.getBoundingClientRect();
        let clientX, clientY;
        
        if (event.touches && event.touches.length > 0) {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }
        
        return {
            x: clientX - rect.left,
            y: clientY - rect.top,
            time: performance.now()
        };
    };

    const startDrawing = (e) => {
        const pt = getCoordinates(e.nativeEvent);
        const data = drawingData.current;
        data.isDrawing = true;
        data.points = [pt];
        data.lastWidth = brushSize;
        
        const ctx = contextRef.current;
        ctx.beginPath();
        ctx.fillStyle = color;
        // Draw an initial dot
        ctx.arc(pt.x, pt.y, brushSize / 2, 0, Math.PI * 2);
        ctx.fill();
    };

    const draw = (e) => {
        const data = drawingData.current;
        if (!data.isDrawing) return;

        const currentPt = getCoordinates(e.nativeEvent);
        const points = data.points;
        const lastPt = points[points.length - 1];
        
        // Calculate distance from last point
        const dx = currentPt.x - lastPt.x;
        const dy = currentPt.y - lastPt.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Micro-jitter filter: ignore tiny movements
        if (dist < 1.5) return; 
        
        points.push(currentPt);
        
        const ctx = contextRef.current;
        ctx.strokeStyle = color;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Calculate velocity (distance over time)
        const dt = currentPt.time - lastPt.time;
        const velocity = dt > 0 ? dist / dt : 0;
        
        // Dynamic stroke width: thinner when moving fast
        const minWidth = Math.max(1, brushSize * 0.3);
        const maxWidth = brushSize * 1.2;
        let targetWidth = brushSize / (1 + velocity * 0.4);
        targetWidth = Math.max(minWidth, Math.min(maxWidth, targetWidth));
        
        // Ease the width transition
        const currentWidth = data.lastWidth + (targetWidth - data.lastWidth) * 0.15;
        data.lastWidth = currentWidth;
        ctx.lineWidth = currentWidth;

        // Quadratic Bezier Curve Smoothing
        if (points.length >= 3) {
            const p0 = points[points.length - 3];
            const p1 = points[points.length - 2];
            const p2 = points[points.length - 1];
            
            // Calculate midpoints
            const mid1 = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
            const mid2 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
            
            ctx.beginPath();
            ctx.moveTo(mid1.x, mid1.y);
            // Curve through p1 to the midpoint of p1 and p2
            ctx.quadraticCurveTo(p1.x, p1.y, mid2.x, mid2.y);
            ctx.stroke();
        } else if (points.length === 2) {
            // Fallback for the first small segment
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            ctx.lineTo(points[1].x, points[1].y);
            ctx.stroke();
        }
        
        // Keep only the points we need to save memory and prevent overflow
        if (points.length > 3) {
            points.shift();
        }
    };

    const finishDrawing = () => {
        drawingData.current.isDrawing = false;
        drawingData.current.points = [];
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = contextRef.current;
        const rect = canvas.parentElement.getBoundingClientRect();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, rect.width, rect.height);
    };

    const downloadCanvas = () => {
        const canvas = canvasRef.current;
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `whiteboard-${Date.now()}.png`;
        a.click();
    };

    const colors = [
        '#000000', '#ef4444', '#f97316', '#f59e0b', '#eab308', 
        '#84cc16', '#22c55e', '#10b981', '#06b6d4', '#14b8a6', 
        '#0ea5e9', '#0284c7', '#3b82f6', '#2563eb', '#6366f1', 
        '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', 
        '#ffffff'
    ];

    return (
        <div className="flex-1 bg-gray-50 flex flex-col h-full w-full overflow-hidden">
            <div className="bg-white px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between shadow-sm z-10 shrink-0 gap-4">
                <div className="flex items-center">
                    <div className="icon-palette mr-3 text-2xl text-[var(--primary-color)]"></div>
                    <h2 className="text-xl font-bold text-gray-800">創意白板</h2>
                </div>
                
                <div className="flex items-center space-x-6 flex-wrap gap-y-4">
                    <div className="flex items-center space-x-2">
                        <div className="icon-pen-tool text-gray-500"></div>
                        <input 
                            type="range" 
                            min="2" max="40" 
                            value={brushSize} 
                            onChange={(e) => setBrushSize(parseInt(e.target.value))}
                            className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                        <span className="text-xs font-medium text-gray-600 w-8">{brushSize}px</span>
                    </div>

                    <div className="flex items-center space-x-2 border-l border-gray-200 pl-6">
                        {[...colors.slice(0, 9), '#ffffff'].map(c => (
                            <div
                                key={c}
                                onClick={() => setColor(c)}
                                className={`relative flex items-center justify-center w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${color === c ? 'border-gray-800 scale-110 shadow-md' : 'border-gray-200 hover:scale-110 hover:shadow-sm'}`}
                                style={{ background: c }}
                                title={c === '#ffffff' ? '橡皮擦' : '選擇顏色'}
                            >
                                {c === '#ffffff' && (
                                    <div className="icon-eraser text-xs text-gray-800 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                                )}
                            </div>
                        ))}
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200 ml-2 shadow-sm hover:scale-105 transition-transform cursor-pointer">
                            <input 
                                type="color" 
                                value={color === '#ffffff' ? '#000000' : color} 
                                onChange={(e) => setColor(e.target.value)}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 cursor-pointer border-0 p-0"
                                title="自訂顏色"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 border-l border-gray-200 pl-6">
                        <button 
                            onClick={clearCanvas}
                            className="px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-bold flex items-center transition-colors"
                        >
                            <div className="icon-trash-2 mr-1"></div> 清除
                        </button>
                        <button 
                            onClick={downloadCanvas}
                            className="px-3 py-1.5 bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] rounded-lg text-sm font-bold flex items-center transition-colors shadow-sm"
                        >
                            <div className="icon-download mr-1"></div> 儲存
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 w-full relative p-4 md:p-6 bg-gray-100">
                <div className="w-full h-full bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden cursor-crosshair relative">
                    <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseUp={finishDrawing}
                        onMouseMove={draw}
                        onMouseLeave={finishDrawing}
                        onTouchStart={startDrawing}
                        onTouchEnd={finishDrawing}
                        onTouchMove={draw}
                        onTouchCancel={finishDrawing}
                        className="touch-none block absolute top-0 left-0 w-full h-full"
                    />
                </div>
            </div>
        </div>
    );
}