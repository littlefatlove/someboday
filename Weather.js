function Weather() {
    const [weatherData, setWeatherData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [city, setCity] = React.useState({ name: '台北市', lat: 25.0478, lon: 121.5319 });

    const cities = [
        { name: '台北市', lat: 25.0478, lon: 121.5319 },
        { name: '新北市', lat: 25.0112, lon: 121.4617 },
        { name: '桃園市', lat: 24.9936, lon: 121.3010 },
        { name: '台中市', lat: 24.1469, lon: 120.6839 },
        { name: '台南市', lat: 22.9997, lon: 120.2270 },
        { name: '高雄市', lat: 22.6273, lon: 120.3014 }
    ];

    React.useEffect(() => {
        const fetchWeather = async () => {
            setLoading(true);
            setError(null);
            try {
                // Using Open-Meteo API (Free, no key required)
                const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FTaipei`;
                const proxyUrl = `https://proxy-api.trickle-app.host/?url=${encodeURIComponent(url)}`;
                
                const response = await fetch(proxyUrl);
                if (!response.ok) throw new Error('無法取得天氣資料');
                
                const data = await response.json();
                setWeatherData(data);
            } catch (err) {
                console.error("Weather fetch error:", err);
                setError('無法載入天氣，請稍後再試。');
            } finally {
                setLoading(false);
            }
        };
        
        fetchWeather();
    }, [city]);

    // WMO Weather interpretation codes
    const getWeatherInfo = (code, isDay = 1) => {
        const codes = {
            0: { text: '晴朗', icon: isDay ? 'icon-sun text-yellow-300' : 'icon-moon text-blue-200' },
            1: { text: '大部晴朗', icon: isDay ? 'icon-cloud-sun text-yellow-200' : 'icon-cloud-moon text-blue-200' },
            2: { text: '多雲', icon: 'icon-cloud text-gray-200' },
            3: { text: '陰天', icon: 'icon-cloud text-gray-400' },
            45: { text: '霧', icon: 'icon-cloud-fog text-gray-300' },
            48: { text: '霧淞', icon: 'icon-cloud-fog text-gray-300' },
            51: { text: '毛毛雨', icon: 'icon-cloud-drizzle text-blue-300' },
            53: { text: '毛毛雨', icon: 'icon-cloud-drizzle text-blue-300' },
            55: { text: '毛毛雨', icon: 'icon-cloud-drizzle text-blue-300' },
            61: { text: '小雨', icon: 'icon-cloud-rain text-blue-400' },
            63: { text: '中雨', icon: 'icon-cloud-rain text-blue-500' },
            65: { text: '大雨', icon: 'icon-cloud-rain text-blue-600' },
            71: { text: '小雪', icon: 'icon-snowflake text-white' },
            73: { text: '中雪', icon: 'icon-snowflake text-white' },
            75: { text: '大雪', icon: 'icon-snowflake text-white' },
            77: { text: '雪粒', icon: 'icon-snowflake text-white' },
            80: { text: '陣雨', icon: 'icon-cloud-rain text-blue-400' },
            81: { text: '陣雨', icon: 'icon-cloud-rain text-blue-500' },
            82: { text: '猛烈陣雨', icon: 'icon-cloud-rain text-blue-600' },
            95: { text: '雷雨', icon: 'icon-cloud-lightning text-yellow-400' },
            96: { text: '雷陣雨', icon: 'icon-cloud-lightning text-yellow-400' },
            99: { text: '雷陣雨', icon: 'icon-cloud-lightning text-yellow-400' }
        };
        return codes[code] || { text: '未知', icon: 'icon-cloud text-gray-200' };
    };

    const getDayName = (dateStr, index) => {
        if (index === 0) return '今天';
        if (index === 1) return '明天';
        const date = new Date(dateStr);
        return date.toLocaleDateString('zh-TW', { weekday: 'short' });
    };

    return (
        <div className="flex-1 bg-gradient-to-b from-sky-400 to-blue-300 p-6 overflow-y-auto w-full text-white">
            <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center drop-shadow-sm">
                        <div className="icon-cloud-sun mr-3"></div>
                        天氣預報
                    </h2>
                    
                    <div className="relative group">
                        <select 
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full appearance-none pr-8 cursor-pointer outline-none transition-colors border border-white/20 font-bold"
                            value={city.name}
                            onChange={(e) => {
                                const selected = cities.find(c => c.name === e.target.value);
                                if (selected) setCity(selected);
                            }}
                        >
                            {cities.map(c => (
                                <option key={c.name} value={c.name} className="text-gray-800">{c.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <div className="icon-chevron-down w-4 h-4"></div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="icon-loader animate-spin text-4xl mb-4 opacity-80"></div>
                        <p className="font-bold opacity-80">載入天氣資訊中...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white/10 rounded-3xl backdrop-blur-sm border border-white/20">
                        <div className="icon-triangle-alert text-4xl mb-4 text-red-300"></div>
                        <p className="font-bold mb-4">{error}</p>
                        <button 
                            onClick={() => setCity({...city})} 
                            className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm border border-white/20"
                        >
                            重試
                        </button>
                    </div>
                ) : weatherData && weatherData.current ? (
                    <div className="animate-fade-in-up">
                        <div className="text-center py-6">
                            <h3 className="text-3xl font-bold mb-2 drop-shadow-sm">{city.name}</h3>
                            <p className="text-blue-50 mb-6 font-medium">
                                {new Date().toLocaleDateString('zh-TW', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </p>
                            
                            <div className="relative inline-flex items-center justify-center mb-6 w-32 h-32">
                                <div className="absolute inset-0 bg-white/10 blur-2xl rounded-full"></div>
                                <div className={`${getWeatherInfo(weatherData.current.weather_code, weatherData.current.is_day).icon} text-8xl drop-shadow-lg relative z-10 ${weatherData.current.is_day && weatherData.current.weather_code <= 1 ? 'animate-[spin_30s_linear_infinite]' : 'animate-pulse'}`}></div>
                            </div>
                            
                            <h1 className="text-8xl font-bold tracking-tighter mb-2 drop-shadow-lg">
                                {Math.round(weatherData.current.temperature_2m)}°<span className="text-5xl text-blue-100 font-normal">C</span>
                            </h1>
                            <p className="text-2xl font-bold drop-shadow-sm mb-2">
                                {getWeatherInfo(weatherData.current.weather_code, weatherData.current.is_day).text}
                            </p>
                            <p className="text-sm text-blue-100 font-medium">
                                體感溫度 {Math.round(weatherData.current.apparent_temperature)}°C
                            </p>
                        </div>

                        <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 grid grid-cols-2 gap-4 mb-8 shadow-lg border border-white/20">
                            <div className="text-center">
                                <div className="icon-wind text-2xl mb-2 opacity-90 mx-auto drop-shadow-sm"></div>
                                <div className="text-xs opacity-80 mb-1 font-medium">風速</div>
                                <div className="font-bold text-lg">{Math.round(weatherData.current.wind_speed_10m)} km/h</div>
                            </div>
                            <div className="text-center border-l border-white/20">
                                <div className="icon-droplets text-2xl mb-2 opacity-90 mx-auto drop-shadow-sm"></div>
                                <div className="text-xs opacity-80 mb-1 font-medium">相對濕度</div>
                                <div className="font-bold text-lg">{weatherData.current.relative_humidity_2m}%</div>
                            </div>
                        </div>

                        <h3 className="font-bold mb-4 px-2 drop-shadow-sm text-lg">未來一週預報</h3>
                        <div className="bg-white/20 backdrop-blur-md rounded-3xl p-4 space-y-2 shadow-lg border border-white/20">
                            {weatherData.daily.time.map((time, index) => {
                                // Skip today in the forecast list if we only want future days, 
                                // but showing today's max/min is also useful. Let's show from today or tomorrow.
                                // We'll show next 5 days.
                                if (index === 0 || index > 5) return null;
                                
                                return (
                                    <div key={time} className="flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-white/10 transition-colors">
                                        <span className="w-14 font-bold">{getDayName(time, index)}</span>
                                        <div className="flex items-center flex-1 justify-center">
                                            <div className={`${getWeatherInfo(weatherData.daily.weather_code[index]).icon} text-2xl mr-3 drop-shadow-sm`}></div>
                                            <span className="text-sm font-medium w-16">
                                                {getWeatherInfo(weatherData.daily.weather_code[index]).text}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-end w-20 space-x-2">
                                            <span className="font-bold">{Math.round(weatherData.daily.temperature_2m_max[index])}°</span>
                                            <span className="text-sm opacity-60">{Math.round(weatherData.daily.temperature_2m_min[index])}°</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="text-center mt-6 text-xs text-blue-100 opacity-70">
                            天氣資料來源: Open-Meteo
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}