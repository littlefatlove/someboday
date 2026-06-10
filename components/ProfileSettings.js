function ProfileSettings({ user, onClose, onUpdate }) {
    const [avatarUrl, setAvatarUrl] = React.useState(user.objectData.avatar);
    const [coverUrl, setCoverUrl] = React.useState(user.objectData.cover_photo || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80");
    const [bio, setBio] = React.useState(user.objectData.bio || '');
    const [status, setStatus] = React.useState(user.objectData.status || 'online');
    const [password, setPassword] = React.useState(user.objectData.password || '');
    const [loading, setLoading] = React.useState(false);
    
    // Mail Setting state
    const [mailAccount, setMailAccount] = React.useState(null);
    const [mailPrefix, setMailPrefix] = React.useState('');
    const [mailLoading, setMailLoading] = React.useState(true);
    
    // Notification state
    const [notificationStatus, setNotificationStatus] = React.useState('Notification' in window ? Notification.permission : 'denied');

    React.useEffect(() => {
        const loadMailAcc = async () => {
            try {
                const acc = await getMailAccount(user.objectId);
                setMailAccount(acc);
            } catch (e) {
                console.error(e);
            } finally {
                setMailLoading(false);
            }
        };
        loadMailAcc();
    }, [user.objectId]);

    const handleCreateMail = async () => {
        if (!mailPrefix.trim()) return;
        const email = `${mailPrefix.trim().toLowerCase()}@someboday.mail`;
        setMailLoading(true);
        try {
            const newAcc = await createMailAccount(user.objectId, email);
            setMailAccount(newAcc);
            alert("信箱建立成功！");
        } catch (e) {
            alert(e.message || "建立失敗");
        } finally {
            setMailLoading(false);
        }
    };

    const handleRequestNotification = async () => {
        if (!("Notification" in window)) {
            alert("您的瀏覽器不支援桌面通知");
            return;
        }
        try {
            const permission = await Notification.requestPermission();
            setNotificationStatus(permission);
            if (permission === 'granted') {
                new Notification("通知已啟用", {
                    body: "您將可以在這裡收到新訊息通知！",
                    icon: "https://app.trickle.so/storage/public/images/anonymous/b88ec477-8a11-4117-b259-1a83974592eb.png"
                });
            } else if (permission === 'denied') {
                alert("您拒絕了通知權限，若要開啟請至瀏覽器網址列左側設定中修改。");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleToggleMail = async () => {
        if (!mailAccount) return;
        setMailLoading(true);
        try {
            const updated = await toggleMailAccount(mailAccount.objectId, !mailAccount.objectData.is_active);
            setMailAccount(updated);
        } catch (e) {
            alert("切換失敗");
        } finally {
            setMailLoading(false);
        }
    };
    const fileInputRef = React.useRef(null);
    const coverInputRef = React.useRef(null);

    const handleSave = async () => {
        setLoading(true);
        try {
            const updated = await updateUserProfile(user.objectId, {
                avatar: avatarUrl,
                cover_photo: coverUrl,
                bio: bio,
                status: status,
                password: password
            });
            
            // Update local storage
            localStorage.setItem('chat_user', JSON.stringify(updated));
            onUpdate(updated);
            onClose();
        } catch (error) {
            console.error(error);
            alert('更新失敗');
        } finally {
            setLoading(false);
        }
    };

    const randomizeAvatar = () => {
        const seed = Math.random().toString(36).substring(7);
        setAvatarUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`);
    };

    const compressToBlob = (file, maxSize, quality) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxSize) {
                            height *= maxSize / width;
                            width = maxSize;
                        }
                    } else {
                        if (height > maxSize) {
                            width *= maxSize / height;
                            height = maxSize;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    canvas.toBlob((blob) => {
                        const newFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(newFile);
                    }, 'image/jpeg', quality);
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    };

    const uploadFileToCloud = (file) => {
        return new Promise((resolve, reject) => {
            trickleUploadFile(
                file,
                (progress) => {},
                (url) => resolve(url),
                (err) => reject(err)
            ).catch(reject);
        });
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (file.size > 15 * 1024 * 1024) {
            alert("圖片過大，請選擇小於 15MB 的圖片");
            return;
        }

        try {
            setLoading(true);
            const compressedFile = await compressToBlob(file, 500, 0.85);
            const url = await uploadFileToCloud(compressedFile);
            setAvatarUrl(url);
        } catch (error) {
            console.error("Image upload failed:", error);
            alert("圖片上傳失敗，請重試");
        } finally {
            setLoading(false);
            e.target.value = null;
        }
    };

    const handleCoverUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (file.size > 15 * 1024 * 1024) {
            alert("圖片過大，請選擇小於 15MB 的圖片");
            return;
        }

        try {
            setLoading(true);
            const compressedFile = await compressToBlob(file, 1500, 0.85);
            const url = await uploadFileToCloud(compressedFile);
            setCoverUrl(url);
        } catch (error) {
            console.error("Image upload failed:", error);
            alert("圖片上傳失敗，請重試");
        } finally {
            setLoading(false);
            e.target.value = null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-emerald-50 to-white">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center">
                        <div className="icon-user-cog mr-2 text-[var(--primary-color)]"></div>
                        個人資料設定
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <div className="icon-x"></div>
                    </button>
                </div>
                
                <div className="p-0 overflow-y-auto custom-scrollbar relative">
                    {/* Cover Photo Section */}
                    <div className="relative h-32 bg-gray-100 group">
                        <img src={coverUrl} className="w-full h-full object-cover" alt="Cover" />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                                onClick={() => coverInputRef.current.click()}
                                className="bg-white/90 text-gray-800 px-4 py-2 rounded-full text-sm font-bold hover:bg-white flex items-center shadow-lg"
                            >
                                <div className="icon-camera mr-2"></div>
                               更換封面
                            </button>
                        </div>
                        <input 
                            type="file" 
                            ref={coverInputRef} 
                            onChange={handleCoverUpload} 
                            accept="image/*" 
                            className="hidden" 
                        />
                    </div>

                    <div className="px-6 pb-6">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center mb-6 -mt-12 relative z-10">
                            <div className="relative group">
                                <div className="w-36 h-36 rounded-full p-1 border-2 border-[var(--primary-color)] border-dashed">
                                    <img 
                                        src={avatarUrl} 
                                        className="w-full h-full rounded-full bg-gray-100 object-cover shadow-inner"
                                        alt="Avatar"
                                    />
                                </div>
                                
                                {/* Overlay Controls */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-black/40 backdrop-blur-sm absolute inset-0 rounded-full"></div>
                                    <div className="flex space-x-3 z-10">
                                        <button 
                                            onClick={randomizeAvatar}
                                            className="p-3 bg-white rounded-full text-gray-700 hover:text-[var(--primary-color)] transition-transform hover:scale-110 shadow-lg"
                                            title="隨機產生"
                                        >
                                            <div className="icon-refresh-ccw text-xl"></div>
                                        </button>
                                        <button 
                                            onClick={() => fileInputRef.current.click()}
                                            className="p-3 bg-white rounded-full text-gray-700 hover:text-[var(--primary-color)] transition-transform hover:scale-110 shadow-lg"
                                            title="上傳高畫質圖片"
                                        >
                                            <div className="icon-upload text-xl"></div>
                                        </button>
                                    </div>
                                </div>
                                {/* Loading Overlay */}
                                {loading && (
                                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center z-20">
                                        <div className="icon-loader animate-spin text-[var(--primary-color)] text-3xl"></div>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-gray-400 mt-3 font-medium bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                                支援高畫質圖片 (最高 1500px)
                            </p>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleAvatarUpload} 
                                accept="image/*" 
                                className="hidden" 
                            />
                        </div>

                        <div className="space-y-5">
                            <div className="group">
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">用戶名稱</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <div className="icon-user text-gray-400"></div>
                                    </div>
                                    <input
                                        type="text"
                                        value={user.objectData.username}
                                        disabled
                                        className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed font-medium"
                                    />
                                </div>
                            </div>



                            <div className="group">
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">狀態</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <div className="icon-activity text-gray-400"></div>
                                    </div>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-100 focus:border-[var(--primary-color)] transition-all bg-white hover:border-gray-300 appearance-none"
                                    >
                                        <option value="online">在線</option>
                                        <option value="busy">忙碌</option>
                                        <option value="offline">隱身</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                                        <div className="icon-chevron-down text-gray-400 w-4 h-4"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">個人簡介</label>
                                <div className="relative">
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-100 focus:border-[var(--primary-color)] h-28 resize-none transition-all bg-white hover:border-gray-300"
                                        placeholder="寫下你的心情或介紹..."
                                    ></textarea>
                                    <div className="absolute bottom-2 right-2 text-xs text-gray-300">
                                        {bio.length}/100
                                    </div>
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">專屬信箱</label>
                                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                                    {mailLoading ? (
                                        <div className="flex justify-center"><div className="icon-loader animate-spin text-[var(--primary-color)]"></div></div>
                                    ) : mailAccount ? (
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-bold text-gray-800 text-sm">{mailAccount.objectData.email_address}</div>
                                                <div className="text-xs text-gray-500 mt-1">狀態: {mailAccount.objectData.is_active ? '啟用中' : '已停用'}</div>
                                            </div>
                                            <button 
                                                onClick={handleToggleMail}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${mailAccount.objectData.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                                            >
                                                {mailAccount.objectData.is_active ? '停用' : '啟用'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="text-sm text-gray-600 mb-3">建立您的專屬信箱來收發郵件</div>
                                            <div className="flex items-center">
                                                <input 
                                                    type="text" 
                                                    value={mailPrefix}
                                                    onChange={e => setMailPrefix(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                                                    placeholder="輸入帳號"
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg text-sm focus:outline-none focus:border-[var(--primary-color)]"
                                                />
                                                <div className="bg-gray-200 px-3 py-2 border-y border-r border-gray-300 text-sm text-gray-600">@someboday.mail</div>
                                                <button 
                                                    onClick={handleCreateMail}
                                                    className="px-4 py-2 text-emerald-800 font-bold rounded-r-lg text-sm"
                                                    disabled={!mailPrefix.trim()}
                                                >
                                                    建立
                                                </button>
                                            </div>
                                            <div className="text-xs text-gray-400 mt-2">僅限英數字，建立後無法修改。</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">系統通知</label>
                                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-gray-800 text-sm">桌面與行動裝置通知</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {notificationStatus === 'granted' ? '已允許接收通知' : notificationStatus === 'denied' ? '已封鎖通知，請至瀏覽器設定開啟' : '尚未開啟通知權限'}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleRequestNotification();
                                        }}
                                        disabled={notificationStatus === 'granted'}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${notificationStatus === 'granted' ? 'text-gray-400 cursor-not-allowed' : 'text-emerald-800'}`}
                                    >
                                        {notificationStatus === 'granted' ? '已開啟' : '開啟通知'}
                                    </button>
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">修改密碼</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <div className="icon-lock text-gray-400"></div>
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-100 focus:border-[var(--primary-color)] transition-all bg-white hover:border-gray-300"
                                        placeholder="留空則保持原密碼"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                    <button 
                        onClick={onClose}
                        className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors font-medium"
                    >
                        取消
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={loading}
                        className="px-5 py-2.5 text-emerald-800 rounded-xl transition-all flex items-center shadow-lg shadow-emerald-200 font-bold transform active:scale-95"
                    >
                        {loading && <div className="icon-loader animate-spin mr-2"></div>}
                        儲存變更
                    </button>
                </div>
            </div>
        </div>
    );
}