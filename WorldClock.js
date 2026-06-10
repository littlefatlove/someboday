function WorldClock() {
    const [time, setTime] = React.useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const cities = [
        { name: '台北 / 亞洲', tz: 'Asia/Taipei', flag: '🇹🇼' },
        { name: '東京 / 亞洲', tz: 'Asia/Tokyo', flag: '🇯🇵' },
        { name: '紐約 / 美洲', tz: 'America/New_York', flag: '🇺🇸' },
        { name: '倫敦 / 歐洲', tz: 'Europe/London', flag: '🇬🇧' },
        { name: '巴黎 / 歐洲', tz: 'Europe/Paris', flag: '🇫🇷' },
        { name: '雪梨 / 澳洲', tz: 'Australia/Sydney', flag: '🇦🇺' }
    ];

    return (
        <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                        <div className="icon-globe mr-3 text-[var(--primary-color)]"></div>
                        世界時鐘
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cities.map((city, idx) => {
                        const localTime = new Date(time.toLocaleString("en-US", {timeZone: city.tz}));
                        const hours = localTime.getHours();
                        const minutes = localTime.getMinutes();
                        const ampm = hours >= 12 ? 'PM' : 'AM';
                        const displayHours = hours % 12 || 12;
                        
                        return (
                            <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                                <div>
                                    <div className="text-gray-400 text-xs mb-1 font-bold">{city.flag} {city.tz.split('/')[0]}</div>
                                    <div className="font-bold text-gray-800 text-lg">{city.name.split(' / ')[0]}</div>
                                    <div className="text-xs text-gray-400 mt-1">{localTime.toLocaleDateString()}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-gray-800 tabular-nums">
                                        {displayHours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}
                                        <span className="text-sm ml-1 text-gray-400">{ampm}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}