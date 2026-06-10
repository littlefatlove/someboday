function GroupSettingsModal({ group, currentUser, onClose, onUpdate, onDelete }) {
    const [name, setName] = React.useState(group.objectData.name);
    const [avatar, setAvatar] = React.useState(group.objectData.avatar);
    const [loading, setLoading] = React.useState(false);
    const [actionLoading, setActionLoading] = React.useState(false);
    const fileInputRef = React.useRef(null);
    
    const isCreator = group.objectData.creator_id === currentUser.objectId;

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('請上傳圖片檔案');
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_SIZE = 400;
                let width = img.width;
                let height = img.height;

                if (width > height && width > MAX_SIZE) {
                    height *= MAX_SIZE / width;
                    width = MAX_SIZE;
                } else if (height > MAX_SIZE) {
                    width *= MAX_SIZE / height;
                    height = MAX_SIZE;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                setAvatar(canvas.toDataURL('image/jpeg', 0.8));
            };
        };
    };

    const handleSave = async () => {
        if (!name.trim()) {
            alert('請輸入群組名稱');
            return;
        }

        setLoading(true);
        try {
            const updatedGroupData = await updateGroup(group.objectId, name, avatar);
            onUpdate({ ...group, objectData: updatedGroupData.objectData });
        } catch (error) {
            console.error(error);
            alert('更新群組失敗');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteOrLeave = async () => {
        if (isCreator) {
            if (!confirm("確定要解散此群組嗎？此操作無法還原。")) return;
            setActionLoading(true);
            try {
                await deleteGroupComplete(group.objectId);
                onDelete();
            } catch (error) {
                console.error(error);
                alert('解散群組失敗');
            } finally {
                setActionLoading(false);
            }
        } else {
            if (!confirm("確定要退出此群組嗎？")) return;
            setActionLoading(true);
            try {
                await leaveGroup(currentUser.objectId, group.objectId);
                onDelete();
            } catch (error) {
                console.error(error);
                alert('退出群組失敗');
            } finally {
                setActionLoading(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center">
                        <div className="icon-settings mr-2 text-[var(--primary-color)]"></div>
                        群組設定
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <div className="icon-x"></div>
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1">
                    {/* Custom Group Avatar Upload */}
                    <div className="flex flex-col items-center justify-center mb-6">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                            <img src={avatar} className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-100 shadow-sm" alt="Group Avatar" />
                            <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                                <div className="icon-camera text-xl mb-1"></div>
                                <span className="text-[10px] font-bold">更換頭像</span>
                            </div>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2">群組名稱</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-100 focus:border-[var(--primary-color)] outline-none transition-all"
                            placeholder="輸入群組名稱..."
                            disabled={!isCreator}
                        />
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                    <button 
                        onClick={handleDeleteOrLeave}
                        disabled={actionLoading}
                        className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl font-medium transition-colors flex items-center"
                    >
                        {actionLoading ? (
                            <div className="icon-loader animate-spin mr-2"></div>
                        ) : (
                            <div className={isCreator ? "icon-trash-2 mr-2" : "icon-log-out mr-2"}></div>
                        )}
                        {isCreator ? '解散群組' : '退出群組'}
                    </button>
                    <div className="flex space-x-3">
                        <button onClick={onClose} className="px-5 py-2 text-gray-600 hover:bg-gray-200 rounded-xl font-medium transition-colors">取消</button>
                        {isCreator && (
                            <button 
                                onClick={handleSave} 
                                disabled={loading}
                                className="px-6 py-2 bg-[var(--primary-color)] text-white rounded-xl hover:bg-[var(--primary-hover)] font-bold shadow-md disabled:opacity-50 flex items-center transition-all"
                            >
                                {loading && <div className="icon-loader animate-spin mr-2"></div>}
                                儲存設定
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}