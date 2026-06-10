function SharedGallery({ currentUser, updateUserPoints }) {
    const [images, setImages] = React.useState([]);
    const [usersMap, setUsersMap] = React.useState({});
    const [loading, setLoading] = React.useState(true);
    const [uploading, setUploading] = React.useState(false);

    const loadImages = async () => {
        try {
            const res = await trickleListObjects('shared_gallery', 100, true);
            setImages(res.items);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        const loadUsers = async () => {
            try {
                let allUsers = [];
                let nextPageToken = undefined;
                for (let i = 0; i < 5; i++) {
                    const res = await trickleListObjects('chat_user', 100, true, nextPageToken);
                    allUsers = [...allUsers, ...(res.items || [])];
                    nextPageToken = res.nextPageToken;
                    if (!nextPageToken) break;
                }
                const map = {};
                allUsers.forEach(u => {
                    map[u.objectId] = {
                        username: u.objectData.username,
                        avatar: u.objectData.avatar || 'https://app.trickle.so/storage/public/images/anonymous/b88ec477-8a11-4117-b259-1a83974592eb.png'
                    };
                });
                setUsersMap(map);
            } catch (e) {
                console.error(e);
            }
        };

        loadUsers();
        loadImages();
        const interval = setInterval(loadImages, 5000);
        return () => clearInterval(interval);
    }, []);

    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800; 
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith('image/')) return;

        if (updateUserPoints) {
            const hasPoints = await updateUserPoints(-0.1, '上傳共享圖片');
            if (!hasPoints) {
                e.target.value = null;
                return;
            }
        }

        setUploading(true);
        try {
            const dataUrl = await compressImage(file);
            await trickleCreateObject('shared_gallery', {
                user_id: currentUser.objectId,
                image_url: dataUrl
            });
            loadImages();
        } catch (error) {
            alert('上傳失敗');
        } finally {
            setUploading(false);
            e.target.value = null;
        }
    };

    const handleDelete = async (imageId) => {
        if (!confirm('確定要刪除這張圖片嗎？')) return;
        try {
            await trickleDeleteObject('shared_gallery', imageId);
            loadImages();
        } catch (e) {
            alert('刪除失敗');
        }
    };

    const saveAsSticker = async (imageUrl) => {
        try {
            await trickleCreateObject('user_sticker', {
                owner_id: currentUser.objectId,
                url: imageUrl,
                created_at: new Date().toISOString()
            });
            alert('已成功加入貼圖列！');
        } catch (e) {
            alert('儲存失敗');
        }
    };

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto w-full">
            <div className="max-w-5xl mx-auto pb-20 md:pb-0">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                        <div className="icon-image mr-3 text-[var(--primary-color)]"></div>
                        共享圖庫
                    </h2>
                    <label className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-xl shadow-lg shadow-emerald-200 hover:bg-[var(--primary-hover)] transition-all flex items-center text-sm font-bold cursor-pointer disabled:opacity-50">
                        {uploading ? (
                            <div className="icon-loader animate-spin mr-2"></div>
                        ) : (
                            <div className="icon-upload mr-2"></div>
                        )}
                        上傳圖片
                        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
                    </label>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="icon-loader animate-spin text-3xl text-[var(--primary-color)]"></div>
                    </div>
                ) : images.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-gray-400 mt-20 bg-white p-12 rounded-3xl shadow-sm border border-gray-100">
                        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
                            <div className="icon-image text-4xl text-emerald-300"></div>
                        </div>
                        <h2 className="text-xl font-bold text-gray-600">目前沒有共享圖片</h2>
                        <p className="mt-2 text-sm text-gray-400">趕快上傳第一張圖片與大家分享吧！</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {images.map(img => (
                            <div key={img.objectId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group relative aspect-square">
                                <img src={img.objectData.image_url} className="w-full h-full object-cover" />
                                
                                {/* User Info Badge */}
                                <div className="absolute top-2 left-2 flex items-center bg-black/50 rounded-full px-2 py-1 max-w-[85%]">
                                    <img src={usersMap[img.objectData.user_id]?.avatar} className="w-5 h-5 rounded-full mr-1.5 flex-shrink-0" />
                                    <span className="text-white text-xs font-medium truncate">
                                        {usersMap[img.objectData.user_id]?.username || '未知用戶'}
                                    </span>
                                </div>

                                {/* Delete Button (Only for owner) */}
                                {img.objectData.user_id === currentUser.objectId && (
                                    <button 
                                        onClick={() => handleDelete(img.objectId)}
                                        className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        title="刪除圖片"
                                    >
                                        <div className="icon-trash-2 text-xs"></div>
                                    </button>
                                )}

                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                    <button 
                                        onClick={() => saveAsSticker(img.objectData.image_url)}
                                        className="px-4 py-2 bg-white text-gray-800 rounded-lg shadow-lg hover:bg-[var(--primary-color)] hover:text-white transition-colors flex items-center text-sm font-bold transform scale-95 group-hover:scale-100 pointer-events-auto"
                                    >
                                        <div className="icon-star mr-1.5 text-xs"></div>
                                        存為貼圖
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}