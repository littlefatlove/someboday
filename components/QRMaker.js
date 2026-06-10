function QRMaker() {
    const [text, setText] = React.useState('');
    const [qrUrl, setQrUrl] = React.useState('');

    const generateQR = () => {
        if (!text.trim()) return;
        setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`);
    };

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="icon-qr-code text-4xl text-gray-800 mb-4 mx-auto"></div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">QR 碼生成器</h2>

                <div className="mb-6">
                    <input 
                        type="text" 
                        value={text} 
                        onChange={e => setText(e.target.value)} 
                        placeholder="輸入網址或文字..." 
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gray-200 outline-none"
                    />
                </div>

                <button 
                    onClick={generateQR} 
                    disabled={!text.trim()}
                    className="w-full py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-900 disabled:opacity-50 transition-colors font-bold shadow-lg mb-8"
                >
                    產生 QR Code
                </button>

                {qrUrl && (
                    <div className="flex flex-col items-center">
                        <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm mb-4">
                            <img src={qrUrl} alt="QR Code" className="w-48 h-48" />
                        </div>
                        <a href={qrUrl} download="qrcode.png" target="_blank" className="text-sm font-bold text-gray-500 hover:text-gray-800 flex items-center">
                            <div className="icon-download mr-1"></div> 下載圖片
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}