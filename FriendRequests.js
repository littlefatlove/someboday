function FriendRequests({ userId, onClose, onUpdate }) {
    const [requests, setRequests] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        loadRequests();
    }, [userId]);

    const loadRequests = async () => {
        try {
            const list = await getFriendRequests(userId);
            setRequests(list);
        } catch (error) {
            console.error("Failed to load requests", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async (requestId, status) => {
        try {
            await respondToFriendRequest(requestId, status);
            // Remove from list
            setRequests(prev => prev.filter(r => r.objectId !== requestId));
            if (status === 'accepted') {
                onUpdate(); // Refresh friend list
            }
        } catch (error) {
            console.error(error);
            alert('操作失敗');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[80vh] border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-emerald-50 to-white">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center">
                        <div className="icon-bell mr-2 text-[var(--primary-color)]"></div>
                        好友邀請
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <div className="icon-x"></div>
                    </button>
                </div>
                
                <div className="p-4 overflow-y-auto flex-1 custom-scrollbar bg-gray-50/50">
                    {loading ? (
                        <div className="flex justify-center py-8 text-gray-400">
                            <div className="icon-loader animate-spin text-2xl text-[var(--primary-color)]"></div>
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 flex flex-col items-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                <div className="icon-mail-open text-3xl text-gray-300"></div>
                            </div>
                            <p className="font-medium text-gray-600">目前沒有新的好友邀請</p>
                            <p className="text-xs text-gray-400 mt-1">稍後再來查看吧</p>
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {requests.map(req => (
                                <li key={req.objectId} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <img 
                                                src={req.requester.objectData.avatar} 
                                                className="w-12 h-12 rounded-full bg-gray-200 object-cover border border-white shadow-sm" 
                                                alt="Avatar" 
                                            />
                                            <div className="ml-3">
                                                <h4 className="font-bold text-gray-800 text-sm">{req.requester.objectData.username}</h4>
                                                <p className="text-xs text-gray-500 truncate max-w-[120px] mt-0.5">
                                                    {req.requester.objectData.bio || '沒有簡介'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button 
                                                onClick={() => handleRespond(req.objectId, 'accepted')}
                                                className="p-2 bg-[var(--primary-color)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors shadow-sm shadow-emerald-200"
                                                title="接受"
                                            >
                                                <div className="icon-check text-sm"></div>
                                            </button>
                                            <button 
                                                onClick={() => handleRespond(req.objectId, 'rejected')}
                                                className="p-2 bg-white border border-gray-200 text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-colors"
                                                title="拒絕"
                                            >
                                                <div className="icon-x text-sm"></div>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-[10px] text-gray-400 text-right border-t border-gray-50 pt-2 flex justify-between">
                                        <span>來自搜尋</span>
                                        <span>{new Date(req.createdAt).toLocaleString()}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}