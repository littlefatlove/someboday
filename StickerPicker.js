// Mock Stickers using dicebear
const SYSTEM_STICKERS = [
    { id: '1', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=1&radius=10' },
    { id: '2', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=2&radius=10' },
    { id: '3', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=3&radius=10' },
    { id: '4', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=4&radius=10' },
    { id: '5', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=5&radius=10' },
    { id: '6', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=6&radius=10' },
    { id: '7', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=7&radius=10' },
    { id: '8', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=8&radius=10' },
    { id: '9', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=9&radius=10' },
];

function StickerPicker({ onSelect, onClose, currentUserId }) {
    const [activeTab, setActiveTab] = React.useState('system'); // system, custom
    const [customStickers, setCustomStickers] = React.useState([]);
    const [uploading, setUploading] = React.useState(false);
    const fileInputRef = React.useRef(null);

    React.useEffect(() => {
        if (activeTab === 'custom') {
            loadCustomStickers();
        }
    }, [activeTab]);

    const loadCustomStickers = async () => {
        try {
            const stickers = await getCustomStickers(currentUserId);
            setCustomStickers(stickers);
        } catch (error) {
            console.error("Failed to load stickers", error);
        }
    };

    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_SIZE = 256; // Limit stickers to 256px
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Compress to JPEG with 0.8 quality or PNG if transparency needed (but simplified here to always use webp or jpeg/png based on needs, stick to jpeg/png)
                    // Using image/webp is often smaller and supports transparency
                    const dataUrl = canvas.toDataURL('image/webp', 0.8);
                    resolve(dataUrl);
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Although we compress, checking original size is good, but let's loose it a bit since we compress
        if (file.size > 5 * 1024 * 1024) {
            alert("檔案過大，請選擇小於 5MB 的圖片");
            return;
        }

        setUploading(true);
        try {
            const compressedDataUrl = await compressImage(file);
            await addCustomSticker(currentUserId, compressedDataUrl);
            await loadCustomStickers();
        } catch (error) {
            console.error("Upload failed:", error);
            alert("上傳失敗: " + (error.message || "未知錯誤"));
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = null;
        }
    };

    const handleDelete = async (e, stickerId) => {
        e.stopPropagation(); // Prevent selecting the sticker
        if (!confirm("確定要刪除此貼圖嗎？")) return;
        
        try {
            await deleteCustomSticker(stickerId);
            setCustomStickers(prev => prev.filter(s => s.objectId !== stickerId));
        } catch (error) {
            alert("刪除失敗");
        }
    };

    return (
        <div className="absolute bottom-16 left-4 bg-white rounded-xl shadow-2xl border border-green-100 z-50 w-72 overflow-hidden flex flex-col animate-fade-in-up">
            {/* Header Tabs */}
            <div className="flex border-b border-gray-100">
                <button 
                    onClick={() => setActiveTab('system')}
                    className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'system' ? 'text-[var(--primary-color)] bg-[var(--secondary-color)] border-b-2 border-[var(--primary-color)]' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    預設貼圖
                </button>
                <button 
                    onClick={() => setActiveTab('custom')}
                    className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'custom' ? 'text-[var(--primary-color)] bg-[var(--secondary-color)] border-b-2 border-[var(--primary-color)]' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    我的貼圖
                </button>
                <button onClick={onClose} className="px-3 hover:bg-red-50 hover:text-red-500 text-gray-400 transition-colors">
                    <div className="icon-x text-sm"></div>
                </button>
            </div>

            {/* Content */}
            <div className="p-3 h-64 overflow-y-auto bg-white custom-scrollbar">
                {activeTab === 'system' ? (
                    <div className="grid grid-cols-3 gap-2">
                        {SYSTEM_STICKERS.map(sticker => (
                            <div 
                                key={sticker.id}
                                onClick={() => onSelect({ id: sticker.id, url: sticker.url })}
                                className="relative group p-2 hover:bg-gray-50 rounded-xl transition-all hover:shadow-sm cursor-pointer border border-transparent hover:border-gray-100 flex items-center justify-center"
                            >
                                <img src={sticker.url} alt="Sticker" className="w-12 h-12" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div>
                        {/* Upload Area */}
                        <div 
                            onClick={() => fileInputRef.current.click()}
                            className="border-2 border-dashed border-gray-200 rounded-xl p-3 mb-3 text-center cursor-pointer hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] hover:bg-[var(--secondary-color)] text-gray-400 transition-all group"
                        >
                            {uploading ? (
                                <div className="icon-loader animate-spin mx-auto mb-1"></div>
                            ) : (
                                <div className="icon-plus mx-auto mb-1 group-hover:scale-110 transition-transform"></div>
                            )}
                            <span className="text-xs font-medium">新增自製貼圖</span>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleUpload} 
                                accept="image/*" 
                                className="hidden" 
                            />
                        </div>

                        {/* Custom Stickers Grid */}
                        {customStickers.length === 0 ? (
                            <div className="text-center text-gray-400 text-sm mt-8 flex flex-col items-center">
                                <div className="icon-image text-2xl mb-2 opacity-30"></div>
                                尚未新增自製貼圖
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-2">
                                {customStickers.map(sticker => (
                                    <div
                                        key={sticker.objectId}
                                        onClick={() => onSelect({ id: sticker.objectId, url: sticker.objectData.url })}
                                        className="relative group p-2 hover:bg-gray-50 rounded-xl transition-all hover:shadow-sm cursor-pointer border border-transparent hover:border-gray-100 flex items-center justify-center"
                                    >
                                        <img src={sticker.objectData.url} alt="Sticker" className="w-12 h-12 object-contain" />
                                        <button 
                                            onClick={(e) => handleDelete(e, sticker.objectId)}
                                            className="absolute top-1 right-1 bg-white text-red-500 border border-red-100 rounded-full p-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all shadow-sm hover:bg-red-50 transform hover:scale-110"
                                            title="刪除"
                                        >
                                            <div className="icon-x w-3 h-3"></div>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}