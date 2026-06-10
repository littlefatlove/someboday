function CreateGroupModal({ currentUser, friends, onClose, onCreate }) {
    const [groupName, setGroupName] = React.useState('');
    const [groupAvatar, setGroupAvatar] = React.useState('https://via.placeholder.com/150?text=Group');
    const [selectedFriends, setSelectedFriends] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const fileInputRef = React.useRef(null);

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
                setGroupAvatar(canvas.toDataURL('image/jpeg', 0.8));
            };
        };
    };

    const toggleFriend = (friendId) => {
        setSelectedFriends(prev => 
            prev.includes(friendId) 
                ? prev.filter(id => id !== friendId)
                : [...prev, friendId]
        );
    };

    const handleSubmit = async () => {
        if (!groupName.trim()) {
            alert('請輸入群組名稱');
            return;
        }
        if (selectedFriends.length === 0) {
            alert('請至少選擇一位好友加入群組');
            return;
        }

        setLoading(true);
        try {
            await createGroup(groupName, groupAvatar, currentUser.objectId, selectedFriends);
            onCreate();
        } catch (error) {
            console.error(error);
            alert('建立群組失敗');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-emerald-50 to-white">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center">
                        <div className="icon-users mr-2 text-[var(--primary-color)]"></div>
                        建立多人聊天群組
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <div className="icon-x"></div>
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    {/* Custom Group Avatar Upload */}
                    <div className="flex flex-col items-center justify-center mb-6">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                            <img src={groupAvatar} className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-100 shadow-sm" alt="Group Avatar" />
                            <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                                <div className="icon-camera text-xl mb-1"></div>
                                <span className="text-[10px] font-bold">自定義樣式</span>
                            </div>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                        <p className="text-xs text-gray-400 mt-2">點擊上傳自定義群組頭像</p>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2">群組名稱</label>
                        <input 
                            type="text" 
                            value={groupName}
                            onChange={e => setGroupName(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-100 focus:border-[var(--primary-color)] outline-none transition-all"
                            placeholder="輸入群組名稱..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">選擇成員 ({selectedFriends.length})</label>
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-2 max-h-48 overflow-y-auto custom-scrollbar">
                            {friends.length === 0 ? (
                                <p className="text-center text-gray-400 text-sm py-4">尚無好友可邀請</p>
                            ) : (
                                friends.map(friend => (
                                    <div 
                                        key={friend.objectId} 
                                        onClick={() => toggleFriend(friend.objectId)}
                                        className="flex items-center p-2 hover:bg-white rounded-lg cursor-pointer transition-colors"
                                    >
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 transition-colors ${selectedFriends.includes(friend.objectId) ? 'bg-[var(--primary-color)] border-[var(--primary-color)] text-white' : 'border-gray-300'}`}>
                                            {selectedFriends.includes(friend.objectId) && <div className="icon-check text-xs"></div>}
                                        </div>
                                        <img src={friend.objectData.avatar} className="w-8 h-8 rounded-full mr-2" />
                                        <span className="text-sm text-gray-700 font-medium">{friend.objectData.username}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-5 py-2 text-gray-600 hover:bg-gray-200 rounded-xl font-medium transition-colors">取消</button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={loading}
                        className="px-6 py-2 text-emerald-800 rounded-xl font-bold shadow-md disabled:opacity-50 flex items-center transition-all"
                    >
                        {loading && <div className="icon-loader animate-spin mr-2"></div>}
                        建立群組
                    </button>
                </div>
            </div>
        </div>
    );
}