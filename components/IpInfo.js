function IpInfo() {
    const [ipData, setIpData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    const fetchIp = async () => {
        setLoading(true);
        setError(null);
        try {
            // Using trickle proxy to fetch ipapi.co to avoid CORS and get details
            const url = 'https://ipapi.co/json/';
            const proxyUrl = `https://proxy-api.trickle-app.host/?url=${encodeURIComponent(url)}`;
            const res = await fetch(proxyUrl);
            const data = await res.json();
            if (data.error) throw new Error(data.reason);
            setIpData(data);
        } catch (err) {
            setError('無法取得 IP 資訊。');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchIp();
    }, []);

    return (
        <div className="flex-1 bg-gray-50 p-6 overflow-y-auto w-full">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                        <div className="icon-network mr-3 text-teal-500"></div>
                        我的 IP 資訊
                    </h2>
                    <button 
                        onClick={fetchIp}
                        disabled={loading}
                        className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition font-bold text-sm flex items-center"
                    >
                        {loading ? <div className="icon-loader animate-spin mr-2"></div> : <div className="icon-refresh-cw mr-2"></div>}
                        重新整理
                    </button>
                </div>
                
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="icon-loader animate-spin text-3xl text-[var(--primary-color)]"></div>
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500 py-10 bg-red-50 rounded-2xl">{error}</div>
                ) : ipData ? (
                    <div className="space-y-6">
                        <div className="text-center p-8 bg-teal-50 rounded-2xl border border-teal-100">
                            <div className="text-sm text-teal-600 font-bold mb-2">你的公共 IP 位址</div>
                            <div className="text-4xl md:text-5xl font-bold text-teal-800 font-mono tracking-wider">{ipData.ip}</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="text-xs text-gray-400 mb-1">國家 / 地區</div>
                                <div className="font-bold text-gray-800">{ipData.country_name} ({ipData.country})</div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="text-xs text-gray-400 mb-1">城市</div>
                                <div className="font-bold text-gray-800">{ipData.city || '-'}</div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="text-xs text-gray-400 mb-1">電信業者 (ISP)</div>
                                <div className="font-bold text-gray-800">{ipData.org || '-'}</div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="text-xs text-gray-400 mb-1">時區</div>
                                <div className="font-bold text-gray-800">{ipData.timezone || '-'}</div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}