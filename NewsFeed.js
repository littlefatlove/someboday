function NewsFeed() {
    const [articles, setArticles] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [category, setCategory] = React.useState('');
    const [error, setError] = React.useState(null);

    const categories = [
        { id: '', name: '頭條新聞', icon: 'icon-flame' },
        { id: 'WORLD', name: '國際', icon: 'icon-globe' },
        { id: 'NATION', name: '台灣', icon: 'icon-map-pin' },
        { id: 'BUSINESS', name: '商業', icon: 'icon-briefcase' },
        { id: 'TECHNOLOGY', name: '科技', icon: 'icon-cpu' },
        { id: 'ENTERTAINMENT', name: '娛樂', icon: 'icon-film' },
        { id: 'SPORTS', name: '體育', icon: 'icon-trophy' },
        { id: 'HEALTH', name: '健康', icon: 'icon-heart-pulse' }
    ];

    React.useEffect(() => {
        let isMounted = true;
        let timeoutId;

        const fetchNews = async (showLoading = false) => {
            if (showLoading) {
                setLoading(true);
                setError(null);
            }
            try {
                const baseUrl = 'https://news.google.com/rss';
                const suffix = '?hl=zh-TW&gl=TW&ceid=TW:zh-Hant';
                const topicUrl = category ? `${baseUrl}/headlines/section/topic/${category}${suffix}` : `${baseUrl}${suffix}`;
                const proxyUrl = `https://proxy-api.trickle-app.host/?url=${encodeURIComponent(topicUrl)}`;
                
                const response = await fetch(proxyUrl);
                if (!response.ok) throw new Error('Network response was not ok');
                const text = await response.text();
                
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(text, "text/xml");
                const items = Array.from(xmlDoc.querySelectorAll("item")).map(item => {
                    const title = item.querySelector("title")?.textContent || '';
                    const link = item.querySelector("link")?.textContent || '';
                    const pubDate = item.querySelector("pubDate")?.textContent || '';
                    const source = item.querySelector("source")?.textContent || '';
                    const content = item.querySelector("description")?.textContent || '';
                    
                    let thumbnail = '';
                    if (content) {
                        const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
                        if (imgMatch) thumbnail = imgMatch[1];
                    }
                    
                    return { title, link, pubDate, source, content, thumbnail };
                });
                
                setArticles(items);
            } catch (err) {
                if (showLoading) {
                    console.error("News fetch error:", err);
                    setError('無法載入新聞，請稍後再試。');
                }
            } finally {
                if (showLoading) setLoading(false);
            }
        };
        
        const pollNews = async () => {
            if (!isMounted) return;
            if (!document.hidden) {
                await fetchNews(false);
            }
            if (isMounted) {
                timeoutId = setTimeout(pollNews, 60000); // 1 minute
            }
        };

        fetchNews(true).then(() => {
            pollNews();
        });

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [category]);

    const getFallbackImage = (cat) => {
        const map = {
            'WORLD': 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=500&q=80',
            'NATION': 'https://images.unsplash.com/photo-1494783367193-149034c05e8f?auto=format&fit=crop&w=500&q=80',
            'BUSINESS': 'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?auto=format&fit=crop&w=500&q=80',
            'TECHNOLOGY': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=80',
            'ENTERTAINMENT': 'https://images.unsplash.com/photo-1470229722913-7c092db62220?auto=format&fit=crop&w=500&q=80',
            'SPORTS': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=500&q=80',
            'HEALTH': 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=500&q=80'
        };
        return map[cat] || 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=500&q=80';
    };

    const extractImage = (item) => {
        if (item.thumbnail && item.thumbnail.includes('http')) return item.thumbnail;
        if (item.enclosure && item.enclosure.link) return item.enclosure.link;
        const match = item.content?.match(/<img[^>]+src="([^">]+)"/);
        if (match) return match[1];
        return getFallbackImage(category);
    };

    return (
        <div className="flex-1 bg-gray-50 flex flex-col h-full overflow-hidden w-full relative">
            {/* Header */}
            <div className="bg-white px-6 py-4 border-b border-gray-200 z-10 flex items-center justify-between shadow-sm sticky top-0 flex-shrink-0">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <div className="icon-newspaper mr-3 text-[var(--primary-color)]"></div>
                    每日新聞
                </h2>
                <div className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full hidden md:block">
                    更新於 {new Date().toLocaleDateString()}
                </div>
            </div>

            {/* Categories */}
            <div className="bg-white border-b border-gray-100 px-4 py-3 overflow-x-auto whitespace-nowrap custom-scrollbar flex space-x-2 flex-shrink-0">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`px-4 py-2 rounded-xl font-medium text-sm flex items-center transition-all ${
                            category === cat.id 
                            ? 'bg-[var(--primary-color)] text-white shadow-md shadow-emerald-200' 
                            : 'bg-gray-50 text-gray-600 hover:bg-emerald-50 hover:text-[var(--primary-color)]'
                        }`}
                    >
                        <div className={`${cat.icon} mr-2 text-lg`}></div>
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Feed */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar pb-20 md:pb-6">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse h-72">
                                <div className="w-full h-32 bg-gray-200 rounded-xl mb-4"></div>
                                <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 py-20">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
                            <div className="icon-triangle-alert text-4xl text-red-300"></div>
                        </div>
                        <p className="font-bold text-gray-600">{error}</p>
                        <button onClick={() => setCategory('')} className="mt-4 px-6 py-2 bg-[var(--primary-color)] text-white rounded-xl shadow-md hover:bg-[var(--primary-hover)] transition-colors">
                            重新載入
                        </button>
                    </div>
                ) : articles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 py-20">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <div className="icon-newspaper text-4xl text-gray-300"></div>
                        </div>
                        <p className="font-bold text-gray-600">目前沒有相關新聞</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {articles.map((item, idx) => (
                            <a 
                                href={item.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                key={idx}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col h-full"
                            >
                                <div className="h-40 md:h-48 overflow-hidden relative bg-gray-100 flex-shrink-0">
                                    <img 
                                        src={extractImage(item)} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        alt={item.title}
                                        onError={(e) => { e.target.src = getFallbackImage(category); }}
                                    />
                                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] md:text-xs px-2 py-1 rounded-md font-bold">
                                        {item.source || categories.find(c => c.id === category)?.name || '新聞'}
                                    </div>
                                </div>
                                <div className="p-4 md:p-5 flex flex-col flex-1">
                                    <h3 className="font-bold text-gray-800 text-sm md:text-base leading-snug mb-3 line-clamp-3 group-hover:text-[var(--primary-color)] transition-colors">
                                        {item.title}
                                    </h3>
                                    <div className="mt-auto flex items-center justify-between text-xs text-gray-400 font-medium">
                                        <span className="flex items-center">
                                            <div className="icon-clock mr-1 text-[10px]"></div>
                                            {new Date(item.pubDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                                        </span>
                                        <span className="flex items-center text-[var(--primary-color)] font-bold opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                            閱讀全文 <div className="icon-arrow-right ml-1 text-sm"></div>
                                        </span>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}