function LoginForm() {
    const [isRegister, setIsRegister] = React.useState(false);
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        try {
            const userStr = localStorage.getItem('chat_user');
            const expiresStr = localStorage.getItem('chat_auth_expires');
            
            if (userStr) {
                if (!expiresStr) {
                    // Backward compatibility for existing users
                    localStorage.setItem('chat_auth_expires', Date.now() + 5 * 24 * 60 * 60 * 1000);
                    window.location.href = 'chat.html';
                } else if (Date.now() < parseInt(expiresStr, 10)) {
                    // Valid session, redirect to chat
                    window.location.href = 'chat.html';
                } else {
                    // Expired
                    localStorage.removeItem('chat_user');
                    localStorage.removeItem('chat_auth_expires');
                }
            }
        } catch (e) {
            console.error('Auth check error:', e);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) {
            setError('請填寫所有欄位');
            return;
        }

        setLoading(true);
        setError('');

        try {
            let user;
            if (isRegister) {
                user = await registerUser(username, password);
            } else {
                user = await loginUser(username, password);
            }
            
            // Save to localStorage
            localStorage.setItem('chat_user', JSON.stringify(user));
            // Set expiration to 5 days from now
            localStorage.setItem('chat_auth_expires', Date.now() + 5 * 24 * 60 * 60 * 1000);
            
            // Redirect to chat
            window.location.href = 'chat.html';
        } catch (err) {
            console.error(err);
            setError(err.message || (isRegister ? '註冊失敗' : '登入失敗'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-100 via-green-50 to-teal-100 overflow-hidden relative">
            {/* Background Decorative Orbs */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-300/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
            <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-teal-300/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>

            <div className="liquid-glass rounded-[2rem] w-full max-w-md overflow-hidden transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(16,185,129,0.25)] relative z-10">
                <div className="p-8 relative">
                    {/* Inner highlight reflection */}
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>
                    
                    <div className="text-center mb-8 relative z-10">
                        <img 
                            src="https://app.trickle.so/storage/public/images/usr_19ffb77ac8000001/24586ed9-61c6-4606-9f7e-94daed5529ee.png" 
                            alt="Logo"
                            className="w-24 h-24 mx-auto mb-2 filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.1)] transform hover:scale-110 hover:-rotate-3 transition-all duration-300 object-contain"
                        />
                        <h2 className="text-3xl font-extrabold text-[var(--primary-color)] mb-6 tracking-tighter">someboday</h2>
                        <h1 className="text-xl font-bold text-gray-800 tracking-tight">
                            {isRegister ? '建立新帳號' : '歡迎回來'}
                        </h1>
                        <p className="text-gray-500 mt-2 text-sm">
                            {isRegister ? '填寫以下資料開始您的旅程' : '請輸入您的帳號密碼以繼續'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">用戶名稱</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <div className="icon-user text-gray-400 group-focus-within:text-[var(--primary-color)] transition-colors"></div>
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="liquid-input block w-full pl-10 pr-3 py-3 rounded-2xl outline-none"
                                    placeholder="輸入您的用戶名"
                                    required
                                />
                            </div>
                        </div>

                        <div className="relative z-10">
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">密碼</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                    <div className="icon-lock text-gray-400 group-focus-within:text-[var(--primary-color)] transition-colors"></div>
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="liquid-input block w-full pl-10 pr-3 py-3 rounded-2xl outline-none"
                                    placeholder="輸入您的密碼"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm flex items-center bg-red-50/80 backdrop-blur-sm p-4 rounded-2xl border border-red-100/50 shadow-inner relative z-10 animate-fade-in">
                                <div className="icon-circle-alert mr-2 flex-shrink-0"></div>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="relative z-10 w-full flex justify-center items-center py-4 px-4 text-sm font-bold text-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6 overflow-hidden"
                        >
                            {loading ? (
                                <>
                                    <div className="icon-loader animate-spin mr-2"></div>
                                    處理中...
                                </>
                            ) : (
                                <>
                                    {isRegister ? '註冊帳號' : '立即登入'}
                                    <div className="icon-arrow-right ml-2"></div>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setIsRegister(!isRegister);
                                setError('');
                                setUsername('');
                                setPassword('');
                            }}
                            className="text-sm text-gray-600 hover:text-emerald-700 font-bold transition-colors py-2 px-6"
                        >
                            {isRegister ? '已經有帳號？ 點此登入' : '還沒有帳號？ 點此註冊'}
                        </button>
                    </div>
                </div>
                {/* Footer removed as per request */}
            </div>
        </div>
    );
}