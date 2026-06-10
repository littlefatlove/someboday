function PointsCenter({ currentUser }) {
    const [userPoints, setUserPoints] = React.useState({ total_points: 0, checkin_streak: 0, last_checkin_date: '' });
    const [pointsHistory, setPointsHistory] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [checkingIn, setCheckingIn] = React.useState(false);
    const [pointsId, setPointsId] = React.useState(null);

    const getTodayStr = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const loadPointsData = async () => {
        setLoading(true);
        try {
            // Load user points
            const pointsType = `user_points:${currentUser.objectId}`;
            const pointsList = await trickleListObjects(pointsType, 1);
            if (pointsList.items && pointsList.items.length > 0) {
                setUserPoints(pointsList.items[0].objectData);
                setPointsId(pointsList.items[0].objectId);
            } else {
                const initData = { user_id: currentUser.objectId, total_points: 0, checkin_streak: 0, last_checkin_date: '' };
                const newObj = await trickleCreateObject(pointsType, initData);
                setUserPoints(newObj.objectData);
                setPointsId(newObj.objectId);
            }

            // Load history
            const historyType = `points_history:${currentUser.objectId}`;
            const historyList = await trickleListObjects(historyType, 50, true);
            setPointsHistory(historyList.items || []);
        } catch (error) {
            console.error("Failed to load points data", error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (currentUser) {
            loadPointsData();
        }
    }, [currentUser]);

    const handleCheckIn = async () => {
        setCheckingIn(true);
        try {
            const today = getTodayStr();
            if (userPoints.last_checkin_date === today) {
                alert("您今天已經簽到過了喔！");
                setCheckingIn(false);
                return;
            }

            let newStreak = 1;
            let pointsEarned = 10; // Base points

            if (userPoints.last_checkin_date) {
                const lastDate = new Date(userPoints.last_checkin_date);
                const todayDate = new Date(today);
                const diffTime = Math.abs(todayDate - lastDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                
                if (diffDays === 1) {
                    newStreak = (userPoints.checkin_streak || 0) + 1;
                }
            }

            // Bonus points for streaks
            if (newStreak % 7 === 0) pointsEarned += 50; // Weekly bonus
            else if (newStreak % 3 === 0) pointsEarned += 20; // 3-day bonus

            const newTotal = (userPoints.total_points || 0) + pointsEarned;
            
            const updatedData = {
                user_id: currentUser.objectId,
                total_points: newTotal,
                checkin_streak: newStreak,
                last_checkin_date: today
            };

            const pointsType = `user_points:${currentUser.objectId}`;
            await trickleUpdateObject(pointsType, pointsId, updatedData);

            // Add history
            const historyType = `points_history:${currentUser.objectId}`;
            await trickleCreateObject(historyType, {
                user_id: currentUser.objectId,
                amount: pointsEarned,
                reason: `每日簽到 (連續 ${newStreak} 天)`,
                created_at: new Date().toISOString()
            });

            setUserPoints(updatedData);
            loadPointsData(); // Refresh history
            
            alert(`簽到成功！獲得 ${pointsEarned} 積分！`);
        } catch (error) {
            console.error("Check-in failed", error);
            alert("簽到失敗，請稍後再試");
        } finally {
            setCheckingIn(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex justify-center items-center h-full bg-gray-50 w-full">
                <div className="icon-loader animate-spin text-3xl text-[var(--primary-color)]"></div>
            </div>
        );
    }

    const today = getTodayStr();
    const hasCheckedInToday = userPoints.last_checkin_date === today;

    return (
        <div className="flex-1 bg-gray-50 p-4 md:p-8 overflow-y-auto w-full h-full relative z-10">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                        <div className="icon-coins mr-3 text-yellow-500"></div>
                        積分中心
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Points Summary Card */}
                    <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-6 text-white shadow-lg shadow-orange-200 relative overflow-hidden">
                        <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
                            <div className="icon-coins text-[150px]"></div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-orange-50 font-bold mb-1">我的總積分</p>
                            <h3 className="text-5xl font-black mb-6">
                                {currentUser.objectData.username === 'littlefat' ? '∞ (無限)' : (userPoints.total_points || 0)}
                            </h3>
                            
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-sm text-orange-100 mb-1">連續簽到</p>
                                    <p className="text-2xl font-bold">{userPoints.checkin_streak || 0} <span className="text-base font-normal">天</span></p>
                                </div>
                                <button 
                                    onClick={handleCheckIn}
                                    disabled={hasCheckedInToday || checkingIn}
                                    className={`px-6 py-3 rounded-xl font-bold text-lg transition-all shadow-md ${
                                        hasCheckedInToday 
                                        ? 'bg-white/30 text-white cursor-not-allowed border border-white/20' 
                                        : 'bg-white text-orange-500 hover:scale-105 active:scale-95'
                                    }`}
                                >
                                    {checkingIn ? (
                                        <span className="flex items-center"><div className="icon-loader animate-spin mr-2"></div> 處理中</span>
                                    ) : hasCheckedInToday ? (
                                        <span className="flex items-center"><div className="icon-circle-check mr-2"></div> 今日已簽到</span>
                                    ) : (
                                        '立即簽到'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* How to earn points */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <div className="icon-sparkles mr-2 text-[var(--primary-color)]"></div>
                                積分獎勵說明
                            </h3>
                            <ul className="space-y-3">
                                <li className="flex items-center text-gray-600 bg-gray-50 p-3 rounded-xl">
                                    <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mr-3 font-bold">+10</div>
                                    每日登入簽到基本獎勵
                                </li>
                                <li className="flex items-center text-gray-600 bg-gray-50 p-3 rounded-xl">
                                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-3 font-bold">+20</div>
                                    連續簽到滿 3 天額外獎勵
                                </li>
                                <li className="flex items-center text-gray-600 bg-gray-50 p-3 rounded-xl">
                                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-3 font-bold">+50</div>
                                    連續簽到滿 7 天額外大獎
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Points History */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <div className="icon-history mr-2 text-[var(--primary-color)]"></div>
                        積分紀錄
                    </h3>
                    
                    {pointsHistory.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="icon-file-text text-4xl text-gray-200 mb-2 mx-auto"></div>
                            <p className="text-gray-400">尚無積分紀錄</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                            {pointsHistory.map(history => (
                                <div key={history.objectId} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${history.objectData.amount > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                            <div className={history.objectData.amount > 0 ? "icon-arrow-up" : "icon-arrow-down"}></div>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">{history.objectData.reason}</p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(history.objectData.created_at).toLocaleString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute:'2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`font-black text-lg ${history.objectData.amount > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {history.objectData.amount > 0 ? '+' : ''}{history.objectData.amount}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}