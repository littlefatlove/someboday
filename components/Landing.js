function Landing() {
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);

    React.useEffect(() => {
        try {
            const userStr = localStorage.getItem('chat_user');
            const expiresStr = localStorage.getItem('chat_auth_expires');
            if (userStr && expiresStr && Date.now() < parseInt(expiresStr, 10)) {
                setIsLoggedIn(true);
                window.location.href = 'chat.html';
            }
        } catch (e) {
            console.error('Auth check error:', e);
        }
    }, []);

    const features = [
        { icon: 'icon-message-square', title: '即時聊天', desc: '文字、語音、圖片與檔案，隨時隨地與好友保持聯繫。' },
        { icon: 'icon-users', title: '群組交流', desc: '建立群組，與多位好友同時分享生活點滴。' },
        { icon: 'icon-layout-dashboard', title: '豐富應用', desc: '內建白板、筆記、天氣等多種實用小工具。' },
        { icon: 'icon-gamepad-2', title: '遊戲中心', desc: '多款經典小遊戲，打發時間的最佳選擇。' }
    ];

    const highlights = [
        { title: '個人化空間', desc: '自訂背景、頭像與專屬貼圖，打造獨一無二的個人首頁。', color: 'bg-emerald-100', icon: 'icon-user-round' },
        { title: '多平台同步', desc: '無縫同步您的對話、筆記和檔案，隨時切換裝置不中斷。', color: 'bg-teal-100', icon: 'icon-cloud' },
        { title: '安全與隱私', desc: '提供私密動態設定，確保您的重要資訊安全無虞。', color: 'bg-green-100', icon: 'icon-lock' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 font-sans text-gray-800 selection:bg-emerald-200">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-emerald-100 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <img 
                            src="https://app.trickle.so/storage/public/images/usr_19ffb77ac8000001/24586ed9-61c6-4606-9f7e-94daed5529ee.png" 
                            alt="Logo"
                            className="w-10 h-10 object-contain z-10 relative"
                        />
                        <span className="text-xl font-bold text-emerald-600 tracking-tight">someboday</span>
                    </div>
                    <div className="hidden md:flex space-x-8">
                        <a href="#features" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">核心功能</a>
                        <a href="#highlights" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">平台亮點</a>
                        <a href="#apps" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">內建應用</a>
                    </div>
                    <div>
                        <a 
                            href={isLoggedIn ? "chat.html" : "login.html"}
                            className="inline-flex items-center justify-center px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-full transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transform hover:-translate-y-0.5"
                        >
                            {isLoggedIn ? '進入應用' : '立即登入'}
                        </a>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
                <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob" style={{ animationDelay: '2s' }}></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
                    <div className="md:w-1/2 text-left mb-12 md:mb-0 pr-0 md:pr-12">
                        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
                            連結你的 <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">每一天</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                            someboday 不僅僅是一個聊天工具。它是一個結合了即時通訊、社群動態、生產力工具和娛樂的全新一站式數位空間。
                        </p>
                        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <a 
                                href={isLoggedIn ? "chat.html" : "login.html"}
                                className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full transition-all duration-300 shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 text-center transform hover:-translate-y-1"
                            >
                                {isLoggedIn ? '開啟聊天室' : '免費註冊 / 登入'}
                            </a>
                            <a 
                                href="#features"
                                className="w-full sm:w-auto px-8 py-4 bg-white text-emerald-600 font-bold rounded-full border-2 border-emerald-100 hover:border-emerald-200 transition-all duration-300 shadow-sm text-center"
                            >
                                了解更多
                            </a>
                        </div>
                    </div>
                    <div className="md:w-1/2 relative">
                        <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-4 border-white transform rotate-2 hover:rotate-0 transition-transform duration-500">
                            <img src="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=800&q=80" alt="Chat Preview" className="w-full object-cover" />
                        </div>
                    </div>
                </div>
            </main>

            {/* Features Section */}
            <section id="features" className="py-24 bg-white relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">為現代生活打造的功能</h2>
                        <div className="w-24 h-1 bg-emerald-500 mx-auto rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((f, i) => (
                            <div key={i} className="bg-emerald-50/50 p-8 rounded-3xl border border-emerald-100 hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-300 transform hover:-translate-y-2 group">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-emerald-500 mb-6 group-hover:scale-110 transition-transform">
                                    <div className={`${f.icon} text-2xl`}></div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Highlights Section */}
            <section id="highlights" className="py-24 bg-gray-50 relative z-10 border-t border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-16">
                        <div className="md:w-1/2">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">為什麼選擇 someboday？</h2>
                            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                                我們打破了傳統應用的界限，將您日常所需的一切整合到一個優雅的介面中。從工作到娛樂，一應俱全。
                            </p>
                            <div className="space-y-6">
                                {highlights.map((h, i) => (
                                    <div key={i} className="flex items-start">
                                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${h.color} text-emerald-700`}>
                                            <div className={`${h.icon} text-xl`}></div>
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-semibold text-gray-900 mb-2">{h.title}</h4>
                                            <p className="text-gray-600">{h.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="md:w-1/2 w-full grid grid-cols-2 gap-4">
                            <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80" alt="Highlight 1" className="rounded-2xl w-full h-48 object-cover shadow-md transform -translate-y-4" />
                            <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80" alt="Highlight 2" className="rounded-2xl w-full h-48 object-cover shadow-md transform translate-y-4" />
                            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80" alt="Highlight 3" className="rounded-2xl w-full h-48 object-cover shadow-md transform -translate-y-4" />
                            <img src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=400&q=80" alt="Highlight 4" className="rounded-2xl w-full h-48 object-cover shadow-md transform translate-y-4" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Apps Showcase Section */}
            <section id="apps" className="py-24 bg-white relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">探索無限可能</h2>
                    <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">內建超過50種實用工具，無需頻繁切換視窗，提升您的生產力與生活品質。</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        {['記事本', '行事曆', '世界時鐘', '記帳本', '番茄鐘', '習慣追蹤', '計算機', '單位轉換', '音樂播放', '天氣預報'].map((app, idx) => (
                            <span key={idx} className="px-6 py-3 bg-emerald-50 text-emerald-700 font-medium rounded-full border border-emerald-100 hover:bg-emerald-100 transition-colors cursor-default shadow-sm">
                                {app}
                            </span>
                        ))}
                        <span className="px-6 py-3 bg-gray-50 text-gray-500 font-medium rounded-full border border-gray-200 shadow-sm">
                            及更多...
                        </span>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-24 bg-emerald-50 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">用戶見證</h2>
                        <div className="w-24 h-1 bg-emerald-500 mx-auto rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { name: 'Alex', role: '設計師', quote: 'someboday 的介面非常乾淨，內建的白板功能讓我和團隊溝通想法變得超簡單！' },
                            { name: 'Sarah', role: '學生', quote: '我最喜歡番茄鐘和習慣追蹤，它讓我的學習效率提升了很多。而且完全免費！' },
                            { name: 'David', role: '工程師', quote: '多個設備間無縫同步，無論是在手機還是電腦上，隨時都能接續先前的工作。' }
                        ].map((t, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-3xl shadow-md border border-gray-100 relative">
                                <div className="text-emerald-200 icon-quote text-4xl absolute top-6 right-6 opacity-30"></div>
                                <p className="text-gray-600 mb-6 relative z-10 leading-relaxed">"{t.quote}"</p>
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-xl mr-4">
                                        {t.name[0]}
                                    </div>
                                    <div>
                                        <h4 className="text-gray-900 font-bold">{t.name}</h4>
                                        <p className="text-gray-500 text-sm">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-white relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-extrabold text-emerald-500 mb-2">50+</div>
                            <div className="text-gray-600 font-medium">內建工具</div>
                        </div>
                        <div>
                            <div className="text-4xl font-extrabold text-emerald-500 mb-2">10k+</div>
                            <div className="text-gray-600 font-medium">活躍用戶</div>
                        </div>
                        <div>
                            <div className="text-4xl font-extrabold text-emerald-500 mb-2">99%</div>
                            <div className="text-gray-600 font-medium">穩定運行</div>
                        </div>
                        <div>
                            <div className="text-4xl font-extrabold text-emerald-500 mb-2">24/7</div>
                            <div className="text-gray-600 font-medium">隨時連線</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-24 relative z-10 bg-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[3rem] p-16 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full filter blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-300 opacity-20 rounded-full filter blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>
                    
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 relative z-10 tracking-tight">準備好開始您的數位旅程了嗎？</h2>
                    <p className="text-emerald-50 text-xl mb-12 relative z-10 max-w-2xl mx-auto">立即加入 someboday，體驗前所未有的連線與效率，打造專屬於您的數位生活空間。</p>
                    <a 
                        href={isLoggedIn ? "chat.html" : "login.html"}
                        className="inline-flex items-center justify-center px-10 py-4 bg-white text-emerald-600 font-bold rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 relative z-10 text-lg hover:bg-emerald-50"
                    >
                        {isLoggedIn ? '進入首頁' : '立即開始免費使用'}
                        <div className="icon-arrow-right ml-2 text-xl"></div>
                    </a>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-50 border-t border-gray-200 py-16 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-6 md:mb-0">
                            <img 
                                src="https://app.trickle.so/storage/public/images/usr_19ffb77ac8000001/24586ed9-61c6-4606-9f7e-94daed5529ee.png" 
                                alt="Logo"
                                className="w-10 h-10 object-contain mr-3"
                            />
                            <span className="text-xl font-bold text-gray-400">someboday</span>
                        </div>
                        <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500 mb-6 md:mb-0">
                            <a href="#features" className="hover:text-emerald-600 transition-colors">核心功能</a>
                            <a href="#apps" className="hover:text-emerald-600 transition-colors">應用中心</a>
                            <a href="#" className="hover:text-emerald-600 transition-colors">隱私權政策</a>
                            <a href="#" className="hover:text-emerald-600 transition-colors">服務條款</a>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-400 text-sm">
                        &copy; 2026 someboday. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
