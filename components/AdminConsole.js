function AdminConsole({ currentUser }) {
    const [users, setUsers] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [broadcastMsg, setBroadcastMsg] = React.useState('');
    const [sending, setSending] = React.useState(false);
    const [editingUser, setEditingUser] = React.useState(null);
    const [newPoints, setNewPoints] = React.useState('');
    const [pmUser, setPmUser] = React.useState(null);
    const [pmMsg, setPmMsg] = React.useState('');
    const [sendingPm, setSendingPm] = React.useState(false);

    React.useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            let allUsers = [];
            let nextPageToken = undefined;
            // Limit to 5 pages initially to avoid massive payloads
            for(let i=0; i<5; i++) {
                const result = await safeDbCall(() => trickleListObjects('chat_user', 100, true, nextPageToken));
                allUsers = [...allUsers, ...(result.items || [])];
                nextPageToken = result.nextPageToken;
                if (!nextPageToken) break;
            }
            
            // Set users immediately so the list renders
            const initialUsers = allUsers.map(u => ({ ...u, points: '加載中...', pointsId: null }));
            setUsers(initialUsers);
            setLoading(false);

            // Fetch points asynchronously in the background
            for (const u of allUsers) {
                try {
                    const pointsType = `user_points:${u.objectId}`;
                    const pRes = await safeDbCall(() => trickleListObjects(pointsType, 1));
                    let pts = 0;
                    let ptsId = null;
                    if (pRes.items && pRes.items.length > 0) {
                        pts = pRes.items[0].objectData.total_points || 0;
                        ptsId = pRes.items[0].objectId;
                    }
                    
                    setUsers(prev => prev.map(user => 
                        user.objectId === u.objectId ? { ...user, points: pts, pointsId: ptsId } : user
                    ));
                } catch (err) {
                    console.warn("Failed to fetch points for user", u.objectId, err);
                    setUsers(prev => prev.map(user => 
                        user.objectId === u.objectId ? { ...user, points: 0, pointsId: null } : user
                    ));
                }
                // Delay to prevent 502 errors and rate limits
                await new Promise(resolve => setTimeout(resolve, 200));
            }

        } catch(e) {
            console.error(e);
            setLoading(false);
        }
    };

    const handleSendBroadcast = async () => {
        if (!broadcastMsg.trim()) return;
        if (!confirm('確定要發送廣播訊息給所有用戶嗎？')) return;
        
        setSending(true);
        try {
            for (const u of users) {
                if (u.objectId === currentUser.objectId) continue;
                await sendMessage(
                    currentUser.objectId,
                    u.objectId,
                    `[系統公告] ${broadcastMsg}`,
                    'text',
                    '{}',
                    null
                );
            }
            alert('廣播發送成功！');
            setBroadcastMsg('');
        } catch(e) {
            alert('發送失敗: ' + e.message);
        } finally {
            setSending(false);
        }
    };

    const handleSendPM = async () => {
        if (!pmUser || !pmMsg.trim()) return;
        setSendingPm(true);
        try {
            await sendMessage(
                'system_admin',
                pmUser.objectId,
                pmMsg,
                'text',
                '{}',
                null
            );
            alert('訊息發送成功！');
            setPmUser(null);
            setPmMsg('');
        } catch(e) {
            alert('發送失敗: ' + e.message);
        } finally {
            setSendingPm(false);
        }
    };

    const handleUpdatePoints = async () => {
        if (!editingUser || newPoints === '') return;
        const pts = parseFloat(newPoints);
        if (isNaN(pts)) return;

        try {
            const pointsType = `user_points:${editingUser.objectId}`;
            let newPtsId = editingUser.pointsId;
            
            if (editingUser.pointsId) {
                const pRes = await safeDbCall(() => trickleGetObject(pointsType, editingUser.pointsId));
                await safeDbCall(() => trickleUpdateObject(pointsType, editingUser.pointsId, {
                    ...pRes.objectData,
                    total_points: pts
                }));
            } else {
                const created = await safeDbCall(() => trickleCreateObject(pointsType, {
                    user_id: editingUser.objectId,
                    total_points: pts,
                    checkin_streak: 0,
                    last_checkin_date: ''
                }));
                newPtsId = created.objectId;
            }

            // Update UI immediately instead of reloading all users
            setUsers(prev => prev.map(user => 
                user.objectId === editingUser.objectId 
                    ? { ...user, points: pts, pointsId: newPtsId } 
                    : user
            ));

            alert('積分更新成功！');
            setEditingUser(null);
            setNewPoints('');
        } catch(e) {
            alert('更新失敗: ' + e.message);
        }
    };

    if (loading) {
        return <div className="flex-1 flex justify-center py-20"><div className="icon-loader animate-spin text-3xl text-emerald-500"></div></div>;
    }

    return (
        <div className="flex-1 bg-gray-50 p-6 overflow-y-auto w-full relative z-10">
            <div className="max-w-4xl mx-auto space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <div className="icon-shield-alert mr-3 text-red-500"></div>
                    管理員控制台
                </h2>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-lg mb-4 text-gray-800">全站廣播 (最高級訊息)</h3>
                    <textarea 
                        value={broadcastMsg}
                        onChange={(e) => setBroadcastMsg(e.target.value)}
                        placeholder="輸入要發送給所有人的訊息..."
                        className="w-full border border-gray-200 rounded-xl p-3 h-24 resize-none mb-3 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    ></textarea>
                    <button 
                        onClick={handleSendBroadcast}
                        disabled={sending || !broadcastMsg.trim()}
                        className="px-6 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center"
                    >
                        {sending ? <div className="icon-loader animate-spin mr-2"></div> : <div className="icon-send mr-2"></div>}
                        發送廣播
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-lg mb-4 text-gray-800 flex justify-between items-center">
                        用戶積分管理
                        <span className="text-sm font-normal text-gray-500">共 {users.length} 名用戶</span>
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-gray-400 text-sm border-b border-gray-100">
                                    <th className="pb-3 font-medium">用戶</th>
                                    <th className="pb-3 font-medium">當前積分</th>
                                    <th className="pb-3 font-medium text-right">操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.objectId} className="border-b border-gray-50 hover:bg-gray-50">
                                        <td className="py-3 flex items-center">
                                            <img src={u.objectData.avatar} className="w-8 h-8 rounded-full bg-gray-200 mr-3" />
                                            <span className="font-bold text-gray-700">{u.objectData.username}</span>
                                        </td>
                                        <td className="py-3 text-gray-600 font-mono">
                                            {u.points}
                                        </td>
                                        <td className="py-3 text-right space-x-2">
                                            <button 
                                                onClick={() => {
                                                    setEditingUser(u);
                                                    setNewPoints(u.points);
                                                }}
                                                className="text-emerald-500 hover:text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg text-sm font-bold"
                                            >
                                                修改積分
                                            </button>
                                            {u.objectId !== currentUser.objectId && (
                                                <button 
                                                    onClick={() => setPmUser(u)}
                                                    className="text-blue-500 hover:text-blue-600 bg-blue-50 px-3 py-1 rounded-lg text-sm font-bold"
                                                >
                                                    個別傳訊
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {pmUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <h3 className="font-bold text-lg mb-4 text-gray-800 flex items-center">
                            <div className="icon-message-circle mr-2 text-blue-500"></div>
                            傳送系統訊息給 {pmUser.objectData.username}
                        </h3>
                        <p className="text-xs text-gray-500 mb-3">此訊息將以「系統管理員」的身分發送。</p>
                        <textarea 
                            value={pmMsg}
                            onChange={(e) => setPmMsg(e.target.value)}
                            placeholder="輸入訊息內容..."
                            className="w-full border border-gray-200 rounded-xl p-3 h-32 resize-none mb-4 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        ></textarea>
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => setPmUser(null)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-xl font-bold">取消</button>
                            <button onClick={handleSendPM} disabled={sendingPm || !pmMsg.trim()} className="px-4 py-2 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 disabled:opacity-50 flex items-center">
                                {sendingPm ? <div className="icon-loader animate-spin mr-2"></div> : null}
                                發送
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {editingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
                        <h3 className="font-bold text-lg mb-4">修改 {editingUser.objectData.username} 的積分</h3>
                        <input 
                            type="number" 
                            value={newPoints}
                            onChange={(e) => setNewPoints(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-200 font-mono"
                        />
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => setEditingUser(null)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-xl">取消</button>
                            <button onClick={handleUpdatePoints} className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600">儲存</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}