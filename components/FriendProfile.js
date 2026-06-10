function FriendProfile({ friend, onClose, onDelete }) {
    const [showConfirmDelete, setShowConfirmDelete] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);

    if (!friend) return null;
    
    const coverPhoto = friend.objectData.cover_photo || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80";

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await onDelete(friend.objectId);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div 
                className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 flex flex-col relative max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                {showConfirmDelete ? (
                    <div className="p-8 text-center animate-fade-in overflow-y-auto custom-scrollbar">
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5">
                            <div className="icon-triangle-alert text-4xl"></div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">確定要刪除好友嗎？</h3>
                        <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                            刪除後，您將無法再與 <span className="font-bold text-gray-700">{friend.objectData.username}</span> 傳送訊息，且彼此將會從好友列表中移除。此操作無法復原。
                        </p>
                        <div className="flex space-x-3">
                            <button 
                                onClick={() => setShowConfirmDelete(false)}
                                className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                取消
                            </button>
                            <button 
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 py-3.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-200 flex justify-center items-center"
                            >
                                {isDeleting && <div className="icon-loader animate-spin mr-2"></div>}
                                確認刪除
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-y-auto custom-scrollbar w-full flex-1">
                        {/* Cover Photo */}
                        <div className="h-40 shrink-0 relative bg-gray-200">
                            <img 
                                src={coverPhoto} 
                                className="w-full h-full object-cover" 
                                alt="Cover" 
                            />
                            <button 
                                onClick={onClose}
                                className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                            >
                                <div className="icon-x text-lg"></div>
                            </button>
                        </div>

                        {/* Avatar & Info */}
                        <div className="px-6 pb-8 relative">
                            <div className="flex justify-between items-end -mt-12 mb-4">
                                <img 
                                    src={friend.objectData.avatar} 
                                    className="w-24 h-24 rounded-full border-4 border-white bg-white object-cover shadow-md relative z-10" 
                                    alt="Avatar" 
                                />
                                <div className={`px-3 py-1 rounded-full text-xs font-bold border relative z-10 ${
                                    friend.objectData.status === 'busy' 
                                        ? 'bg-red-50 text-red-500 border-red-100' 
                                        : friend.objectData.status === 'offline' 
                                        ? 'bg-gray-100 text-gray-500 border-gray-200' 
                                        : 'bg-emerald-50 text-emerald-500 border-emerald-100'
                                }`}>
                                    {friend.objectData.status === 'busy' ? '忙碌' : friend.objectData.status === 'offline' ? '離線' : '在線'}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">{friend.objectData.username}</h2>
                                    <p className="text-gray-500 text-sm mt-1">{friend.objectData.bio || '這傢伙很懶，什麼都沒寫'}</p>
                                </div>

                                <div className="pt-4 border-t border-gray-50 grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-3 rounded-xl text-center">
                                        <div className="text-xs text-gray-400 mb-1">加入時間</div>
                                        <div className="font-bold text-gray-700 text-sm">
                                            {new Date(friend.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                            {friend.objectId !== 'system_admin' && (
                                <button 
                                    onClick={() => onDelete(friend.objectId)}
                                    className="w-full py-3 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100 flex items-center justify-center mt-2"
                                >
                                    <div className="icon-user-minus mr-2"></div>
                                    刪除好友
                                </button>
                            )}
                                </div>
                                
                                {friend.objectId !== 'system_admin' && (
                                    <button 
                                        onClick={() => setShowConfirmDelete(true)}
                                        className="w-full mt-2 py-3 text-red-500 hover:bg-red-50 rounded-xl font-bold transition-all flex items-center justify-center active:scale-95"
                                    >
                                        <div className="icon-user-x mr-2"></div>
                                        刪除好友
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
