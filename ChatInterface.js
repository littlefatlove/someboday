const VideoPlayerBubble = ({ msg }) => {
    const [videoSrc, setVideoSrc] = React.useState(msg.objectData.media_data || null);
    const [isLoading, setIsLoading] = React.useState(!msg.objectData.media_data && msg.objectData.media_id);

    React.useEffect(() => {
        let isMounted = true;
        if (!videoSrc && msg.objectData.media_id) {
            const fetchMedia = async () => {
                try {
                    const mediaObj = await getMedia(msg.objectData.media_id);
                    if (isMounted && mediaObj && mediaObj.objectData.data) {
                        setVideoSrc(mediaObj.objectData.data);
                    }
                } catch (err) {
                    console.error("Failed to load video", err);
                } finally {
                    if (isMounted) setIsLoading(false);
                }
            };
            fetchMedia();
        }
        return () => { isMounted = false; };
    }, [msg.objectData.media_id, videoSrc]);

    if (isLoading) {
        return (
            <div className="relative my-1 w-[280px] h-[160px] rounded-lg bg-black/10 flex items-center justify-center animate-pulse">
                <div className="icon-loader animate-spin text-[var(--primary-color)] text-2xl"></div>
            </div>
        );
    }

    if (!videoSrc) {
        return (
            <div className="relative my-1 w-[280px] h-[160px] rounded-lg bg-gray-200 flex flex-col items-center justify-center text-gray-500">
                <div className="icon-video text-3xl mb-2 opacity-50"></div>
                <span className="text-xs">無法載入影片</span>
            </div>
        );
    }

    return (
        <div className="relative my-1 max-w-[280px] md:max-w-sm rounded-lg overflow-hidden bg-black shadow-sm flex items-center justify-center min-h-[160px]">
            {typeof CustomVideoPlayer !== 'undefined' ? (
                <CustomVideoPlayer src={videoSrc} />
            ) : (
                <video src={videoSrc} controls className="max-w-full max-h-64 rounded-lg outline-none" />
            )}
        </div>
    );
};

const VoicePlayer = ({ msg, isMe }) => {
    const [audioSrc, setAudioSrc] = React.useState(msg.objectData.media_data || null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const audioRef = React.useRef(null);
    const [duration, setDuration] = React.useState(0);
    const [currentTime, setCurrentTime] = React.useState(0);

    const handlePlayPause = async (e) => {
        e.stopPropagation();
        if (!audioSrc) {
            setIsLoading(true);
            try {
                if (msg.objectData.media_id) {
                    const mediaObj = await getMedia(msg.objectData.media_id);
                    if (mediaObj && mediaObj.objectData.data) {
                        setAudioSrc(mediaObj.objectData.data);
                        setTimeout(() => {
                            if (audioRef.current) {
                                audioRef.current.play();
                                setIsPlaying(true);
                            }
                        }, 100);
                    }
                }
            } catch (err) {
                console.error(err);
                alert("無法載入語音");
            } finally {
                setIsLoading(false);
            }
        } else {
            if (audioRef.current) {
                if (isPlaying) {
                    audioRef.current.pause();
                    setIsPlaying(false);
                } else {
                    audioRef.current.play();
                    setIsPlaying(true);
                }
            }
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
    };

    const formatTime = (time) => {
        if (isNaN(time) || !isFinite(time)) return "0:00";
        const m = Math.floor(time / 60);
        const s = Math.floor(time % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className={`flex items-center space-x-3 w-48 md:w-64 p-2 rounded-xl ${isMe ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-800'}`}>
            <button 
                onClick={handlePlayPause}
                disabled={isLoading}
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${isMe ? 'bg-white text-emerald-600 hover:bg-emerald-50' : 'bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)]'}`}
            >
                {isLoading ? (
                    <div className="icon-loader animate-spin text-lg"></div>
                ) : isPlaying ? (
                    <div className="icon-pause text-lg fill-current"></div>
                ) : (
                    <div className="icon-play text-lg fill-current ml-1"></div>
                )}
            </button>
            <div className="flex-1 flex flex-col justify-center">
                <div className="h-1.5 w-full bg-black/10 rounded-full overflow-hidden relative">
                    <div className={`absolute top-0 left-0 h-full transition-all duration-200 ${isMe ? 'bg-white' : 'bg-[var(--primary-color)]'}`} style={{ width: `${progress}%` }}></div>
                </div>
                <div className="flex justify-between items-center mt-1.5">
                    <span className="text-[10px] font-mono opacity-80">{formatTime(currentTime)}</span>
                    <span className="text-[10px] font-mono opacity-80">
                        {duration ? formatTime(duration) : (JSON.parse(msg.objectData.metadata || '{}').size ? Math.round(JSON.parse(msg.objectData.metadata || '{}').size / 1024) + 'KB' : 'Voice')}
                    </span>
                </div>
            </div>
            {audioSrc && (
                <audio 
                    ref={audioRef} 
                    src={audioSrc} 
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={handleEnded}
                    className="hidden"
                />
            )}
        </div>
    );
};

function ChatInterface({ onUpdateTab, onAddTab, onShowTabsModal, tabsCount }) {
    const [activeTab, setActiveTab] = React.useState('home'); // home, inbox, chat, voom, moments, files, favorites, games, settings
    const [user, setUser] = React.useState(null);
    const [friends, setFriends] = React.useState([]);
    const [groups, setGroups] = React.useState([]);
    const [selectedFriend, setSelectedFriend] = React.useState(null);
    const [messages, setMessages] = React.useState([]);

    const isAdmin = user && user.objectData.username === 'littlefat';

    const updateUserPoints = async (amount, reason) => {
        if (!user) return false;
        if (isAdmin && amount < 0) return true; // Admin has infinite points for deductions

        try {
            const pointsType = `user_points:${user.objectId}`;
            const pointsList = await trickleListObjects(pointsType, 1);
            let currentPoints = 0;
            let pointsId = null;
            let currentData = { user_id: user.objectId, total_points: 0, checkin_streak: 0, last_checkin_date: '' };

            if (pointsList.items && pointsList.items.length > 0) {
                currentData = pointsList.items[0].objectData;
                pointsId = pointsList.items[0].objectId;
                currentPoints = currentData.total_points || 0;
            } else {
                const newObj = await trickleCreateObject(pointsType, currentData);
                pointsId = newObj.objectId;
            }

            if (amount < 0 && currentPoints + amount < 0) {
                alert(`積分不足！此操作需要 ${Math.abs(amount)} 積分，您目前只有 ${currentPoints} 積分。`);
                return false;
            }

            const newTotal = parseFloat((currentPoints + amount).toFixed(2));
            const updatedData = { ...currentData, total_points: newTotal };
            
            await trickleUpdateObject(pointsType, pointsId, updatedData);
            setTotalPoints(newTotal);

            const historyType = `points_history:${user.objectId}`;
            await trickleCreateObject(historyType, {
                user_id: user.objectId,
                amount: amount,
                reason: reason,
                created_at: new Date().toISOString()
            });

            return true;
        } catch (error) {
            console.error("Failed to update points", error);
            return false;
        }
    };
    const [showCreateGroupModal, setShowCreateGroupModal] = React.useState(false);
    const [showGroupSettings, setShowGroupSettings] = React.useState(false);
    const [inputText, setInputText] = React.useState('');
    const [showStickerPicker, setShowStickerPicker] = React.useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
    const [showAddFriendModal, setShowAddFriendModal] = React.useState(false);
    const [showProfileSettings, setShowProfileSettings] = React.useState(false);
    const [showFriendProfile, setShowFriendProfile] = React.useState(false); // New state
    const [showFriendRequests, setShowFriendRequests] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchResults, setSearchResults] = React.useState([]);
    const [isSearching, setIsSearching] = React.useState(false);
    const [loadingFriends, setLoadingFriends] = React.useState(true);
    const [pendingRequestsCount, setPendingRequestsCount] = React.useState(0);
    const [connectionError, setConnectionError] = React.useState(false);
    const [previewMedia, setPreviewMedia] = React.useState(null); // { url, type }
    const [pendingFile, setPendingFile] = React.useState(null); // { data, type, name, size, mime }
    const [isUploading, setIsUploading] = React.useState(false); // Add uploading state
    const [showMentionList, setShowMentionList] = React.useState(false); // For @ mentions
    const [specialEffect, setSpecialEffect] = React.useState(null); // For keywords animations
    const [showMsgSearch, setShowMsgSearch] = React.useState(false);
    const [msgSearchQuery, setMsgSearchQuery] = React.useState('');
    const [friendSearchQuery, setFriendSearchQuery] = React.useState(''); // For local friend list filtering
    const [customIcons, setCustomIcons] = React.useState({}); // New state for custom button icons
    const [isFriendTyping, setIsFriendTyping] = React.useState(false); // Typing status
    const [totalPoints, setTotalPoints] = React.useState(0); // Sync points
    
    const typingTimeoutRef = React.useRef(null);
    const lastTypingTimeRef = React.useRef(0);
    const [chatBg, setChatBg] = React.useState(null); // New state for chat room background
    const [hideBubbles, setHideBubbles] = React.useState(false); // New state for hide bubbles
    const [globalBg, setGlobalBg] = React.useState(null); // New state for global background
    
    // Ref for syncing settings correctly
    const settingsRef = React.useRef({ hideBubbles: false, customIcons: {}, globalBg: null });

    // Helper to save settings robustly
    const saveSettings = async (updates) => {
        const newSettings = { ...settingsRef.current, ...updates };
        settingsRef.current = newSettings;
        
        if (updates.hideBubbles !== undefined) setHideBubbles(updates.hideBubbles);
        if (updates.customIcons !== undefined) setCustomIcons(updates.customIcons);
        if (updates.globalBg !== undefined) setGlobalBg(updates.globalBg);
        
        if (user) {
            try {
                if (typeof safeDbCall === 'function') {
                    await safeDbCall(() => saveAppData(user.objectId, 'chat_settings', {
                        hide_bubbles: newSettings.hideBubbles,
                        custom_icons: newSettings.customIcons,
                        global_bg: newSettings.globalBg
                    }));
                } else {
                    await saveAppData(user.objectId, 'chat_settings', {
                        hide_bubbles: newSettings.hideBubbles,
                        custom_icons: newSettings.customIcons,
                        global_bg: newSettings.globalBg
                    });
                }
                
                // Fallback to local storage
                if (updates.hideBubbles !== undefined) localStorage.setItem(`hide_bubbles_${user.objectId}`, updates.hideBubbles.toString());
                if (updates.customIcons !== undefined) localStorage.setItem(`custom_icons_${user.objectId}`, JSON.stringify(updates.customIcons));
                if (updates.globalBg !== undefined) {
                    if (updates.globalBg) localStorage.setItem(`global_bg_${user.objectId}`, updates.globalBg);
                    else localStorage.removeItem(`global_bg_${user.objectId}`);
                }
            } catch (error) {
                console.warn("Save settings failed", error);
            }
        }
    };

    // Sync settings periodically across devices
    React.useEffect(() => {
        if (!user) return;
        const syncInterval = setInterval(async () => {
            try {
                let settings = null;
                if (typeof safeDbCall === 'function') {
                    settings = await safeDbCall(() => getAppData(user.objectId, 'chat_settings'));
                } else {
                    settings = await getAppData(user.objectId, 'chat_settings');
                }
                
                if (settings) {
                    let updated = false;
                    const newHideBubbles = settings.hide_bubbles || false;
                    const newCustomIcons = settings.custom_icons || {};
                    const newGlobalBg = settings.global_bg || null;

                    if (newHideBubbles !== settingsRef.current.hideBubbles) {
                        settingsRef.current.hideBubbles = newHideBubbles;
                        setHideBubbles(newHideBubbles);
                        localStorage.setItem(`hide_bubbles_${user.objectId}`, newHideBubbles.toString());
                        updated = true;
                    }
                    
                    if (JSON.stringify(newCustomIcons) !== JSON.stringify(settingsRef.current.customIcons)) {
                        settingsRef.current.customIcons = newCustomIcons;
                        setCustomIcons(newCustomIcons);
                        localStorage.setItem(`custom_icons_${user.objectId}`, JSON.stringify(newCustomIcons));
                        updated = true;
                    }

                    if (newGlobalBg !== settingsRef.current.globalBg) {
                        settingsRef.current.globalBg = newGlobalBg;
                        setGlobalBg(newGlobalBg);
                        if (newGlobalBg) {
                            localStorage.setItem(`global_bg_${user.objectId}`, newGlobalBg);
                        } else {
                            localStorage.removeItem(`global_bg_${user.objectId}`);
                        }
                        updated = true;
                    }
                }
            } catch (error) {
                console.error("Failed to sync settings", error);
            }
        }, 15000); // Check every 15 seconds

        return () => clearInterval(syncInterval);
    }, [user]);

    // Recording state
    const [isRecording, setIsRecording] = React.useState(false);
    const [recordingTime, setRecordingTime] = React.useState(0);
    const mediaRecorderRef = React.useRef(null);
    const audioChunksRef = React.useRef([]);
    const recordingTimerRef = React.useRef(null);

    const formatRecordingTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                if (audioChunksRef.current.length === 0) return;
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = async () => {
                    const base64data = reader.result;
                    const size = audioBlob.size;
                    setIsUploading(true);
                    try {
                        const metadata = JSON.stringify({ name: `Voice_${new Date().getTime()}.webm`, size: size, mime: 'audio/webm' });
                        const mediaObj = await uploadMedia(base64data, 'audio/webm', 'Voice Message');
                        await sendMessage(
                            user.objectId, 
                            selectedFriend.objectId, 
                            '[語音訊息]', 
                            'audio', 
                            metadata, 
                            null,
                            mediaObj.objectId
                        );
                        fetchMessages();
                    } catch (e) {
                        alert("語音發送失敗");
                    } finally {
                        setIsUploading(false);
                    }
                };
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            recordingTimerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error(err);
            alert("無法存取麥克風，請確認權限");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(recordingTimerRef.current);
        }
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            audioChunksRef.current = []; // Clear data so onstop does nothing
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(recordingTimerRef.current);
        }
    };

    // Chat Scroll State
    const [isAtBottom, setIsAtBottom] = React.useState(true);
    const [unreadBottomCount, setUnreadBottomCount] = React.useState(0);
    const scrollContainerRef = React.useRef(null);
    const prevMessagesLengthRef = React.useRef(0);

    // Inbox State
    const [inboxMessages, setInboxMessages] = React.useState([]);
    const [dismissedMsgs, setDismissedMsgs] = React.useState([]);
    const prevInboxIdsRef = React.useRef(new Set());
    const prevRequestIdsRef = React.useRef(new Set());
    const prevVoomIdsRef = React.useRef(new Set());
    const prevSocialIdsRef = React.useRef(new Set());
    const initialGlobalLoadRef = React.useRef(true);

    // New states for Files & Favorites
    const [userFiles, setUserFiles] = React.useState([]);
    const [userFavorites, setUserFavorites] = React.useState([]);
    const [loadingFiles, setLoadingFiles] = React.useState(false);
    const [loadingFavorites, setLoadingFavorites] = React.useState(false);
    
    // Notes State
    const [userNotes, setUserNotes] = React.useState([]);
    const [loadingNotes, setLoadingNotes] = React.useState(false);
    const [showNoteModal, setShowNoteModal] = React.useState(false);
    const [currentNote, setCurrentNote] = React.useState(null); // { id, title, content }
    const [noteTitle, setNoteTitle] = React.useState('');
    const [noteContent, setNoteContent] = React.useState('');
    const [savingNote, setSavingNote] = React.useState(false);

    // Tasks (Todo) State
    const [userTodos, setUserTodos] = React.useState([]);
    const [loadingTodos, setLoadingTodos] = React.useState(false);
    const [newTodoContent, setNewTodoContent] = React.useState('');
    const [addingTodo, setAddingTodo] = React.useState(false);
    
    // Tab title sync
    React.useEffect(() => {
        if (onUpdateTab) {
            let title = '首頁';
            if (activeTab === 'chat' && selectedFriend) {
                title = selectedFriend.isGroup ? selectedFriend.objectData.name : selectedFriend.objectData.username;
            } else {
                const tabNames = { home: '首頁', inbox: '最新消息', shared: '共享', voom: '影片', moments: '朋友圈', apps: '應用程式', settings: '設定', mail: '信箱', files: '檔案', favorites: '收藏', notes: '筆記', tasks: '待辦事項', admin_console: '管理員' };
                title = tabNames[activeTab] || '應用程式';
            }
            onUpdateTab({ title });
        }
    }, [activeTab, selectedFriend]);

    // Auto-scroll ref
    const messagesEndRef = React.useRef(null);
    const fileInputRef = React.useRef(null);
    const inputRef = React.useRef(null);

    // Image compression utility
    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    // Max dimension 1920px for good balance of quality and size
                    const MAX_WIDTH = 1920; 
                    const MAX_HEIGHT = 1920;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Compress to JPEG with 0.8 quality
                    // This typically brings 10MB photos down to < 500KB
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                    resolve(dataUrl);
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    };

    // Create a small thumbnail for preview in chat list
    const createThumbnail = (dataUrl) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = dataUrl;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_SIZE = 300; // Small size for chat bubble
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_SIZE) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Low quality jpeg for thumbnail
                resolve(canvas.toDataURL('image/jpeg', 0.6));
            };
        });
    };

    React.useEffect(() => {
        // Check login
        const storedUser = localStorage.getItem('chat_user');
        if (!storedUser) {
            window.location.href = 'index.html';
            return;
        }
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // Load cached friends and groups immediately to prevent empty flashes
        try {
            const cachedF = localStorage.getItem(`cached_friends_${parsedUser.objectId}`);
            if (cachedF) {
                const parsedF = JSON.parse(cachedF);
                if (parsedF.length > 0) {
                    setFriends(parsedF);
                    setLoadingFriends(false);
                }
            }
            const cachedG = localStorage.getItem(`cached_groups_${parsedUser.objectId}`);
            if (cachedG) {
                const parsedG = JSON.parse(cachedG);
                if (parsedG.length > 0) {
                    setGroups(parsedG);
                }
            }
        } catch(e) {
            console.error("Cache read error", e);
        }

        // Load custom settings from DB
        const loadSettings = async () => {
            try {
                let settings = null;
                if (typeof safeDbCall === 'function') {
                    settings = await safeDbCall(() => getAppData(parsedUser.objectId, 'chat_settings'));
                } else {
                    settings = await getAppData(parsedUser.objectId, 'chat_settings');
                }
                
                if (settings) {
                    settingsRef.current = {
                        hideBubbles: settings.hide_bubbles || false,
                        customIcons: settings.custom_icons || {},
                        globalBg: settings.global_bg || null
                    };
                    setHideBubbles(settingsRef.current.hideBubbles);
                    setCustomIcons(settingsRef.current.customIcons);
                    setGlobalBg(settingsRef.current.globalBg);
                    return;
                }
            } catch (e) {
                console.warn("Initial settings load failed", e);
            }
            
            // Fallback to local storage
            const fallbackSettings = { hideBubbles: false, customIcons: {}, globalBg: null };
            const savedIcons = localStorage.getItem(`custom_icons_${parsedUser.objectId}`);
            if (savedIcons) {
                try { fallbackSettings.customIcons = JSON.parse(savedIcons); } catch(e) {}
            }
            const hideBubblesSetting = localStorage.getItem(`hide_bubbles_${parsedUser.objectId}`);
            if (hideBubblesSetting) fallbackSettings.hideBubbles = hideBubblesSetting === 'true';
            const savedGlobalBg = localStorage.getItem(`global_bg_${parsedUser.objectId}`);
            if (savedGlobalBg) fallbackSettings.globalBg = savedGlobalBg;
            
            settingsRef.current = fallbackSettings;
            setHideBubbles(fallbackSettings.hideBubbles);
            setCustomIcons(fallbackSettings.customIcons);
            setGlobalBg(fallbackSettings.globalBg);
        };
        
        loadSettings();
        
        // Chat bg is loaded per friend now (in useEffect)

        // Presence System
        let activityTimeout;
        let currentStatus = 'online';
        
        const setStatus = async (newStatus) => {
            if (currentStatus !== newStatus && parsedUser) {
                currentStatus = newStatus;
                if (typeof updateUserStatus === 'function') {
                    await updateUserStatus(parsedUser.objectId, newStatus);
                }
            }
        };

        const resetActivity = () => {
            if (document.visibilityState === 'hidden') return;
            if (currentStatus !== 'online') setStatus('online');
            clearTimeout(activityTimeout);
            activityTimeout = setTimeout(() => setStatus('busy'), 3 * 60 * 1000); // 3 mins idle -> busy
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                setStatus('busy');
            } else {
                resetActivity();
            }
        };

        const handleBeforeUnload = () => {
            if (typeof updateUserStatus === 'function') {
                updateUserStatus(parsedUser.objectId, 'offline');
            }
        };

        // Initialize
        if (typeof updateUserStatus === 'function') {
            updateUserStatus(parsedUser.objectId, 'online');
        }
        resetActivity();

        window.addEventListener('mousemove', resetActivity);
        window.addEventListener('keydown', resetActivity);
        window.addEventListener('click', resetActivity);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('mousemove', resetActivity);
            window.removeEventListener('keydown', resetActivity);
            window.removeEventListener('click', resetActivity);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            clearTimeout(activityTimeout);
            if (typeof updateUserStatus === 'function') {
                updateUserStatus(parsedUser.objectId, 'offline');
            }
        };
    }, []);

    const handleButtonIconUpload = async (e, buttonId) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('請上傳圖片檔案');
            return;
        }
        
        if (typeof trickleUploadFile !== 'function') {
            alert('系統尚未準備好上傳功能，請稍後再試');
            return;
        }

        try {
            await trickleUploadFile(
                file,
                (progress) => {},
                async (url) => {
                    const newIcons = { ...settingsRef.current.customIcons, [buttonId]: url };
                    saveSettings({ customIcons: newIcons });
                },
                (err) => {
                    console.error("Upload failed", err);
                    alert("圖標上傳失敗");
                }
            );
        } catch (error) {
            console.error(error);
        }
        e.target.value = null; // Reset input
    };

    const handleResetIcon = (buttonId) => {
        const newIcons = { ...settingsRef.current.customIcons };
        delete newIcons[buttonId];
        saveSettings({ customIcons: newIcons });
    };

    const handleChatBgUpload = async (e) => {
        if (!selectedFriend) return;
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('請上傳圖片檔案');
            return;
        }
        
        if (typeof trickleUploadFile !== 'function') {
            alert('系統尚未準備好上傳功能，請稍後再試');
            return;
        }

        try {
            await trickleUploadFile(
                file,
                (progress) => { /* Optional: show progress */ },
                async (url) => {
                    setChatBg(url);
                    if (selectedFriend.isGroup) {
                        await updateGroupBg(selectedFriend.objectId, url);
                    } else if (selectedFriend.friendshipId) {
                        await updateFriendBg(selectedFriend.friendshipId, url);
                    }
                    loadAllData();
                },
                (err) => {
                    console.error("Upload failed:", err);
                    alert("上傳背景圖片失敗: " + err);
                }
            );
        } catch (error) {
            console.error(error);
            alert("上傳背景失敗");
        }
        e.target.value = null;
    };

    const handleResetChatBg = async () => {
        if (!selectedFriend) return;
        setChatBg(null);
        try {
            if (selectedFriend.isGroup) {
                await updateGroupBg(selectedFriend.objectId, '');
            } else if (selectedFriend.friendshipId) {
                await updateFriendBg(selectedFriend.friendshipId, '');
            }
            loadAllData();
        } catch (error) {
            console.error(error);
        }
    };

    const toggleHideBubbles = () => {
        saveSettings({ hideBubbles: !settingsRef.current.hideBubbles });
    };

    const handleGlobalBgUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('請上傳圖片檔案');
            return;
        }
        
        if (typeof trickleUploadFile !== 'function') {
            alert('系統尚未準備好上傳功能，請稍後再試');
            return;
        }

        try {
            await trickleUploadFile(
                file,
                (progress) => {},
                async (url) => {
                    saveSettings({ globalBg: url });
                },
                (err) => {
                    console.error("Upload failed:", err);
                    alert("上傳全局背景失敗");
                }
            );
        } catch (error) {
            console.error(error);
        }
        e.target.value = null;
    };

    const handleResetGlobalBg = () => {
        saveSettings({ globalBg: null });
    };

    // Load background specific to the selected conversation
    React.useEffect(() => {
        if (user && selectedFriend) {
            if (selectedFriend.isGroup) {
                const groupObj = groups.find(g => g.objectId === selectedFriend.objectId) || selectedFriend;
                setChatBg(groupObj.objectData.chat_bg || null);
            } else {
                const friendObj = friends.find(f => f.objectId === selectedFriend.objectId) || selectedFriend;
                setChatBg(friendObj.chatBg || null);
            }
        } else {
            setChatBg(null);
        }
    }, [user, selectedFriend, groups, friends]);

    React.useEffect(() => {
        if (user) {
            setDismissedMsgs(JSON.parse(localStorage.getItem(`dismissed_${user.objectId}`) || '[]'));
        }
    }, [user]);

    // Global notifications for inbox messages
    React.useEffect(() => {
        if (!user || inboxMessages.length === 0) return;
        
        const currentIds = new Set(inboxMessages.map(m => m.objectId));
        
        // Skip on initial load when prev is empty but we have a bunch of unread messages
        if (prevInboxIdsRef.current.size > 0) {
            const newMsgs = inboxMessages.filter(m => !prevInboxIdsRef.current.has(m.objectId));
            
            if (newMsgs.length > 0 && typeof window.showNotification === 'function') {
                newMsgs.forEach(msg => {
                    // Don't notify if we are actively chatting with this person and window is active
                    if (selectedFriend && msg.objectData.sender_id === selectedFriend.objectId && !document.hidden) {
                        return;
                    }
                    const senderName = msg.sender?.objectData?.username || '用戶';
                    const type = msg.objectData.msg_type;
                    const meta = msg.objectData.metadata ? JSON.parse(msg.objectData.metadata) : {};
                    const body = type === 'text' ? msg.objectData.content : 
                                 type === 'image' ? '[圖片]' : 
                                 type === 'sticker' ? '[貼圖]' : 
                                 type === 'audio' ? '[語音]' :
                                 type === 'video' ? '[影片]' :
                                 `[${meta.name || '檔案'}]`;
                    window.showNotification(`${senderName} 傳送了新訊息`, { body });
                });
            }
        }
        
        prevInboxIdsRef.current = currentIds;
    }, [inboxMessages, user, selectedFriend]);

    // Robust Polling for Global Data (Friends, Requests)
    React.useEffect(() => {
        if (!user) return;
        
        let isMounted = true;
        let timeoutId;

        const pollGlobalData = async () => {
            if (!isMounted) return;
            try {
                await loadAllData();
            } catch (e) {
                console.warn("Global polling error:", e);
            }
            // Schedule next poll only after current one finishes
            if (isMounted) {
                timeoutId = setTimeout(pollGlobalData, 15000); // Increased from 1s to 15s to reduce network load
            }
        };

        pollGlobalData();

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [user]);

    // Poll for Friend's Typing Status
    React.useEffect(() => {
        if (!user || !selectedFriend || selectedFriend.isGroup) {
            setIsFriendTyping(false);
            return;
        }

        let isMounted = true;
        let timeoutId;

        const checkTyping = async () => {
            if (!isMounted) return;
            try {
                // Fetch directly to get real-time typing status
                const friend = await safeDbCall(() => trickleGetObject('chat_user', selectedFriend.objectId));
                if (friend && isMounted) {
                    const { typing_to, typing_at } = friend.objectData;
                    const now = Date.now();
                    if (typing_to === user.objectId && (now - typing_at < 5000)) {
                        setIsFriendTyping(true);
                    } else {
                        setIsFriendTyping(false);
                    }
                }
            } catch(e) {}
            
            if (isMounted) {
                timeoutId = setTimeout(checkTyping, 5000); // Increased from 2s to 5s
            }
        };

        checkTyping();

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [user, selectedFriend]);

    // Cache for seamless chat switching
    const messagesCacheRef = React.useRef({});

    // Restore messages from cache when switching friends for seamless experience
    React.useEffect(() => {
        if (selectedFriend) {
            const cached = messagesCacheRef.current[selectedFriend.objectId] || [];
            setMessages(cached);
            prevMessagesLengthRef.current = cached.length;
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
            }, 10);
        } else {
            setMessages([]);
            prevMessagesLengthRef.current = 0;
        }
        setIsAtBottom(true);
        setUnreadBottomCount(0);
    }, [selectedFriend?.objectId]);

    // Robust Polling for Messages
    React.useEffect(() => {
        if (!user || !selectedFriend) return;

        let isMounted = true;
        let timeoutId;
        let isFirstLoad = true;

        const pollMessages = async () => {
            if (!isMounted) return;
            try {
                await fetchMessages();
                if (isFirstLoad) {
                    setTimeout(() => scrollToBottom(), 100);
                }
                isFirstLoad = false;
            } catch (e) {
                 console.warn("Message polling error:", e);
            }
            // Schedule next poll only after current one finishes
            if (isMounted) {
                timeoutId = setTimeout(pollMessages, 3000); // Increased from 1s to 3s
            }
        };

        pollMessages();

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [user, selectedFriend]);

    React.useEffect(() => {
        if (messages.length > prevMessagesLengthRef.current) {
            // New messages arrived
            const newMsgs = messages.slice(prevMessagesLengthRef.current);
            const othersNewMsgs = newMsgs.filter(m => m.objectData.sender_id !== user?.objectId);

            if (isAtBottom) {
                scrollToBottom();
            } else {
                // If not sent by me, increase unread count
                if (othersNewMsgs.length > 0) {
                    setUnreadBottomCount(prev => prev + othersNewMsgs.length);
                } else if (newMsgs.some(m => m.objectData.sender_id === user?.objectId)) {
                    scrollToBottom();
                }
            }
            
            // Active chat notification
            if (othersNewMsgs.length > 0 && typeof window.showNotification === 'function') {
                othersNewMsgs.forEach(latestMsg => {
                    // Skip if looking directly at the chat and document is not hidden
                    if (!document.hidden && selectedFriend && latestMsg.objectData.sender_id === selectedFriend.objectId) {
                        return;
                    }
                    const type = latestMsg.objectData.msg_type;
                    const senderName = selectedFriend?.isGroup ? selectedFriend.objectData.name : (selectedFriend?.objectData?.username || '用戶');
                    const meta = latestMsg.objectData.metadata ? JSON.parse(latestMsg.objectData.metadata) : {};
                    const body = type === 'text' ? latestMsg.objectData.content : 
                                 type === 'image' ? '[圖片]' : 
                                 type === 'sticker' ? '[貼圖]' : 
                                 type === 'audio' ? '[語音]' :
                                 type === 'video' ? '[影片]' :
                                 `[${meta.name || '檔案'}]`;
                    window.showNotification(`新訊息 - ${senderName}`, { body });
                });
            }
        } else if (messages.length < prevMessagesLengthRef.current) {
             // Messages deleted/revoked, optional scroll
        }
        prevMessagesLengthRef.current = messages.length;
    }, [messages, isAtBottom, user]);

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        // allow 5px threshold
        const isBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 5;
        setIsAtBottom(isBottom);
        if (isBottom) {
            setUnreadBottomCount(0);
        }
    };

    React.useEffect(() => {
        if (user && selectedFriend && messages.length > 0) {
            // Check for unread messages from friend and mark them
            const unreadFromFriend = messages.filter(m => 
                m.objectData.sender_id === selectedFriend.objectId && 
                !m.objectData.is_read
            );
            
            if (unreadFromFriend.length > 0) {
                markMessagesAsRead(unreadFromFriend);
            }
        }
    }, [messages, user, selectedFriend]);

    // Load and Poll Data when tab active (Sync across devices)
    React.useEffect(() => {
        if (!user) return;
        
        let isMounted = true;
        let timeoutId;
        let isFirstLoad = true;

        const loadActiveTabData = async () => {
            if (activeTab === 'files') await loadFiles();
            else if (activeTab === 'favorites') await loadFavorites();
            else if (activeTab === 'notes') await loadNotes();
            else if (activeTab === 'tasks') await loadTodos();
        };

        const pollTabData = async () => {
            if (!isMounted) return;
            if (isFirstLoad || !document.hidden) {
                try {
                    await loadActiveTabData();
                    isFirstLoad = false;
                } catch (e) {
                    console.warn("Tab polling error:", e);
                }
            }
            if (isMounted) {
                timeoutId = setTimeout(pollTabData, 5000);
            }
        };

        // Initial load & Start polling
        pollTabData();

        const handleVisibilityChange = () => {
            if (!document.hidden && isMounted) {
                clearTimeout(timeoutId);
                pollTabData();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [activeTab, user]);

    const loadTodos = async () => {
        setLoadingTodos(true);
        try {
            const todos = await getUserTodos(user.objectId);
            setUserTodos(todos);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingTodos(false);
        }
    };

    const handleAddTodo = async (e) => {
        e.preventDefault();
        if (!newTodoContent.trim()) return;
        
        setAddingTodo(true);
        try {
            await createTodo(user.objectId, newTodoContent);
            setNewTodoContent('');
            loadTodos();
        } catch (error) {
            alert("新增失敗: " + error.message);
        } finally {
            setAddingTodo(false);
        }
    };

    const handleToggleTodo = async (todo) => {
        try {
            // Optimistic update
            setUserTodos(prev => prev.map(t => 
                t.objectId === todo.objectId 
                    ? { ...t, objectData: { ...t.objectData, is_completed: !t.objectData.is_completed } }
                    : t
            ).sort((a, b) => {
                 // Sort locally
                if (a.objectData.is_completed === b.objectData.is_completed) {
                    return new Date(b.objectData.created_at) - new Date(a.objectData.created_at);
                }
                return a.objectData.is_completed ? 1 : -1;
            }));
            
            await toggleTodoStatus(todo.objectId, todo.objectData.is_completed);
            // Reload to ensure sync
            // loadTodos(); // Skip reload to prevent jumpiness, optimistic is enough usually
        } catch (error) {
            console.error(error);
            loadTodos(); // Revert on error
        }
    };

    const handleDeleteTodo = async (e, todoId) => {
        e.stopPropagation();
        if (!confirm("確定要刪除此任務嗎？")) return;
        try {
            await deleteTodo(todoId);
            setUserTodos(prev => prev.filter(t => t.objectId !== todoId));
        } catch (error) {
            alert("刪除失敗");
        }
    };

    const loadNotes = async () => {
        setLoadingNotes(true);
        try {
            const notes = await getUserNotes(user.objectId);
            setUserNotes(notes);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingNotes(false);
        }
    };

    const handleSaveNote = async () => {
        if (!noteTitle.trim()) {
            alert("請輸入標題");
            return;
        }
        
        setSavingNote(true);
        try {
            if (currentNote) {
                await updateNote(currentNote.objectId, noteTitle, noteContent);
            } else {
                await createNote(user.objectId, noteTitle, noteContent);
            }
            setShowNoteModal(false);
            setNoteTitle('');
            setNoteContent('');
            setCurrentNote(null);
            loadNotes();
        } catch (error) {
            alert("儲存失敗: " + error.message);
        } finally {
            setSavingNote(false);
        }
    };

    const handleDeleteNote = async (e, noteId) => {
        e.stopPropagation();
        if (!confirm("確定要刪除此筆記嗎？")) return;
        try {
            await deleteNote(noteId);
            loadNotes();
        } catch (error) {
            alert("刪除失敗");
        }
    };

    const openNoteModal = (note = null) => {
        if (note) {
            setCurrentNote(note);
            setNoteTitle(note.objectData.title);
            setNoteContent(note.objectData.content);
        } else {
            setCurrentNote(null);
            setNoteTitle('');
            setNoteContent('');
        }
        setShowNoteModal(true);
    };

    const loadFiles = async () => {
        setLoadingFiles(true);
        try {
            const files = await getAllUserFiles(user.objectId);
            setUserFiles(files);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingFiles(false);
        }
    };

    const loadFavorites = async () => {
        setLoadingFavorites(true);
        try {
            const favs = await getFavorites(user.objectId);
            setUserFavorites(favs);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingFavorites(false);
        }
    };

    const handleToggleFavorite = async (msg) => {
        try {
            const isFav = await checkIsFavorite(user.objectId, msg.objectId);
            if (isFav) {
                await removeFavorite(user.objectId, msg.objectId);
                alert("已取消收藏");
            } else {
                await addFavorite(user.objectId, msg.objectId);
                alert("已加入收藏");
            }
            // If in favorites tab, reload
            if (activeTab === 'favorites') loadFavorites();
        } catch (error) {
            console.error("Fav error", error);
            alert("操作失敗");
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        setIsAtBottom(true);
        setUnreadBottomCount(0);
    };

    const loadAllData = async () => {
        let hasError = false;

        try {
            const { friends: fetchedFriends, requests } = await fetchChatData(user.objectId);
            
            let newFriends = fetchedFriends || [];
            
            // Force inject system admin
            if (user.objectId !== 'system_admin' && !newFriends.some(f => f.objectId === 'system_admin')) {
                newFriends = [{
                    objectId: 'system_admin',
                    objectData: {
                        username: '系統管理員',
                        avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='100' height='100'%3E%3Crect width='24' height='24' fill='%2310b981'/%3E%3Cpath d='M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E",
                        status: 'online',
                        bio: '官方系統與客服管理員',
                        is_system: true
                    },
                    chatBg: null,
                    friendshipId: 'system_fixed'
                }, ...newFriends];
            }

            if (newFriends && Array.isArray(newFriends)) {
                setFriends(prev => {
                    if (JSON.stringify(prev) === JSON.stringify(newFriends)) return prev;
                    return newFriends;
                });
                localStorage.setItem(`cached_friends_${user.objectId}`, JSON.stringify(newFriends));
            }
            
            if (requests) {
                const currentReqIds = new Set(requests.map(r => r.objectId));
                if (!initialGlobalLoadRef.current && typeof window.showNotification === 'function') {
                    const newReqs = requests.filter(r => !prevRequestIdsRef.current.has(r.objectId));
                    newReqs.forEach(r => {
                        window.showNotification('新好友邀請', { body: '您收到了一個新的好友邀請！' });
                    });
                }
                prevRequestIdsRef.current = currentReqIds;
            }
            setPendingRequestsCount(requests ? requests.length : 0);

            // Fetch Voom & Social to notify globally
            if (typeof getPublicVoomFeed === 'function') {
                const voomPosts = await getPublicVoomFeed(user.objectId);
                const currentVoomIds = new Set(voomPosts.map(p => p.objectId));
                const subs = JSON.parse(localStorage.getItem(`voom_subs_${user.objectId}`) || '[]');
                
                if (!initialGlobalLoadRef.current && typeof window.showNotification === 'function') {
                    const newVoom = voomPosts.filter(p => !prevVoomIdsRef.current.has(p.objectId) && p.author.objectId !== user.objectId && subs.includes(p.author.objectId));
                    newVoom.forEach(p => {
                        window.showNotification('新影片', { body: `${p.author.objectData.username} 發佈了新的 someboday's 影片！` });
                    });
                }
                prevVoomIdsRef.current = currentVoomIds;
            }

            if (typeof getSocialFeed === 'function' && newFriends.length > 0) {
                const friendIds = newFriends.map(f => f.objectId);
                const socialPosts = await getSocialFeed(user.objectId, friendIds);
                const currentSocialIds = new Set(socialPosts.map(p => p.objectId));
                
                if (!initialGlobalLoadRef.current && typeof window.showNotification === 'function') {
                    const newSocial = socialPosts.filter(p => !prevSocialIdsRef.current.has(p.objectId) && p.author.objectId !== user.objectId);
                    newSocial.forEach(p => {
                        window.showNotification('朋友圈新動態', { body: `${p.author.objectData.username} 發佈了新的動態！` });
                    });
                }
                prevSocialIdsRef.current = currentSocialIds;
            }

        } catch (error) {
            console.error("Failed to fetch friends/feeds data:", error);
            hasError = true;
        }

        try {
            const userGroups = await getUserGroups(user.objectId);
            if (userGroups && Array.isArray(userGroups)) {
                setGroups(prev => {
                    if (JSON.stringify(prev) === JSON.stringify(userGroups)) return prev;
                    return userGroups;
                });
                localStorage.setItem(`cached_groups_${user.objectId}`, JSON.stringify(userGroups));
            }
        } catch (error) {
            console.error("Failed to fetch groups data:", error);
            hasError = true;
        }

        try {
            const unreads = await getUnreadMessages(user.objectId);
            const enrichedUnreads = await Promise.all(unreads.map(async m => {
                const sender = await window.getUserWithCache(m.objectData.sender_id);
                return { ...m, sender };
            }));
            setInboxMessages(enrichedUnreads.filter(m => m.sender));
        } catch (error) {
            console.error("Failed to fetch inbox data:", error);
            hasError = true;
        }

        try {
            const pointsType = `user_points:${user.objectId}`;
            let listFunc = typeof safeDbCall === 'function' ? () => safeDbCall(() => trickleListObjects(pointsType, 1)) : () => trickleListObjects(pointsType, 1);
            const pointsList = await listFunc();
            if (pointsList && pointsList.items && pointsList.items.length > 0) {
                setTotalPoints(pointsList.items[0].objectData.total_points || 0);
            } else {
                // Initialize if not exists
                const initData = { user_id: user.objectId, total_points: 0, checkin_streak: 0, last_checkin_date: '' };
                const createFunc = typeof safeDbCall === 'function' ? () => safeDbCall(() => trickleCreateObject(pointsType, initData)) : () => trickleCreateObject(pointsType, initData);
                await createFunc();
                setTotalPoints(0);
            }
        } catch (error) {
            console.error("Failed to fetch points data:", error);
        }

        setConnectionError(hasError);
        setLoadingFriends(false);
        initialGlobalLoadRef.current = false;
    };

    const handleDismissInboxMsg = (e, msgId) => {
        e.stopPropagation();
        const newDismissed = [...dismissedMsgs, msgId];
        setDismissedMsgs(newDismissed);
        localStorage.setItem(`dismissed_${user.objectId}`, JSON.stringify(newDismissed));
    };

    const fetchMessages = async () => {
        if (!selectedFriend) return;
        try {
            let msgs = [];
            if (selectedFriend.isGroup) {
                msgs = await getGroupMessages(selectedFriend.objectId);
            } else {
                msgs = await getMessages(user.objectId, selectedFriend.objectId);
            }
            messagesCacheRef.current[selectedFriend.objectId] = msgs;
            setMessages(msgs);
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
    };

    const checkSpecialEffects = (text) => {
        const keywords = {
            '生日快樂': '🎂',
            '恭喜': '🎉',
            '愛你': '❤️',
            '哈哈': '😄',
            'happy birthday': '🎂',
            'congrats': '🎉'
        };
        
        for (const [key, emoji] of Object.entries(keywords)) {
            if (text.toLowerCase().includes(key)) {
                triggerSpecialEffect(emoji);
                break;
            }
        }
    };

    const triggerSpecialEffect = (emoji) => {
        setSpecialEffect(emoji);
        setTimeout(() => setSpecialEffect(null), 3000); // Effect duration
    };

    const handleSendMessage = async () => {
        // Priority to pending file
        if (pendingFile) {
            // Optimistic UI updates could be tricky for files due to upload time, so we keep spinner
            setIsUploading(true);
            try {
                const metadata = JSON.stringify({ name: pendingFile.name, size: pendingFile.size, mime: pendingFile.mime });
                const summary = `[${pendingFile.type.toUpperCase()}] ${pendingFile.name}`;
                
                // Logic to separate large files
                const LARGE_FILE_THRESHOLD = 0; 
                let mediaId = null;
                let mediaDataToSave = pendingFile.data;

                if (pendingFile.type === 'image') {
                    try {
                        mediaDataToSave = await createThumbnail(pendingFile.data);
                    } catch (e) {
                        console.warn("Thumbnail generation failed, using null", e);
                        mediaDataToSave = null;
                    }
                } else {
                    mediaDataToSave = null;
                }

                if (pendingFile.size > LARGE_FILE_THRESHOLD) {
                    try {
                        if (typeof trickleUploadFile === 'function' && pendingFile.file) {
                            const url = await new Promise((resolve, reject) => {
                                trickleUploadFile(
                                    pendingFile.file,
                                    (progress) => {}, // Optionally we could add progress state
                                    (fileUrl) => resolve(fileUrl),
                                    (error) => reject(new Error(error))
                                );
                            });
                            mediaDataToSave = url;
                            mediaId = null;
                        } else {
                            const mediaObj = await uploadMedia(pendingFile.data, pendingFile.mime, pendingFile.name);
                            mediaId = mediaObj.objectId;
                        }
                    } catch (uploadError) {
                        console.error("Media upload failed:", uploadError);
                        alert("檔案上傳失敗: " + uploadError.message);
                        setIsUploading(false);
                        return;
                    }
                }

                await sendMessage(
                    user.objectId, 
                    selectedFriend.objectId, 
                    summary, 
                    pendingFile.type, 
                    metadata, 
                    mediaDataToSave,
                    mediaId
                );
                
                setPendingFile(null);
                setInputText('');
                setShowStickerPicker(false);
                setShowEmojiPicker(false);
                fetchMessages(); // Background fetch
                return;
            } catch (error) {
                console.error("Send file error:", error);
                alert('訊息傳送失敗: ' + (error.message || "未知錯誤"));
                return;
            } finally {
                setIsUploading(false);
            }
        }

        // Text message
        if (!inputText.trim()) return;
        
        const textToSend = inputText;
        
        // Optimistic UI Update: Clear input immediately
        setInputText('');
        setShowStickerPicker(false);
        setShowEmojiPicker(false);
        inputRef.current?.focus();
        
        // Add temporary message to list for instant feedback (Optional, but clearing input feels fast)
        // Check for special keywords
        checkSpecialEffects(textToSend);
        
        try {
            await sendMessage(user.objectId, selectedFriend.objectId, textToSend, 'text', '{}', null);
            
            // Clear typing status immediately upon sending
            if (!selectedFriend.isGroup) {
                clearTimeout(typingTimeoutRef.current);
                safeDbCall(() => trickleGetObject('chat_user', user.objectId)).then(u => {
                    if (u) trickleUpdateObject('chat_user', user.objectId, { ...u.objectData, typing_to: '', typing_at: 0 });
                });
            }
            
            fetchMessages(); // Refresh to get real object with ID
        } catch (error) {
            console.error("Send message error:", error);
            alert('傳送失敗: ' + (error.message || "未知錯誤"));
            setInputText(textToSend); // Restore input on failure
        }
    };

    // Helper for stickers (direct send)
    const handleSendSticker = async (url, id) => {
        try {
            await sendMessage(user.objectId, selectedFriend.objectId, '[STICKER]', 'sticker', JSON.stringify({id}), url);
            setShowStickerPicker(false);
            fetchMessages();
        } catch (error) {
            console.error("Send sticker error:", error);
        }
    };

    const handleRevokeMessage = async (msg) => {
        if (!confirm("確定要收回此訊息嗎？")) return;
        try {
            await revokeMessage(msg);
            fetchMessages();
        } catch (error) {
            alert("收回失敗");
        }
    };

    const handleMediaClick = async (msg) => {
        const { media_id, media_data, msg_type } = msg.objectData;
        
        // If we have media_id, fetch the high-res version
        if (media_id) {
            try {
                // We could show a loading state here if needed
                const mediaObj = await getMedia(media_id);
                if (mediaObj && mediaObj.objectData.data) {
                    setPreviewMedia({ url: mediaObj.objectData.data, type: msg_type });
                } else {
                    alert("無法讀取原始檔案");
                    // Fallback to thumbnail if available
                    if (media_data) {
                        setPreviewMedia({ url: media_data, type: msg_type });
                    }
                }
            } catch (error) {
                console.error("Fetch media error:", error);
                alert("讀取高畫質圖片失敗，顯示預覽圖");
                // Fallback to thumbnail if available
                if (media_data) {
                    setPreviewMedia({ url: media_data, type: msg_type });
                }
            }
            return;
        }

        // If no media_id (old messages or small files), use media_data directly
        if (media_data) {
            setPreviewMedia({ url: media_data, type: msg_type });
            return;
        }

        alert("此檔案無法預覽");
    };

    const handleFileDownload = async (msg) => {
         const { media_id, media_data, metadata } = msg.objectData;
         const meta = metadata ? JSON.parse(metadata) : {};
         const fileName = meta.name || 'download';
         
         let dataUrl = media_data;
         
         if (media_id && (!dataUrl || dataUrl === 'MEDIA_REF')) {
             try {
                const mediaObj = await getMedia(media_id);
                if (mediaObj) dataUrl = mediaObj.objectData.data;
             } catch (error) {
                 alert("下載失敗: 無法取得檔案");
                 return;
             }
         }
         
         if (!dataUrl) return;
         
         const a = document.createElement('a');
         a.href = dataUrl;
         a.download = fileName;
         document.body.appendChild(a);
         a.click();
         document.body.removeChild(a);
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const dm = 1;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const handleSearchUsers = async () => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        setSearchResults([]); // Clear previous results
        
        try {
            // Use callback to append results as they are found
            await searchUsers(searchQuery, user.objectId, (newMatches) => {
                setSearchResults(prev => {
                    // Filter duplicates just in case
                    const existingIds = new Set(prev.map(u => u.objectId));
                    const uniqueNew = newMatches.filter(u => !existingIds.has(u.objectId));
                    return [...prev, ...uniqueNew];
                });
            });
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearching(false);
        }
    };

    // Clear search when modal opens
    React.useEffect(() => {
        if (showAddFriendModal) {
            setSearchQuery('');
            setSearchResults([]);
        }
    }, [showAddFriendModal]);

    const handleAddFriend = async (targetUser) => {
        const hasPoints = await updateUserPoints(-0.2, '新增好友');
        if (!hasPoints) return;
        try {
            await addFriend(user.objectId, targetUser.objectId);
            alert('已發送好友邀請');
            // Refresh requests to update status immediately if needed, or just let UI show "Pending"
            setSearchQuery('');
            setSearchResults([]);
            setShowAddFriendModal(false);
            loadAllData(); // Refresh to ensure we catch the pending status if we search again
        } catch (error) {
            alert('發送邀請失敗: ' + error.message);
        }
    };

    const handleDeleteFriend = async (friendId) => {
        // Optimistic UI Update
        setFriends(prev => prev.filter(f => f.objectId !== friendId));
        if (selectedFriend && selectedFriend.objectId === friendId) {
            setSelectedFriend(null);
        }
        setShowFriendProfile(false);

        try {
            await deleteFriend(user.objectId, friendId);
        } catch (error) {
            console.error("Failed to delete friend", error);
            alert("刪除失敗，請稍後再試");
            loadAllData(); // Revert/Refresh
        }
    };
    
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            let processedDataUrl;
            let fileType = 'file';
            let mime = file.type || 'application/octet-stream';
            let dataSize = file.size;

            if (file.type.startsWith('image/')) {
                processedDataUrl = await compressImage(file);
                fileType = 'image';
                mime = 'image/jpeg';
                dataSize = Math.round(processedDataUrl.length * 0.75);
            } else {
                if (file.type.startsWith('video/')) fileType = 'video';
                else if (file.type.startsWith('audio/')) fileType = 'audio';
                
                processedDataUrl = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (event) => resolve(event.target.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            }
            
            setPendingFile({
                file: file,
                data: processedDataUrl,
                type: fileType,
                name: file.name,
                size: dataSize,
                mime: mime
            });
        } catch (error) {
            console.error("File processing error:", error);
            alert("檔案處理失敗");
        }
        e.target.value = null;
    };

    const handleLogout = async () => {
        if (user && typeof updateUserStatus === 'function') {
            await updateUserStatus(user.objectId, 'offline');
        }
        localStorage.removeItem('chat_user');
        window.location.href = 'index.html';
    };

    const insertEmoji = (emoji) => {
        setInputText(prev => prev + emoji);
    };

    const handleInput = (e) => {
        const val = e.target.value;
        setInputText(val);
        
        // Typing indicator logic
        if (selectedFriend && !selectedFriend.isGroup) {
            const now = Date.now();
            if (now - lastTypingTimeRef.current > 3000) {
                lastTypingTimeRef.current = now;
                // Send typing status
                if (user) {
                    safeDbCall(() => trickleGetObject('chat_user', user.objectId)).then(u => {
                        if (u) {
                            trickleUpdateObject('chat_user', user.objectId, {
                                ...u.objectData,
                                typing_to: selectedFriend.objectId,
                                typing_at: now
                            }).catch(console.error);
                        }
                    });
                }
            }
            
            // Clear typing status after 3 seconds of no input
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                if (user) {
                    safeDbCall(() => trickleGetObject('chat_user', user.objectId)).then(u => {
                        if (u) {
                            trickleUpdateObject('chat_user', user.objectId, {
                                ...u.objectData,
                                typing_to: '',
                                typing_at: 0
                            }).catch(console.error);
                        }
                    });
                }
            }, 3000);
        }
        
        // Simple mention detection: if ends with '@'
        if (val.endsWith('@')) {
            setShowMentionList(true);
        } else {
            setShowMentionList(false);
        }
    };
    
    const insertMention = (friendUsername) => {
        setInputText(prev => prev + friendUsername + ' ');
        setShowMentionList(false);
        inputRef.current?.focus();
    };

    if (!user) return <div className="h-screen flex items-center justify-center bg-green-50"><div className="icon-loader animate-spin text-2xl text-[var(--primary-color)]"></div></div>;

    // Mobile check to handle "Back" functionality
    const handleBackToFriends = () => {
        setSelectedFriend(null);
    };

    return (
        <div 
            className="flex h-full font-sans overflow-hidden shadow-2xl relative transition-all duration-500"
            style={globalBg ? {
                backgroundImage: `url(${globalBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            } : {}}
        >
            {!globalBg && <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 via-green-50 to-teal-100 -z-10"></div>}
            
            {/* Background Decorative Orbs */}
            {!globalBg && (
                <>
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-300/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 pointer-events-none"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-teal-300/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 pointer-events-none"></div>
                </>
            )}

            {/* Special Effects Overlay */}
            {specialEffect && (
                <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center overflow-hidden">
                    {/* Just a simple rain of emojis */}
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div 
                            key={i}
                            className="absolute text-6xl animate-bounce"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `-10%`,
                                animation: `fall ${2 + Math.random()}s linear forwards`,
                                animationDelay: `${Math.random()}s`
                            }}
                        >
                            {specialEffect}
                        </div>
                    ))}
                    <style>{`
                        @keyframes fall {
                            to { transform: translateY(110vh) rotate(360deg); }
                        }
                    `}</style>
                </div>
            )}

            {/* Bottom Toolbar Navigation */}
            <div className="fixed bottom-0 left-0 right-0 h-14 md:h-16 liquid-glass !border-b-0 !border-x-0 !rounded-none flex flex-row items-center justify-between z-40 px-2 md:px-4 space-x-1 md:space-x-2">
                 
                 <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
                     {onAddTab && (
                         <button 
                             onClick={onAddTab} 
                             className="w-8 h-8 md:w-10 md:h-10 bg-white/80 backdrop-blur rounded-full shadow-sm flex items-center justify-center text-gray-600 hover:text-[var(--primary-color)] hover:bg-emerald-50 transition-all border border-gray-200 active:scale-95 flex-shrink-0"
                             title="新增分頁"
                         >
                             <div className="icon-plus text-base md:text-xl"></div>
                         </button>
                     )}
                     <img 
                        src={user.objectData.avatar} 
                        className="w-8 h-8 rounded-full bg-gray-100 object-cover border border-white/60 shadow-sm cursor-pointer hover:scale-105 transition-transform flex-shrink-0 hidden md:block" 
                        alt="Avatar" 
                        onClick={() => setShowProfileSettings(true)} 
                     />
                 </div>

                 <div className="flex-1 flex justify-start md:justify-center overflow-hidden">
                     <div className="overflow-x-auto custom-scrollbar max-w-full w-max bg-emerald-500/15 backdrop-blur-lg rounded-[2rem] shadow-[inset_0_1px_2px_rgba(255,255,255,0.6),0_4px_12px_rgba(16,185,129,0.1)] border border-emerald-500/20 mx-auto md:mx-0 my-auto">
                         <div className="flex p-1 flex-nowrap w-max">
                     {[
                        ...(isAdmin ? [{ id: 'admin_console', icon: 'icon-shield-alert', title: '管理員' }] : []),
                        { id: 'home', icon: 'icon-house', title: '首頁' },
                        { id: 'inbox', icon: 'icon-inbox', title: '最新消息' },
                        { id: 'chat', icon: 'icon-message-circle', title: '聊天' },
                        { id: 'shared', icon: 'icon-images', title: '共享' },
                        { id: 'voom', icon: 'icon-clapperboard', title: '影片' },
                        { id: 'moments', icon: 'icon-aperture', title: '朋友圈' },
                        { id: 'mail', icon: 'icon-mail', title: '信箱' },
                        { id: 'points', icon: 'icon-coins', title: '積分' },
                        { id: 'apps', icon: 'icon-layout-grid', title: '應用程式' },
                        { id: 'settings', icon: 'icon-settings', title: '設定' }
                     ].map(tab => {
                         const isAppTabActive = (tabId) => {
                             if (activeTab === tabId) return true;
                             if (tabId === 'apps') {
                                 return ['files', 'favorites', 'notes', 'tasks', 'news', 'weather', 'translator', 'whiteboard', 'games', 'music', 'calculator', 'calendar', 'worldclock', 'expense', 'converter', 'stopwatch', 'passwordgen', 'bmicalc', 'pomodoro', 'randompicker', 'colorpicker', 'dictionary', 'qrmaker', 'habittracker', 'textcounter', 'tipcalc', 'diceroller', 'coinflipper', 'base64', 'jsonformat', 'gradientgen', 'urltool', 'loremgen', 'agecalc', 'interestcalc', 'discountcalc', 'morsecode', 'aspectratio', 'datediff', 'regextester', 'uuidgen', 'bpmcounter', 'tts', 'baseconverter', 'wordscrambler', 'html_encode', 'case_convert', 'color_convert', 'percentage_calc', 'loan_calc', 'margin_calc', 'salary_calc', 'rule_of_three', 'gcd_lcm', 'prime_checker', 'roman_numeral', 'num_to_words', 'time_calc', 'bmr_calc', 'speed_calc', 'countdown', 'tally', 'random_num', 'hash_gen', 'csv_json', 'water_track', 'white_noise', 'reaction', 'markdown', 'ip_info'].includes(activeTab);
                             }
                             return false;
                         };
                         const isActive = isAppTabActive(tab.id);
                         
                         return (
                         <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center justify-center rounded-full transition-all duration-300 group relative flex-shrink-0 overflow-hidden ${
                                isActive 
                                ? 'px-3 py-1.5 md:px-4 md:py-2 bg-white text-[var(--primary-color)] font-bold shadow-[0_2px_10px_rgba(16,185,129,0.2)] scale-100 backdrop-blur-sm' 
                                : 'w-8 h-8 md:w-10 md:h-10 text-emerald-700/70 hover:text-[var(--primary-color)] hover:bg-white/40 scale-95'
                            }`}
                            title={tab.title}
                         >
                             {customIcons[tab.id] ? (
                                 <img src={customIcons[tab.id]} className={`w-3.5 h-3.5 md:w-4 md:h-4 object-contain transition-transform group-active:scale-90 ${isActive ? 'mr-1.5' : ''} ${isActive ? '' : 'opacity-60 saturate-50'}`} alt={tab.title} />
                             ) : (
                                 <div className={`${tab.icon} text-sm md:text-base transition-transform group-active:scale-90 ${isActive ? 'mr-1.5' : ''}`}></div>
                             )}
                             {isActive && <span className="text-xs md:text-sm whitespace-nowrap animate-fade-in">{tab.title}</span>}
                         </button>
                     )})}
                         </div>
                     </div>
                 </div>

                 <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
                     {onShowTabsModal && (
                         <button 
                             onClick={onShowTabsModal} 
                             className="w-8 h-8 md:w-10 md:h-10 bg-white/80 backdrop-blur rounded-full shadow-sm flex items-center justify-center text-gray-600 hover:text-[var(--primary-color)] hover:bg-emerald-50 transition-all border border-gray-200 active:scale-95 relative flex-shrink-0"
                             title="管理分頁"
                         >
                             <div className="icon-chart-column text-base md:text-xl"></div>
                             {tabsCount > 1 && (
                                 <span className="absolute -top-1 -right-1 bg-[var(--primary-color)] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                                     {tabsCount}
                                 </span>
                             )}
                         </button>
                     )}
                     <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-500 hover:bg-white/50 rounded-full transition-colors hidden md:block flex-shrink-0" title="登出">
                         <div className="icon-log-out text-lg md:text-xl"></div>
                     </button>
                 </div>
            </div>

            {/* Main Content Container */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden pb-14 md:pb-16 relative w-full">
            
            {/* Contact List / Sub-Sidebar (Contacts list for chat) */}
            {activeTab === 'chat' && (
                <div className={`liquid-glass !border-y-0 !border-l-0 !rounded-none flex-col flex-shrink-0 z-20 h-full ${selectedFriend ? 'hidden md:flex' : 'flex w-full'} md:w-72`}>
                    {/* Mobile Header for Profile/Logout */}
                    <div className="md:hidden p-4 border-b border-white/40 flex justify-between items-center bg-white/40 backdrop-blur-sm sticky top-0 z-10">
                         <div className="flex items-center" onClick={() => setShowProfileSettings(true)}>
                            <img src={user.objectData.avatar} className="w-8 h-8 rounded-full bg-gray-200 border border-gray-200" />
                            <span className="ml-2 font-bold text-gray-800">{user.objectData.username}</span>
                         </div>
                         <button onClick={handleLogout} className="text-gray-400 p-2"><div className="icon-log-out"></div></button>
                    </div>

                    {/* Header */}
                    <div className="p-4 border-b border-white/40 bg-white/20">
                        <div className="flex items-center space-x-2 liquid-input rounded-xl px-3 py-2 transition-all group">
                            <div className="icon-search text-gray-500 group-focus-within:text-[var(--primary-color)]"></div>
                            <input 
                                type="text" 
                                placeholder="搜尋好友" 
                                value={friendSearchQuery}
                                onChange={(e) => setFriendSearchQuery(e.target.value)}
                                className="bg-transparent border-none text-sm outline-none w-full text-gray-700 placeholder-gray-500" 
                            />
                            {friendSearchQuery && (
                                <button onClick={() => setFriendSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                                    <div className="icon-x-circle w-4 h-4"></div>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="px-4 py-2 flex items-center justify-between border-b border-gray-100">
                         <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">聊天列表</span>
                         <div className="flex space-x-1">
                             <button onClick={() => setShowCreateGroupModal(true)} className="p-1.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded transition-colors" title="建立群組">
                                 <div className="icon-users text-sm"></div>
                             </button>
                             <button onClick={() => setShowAddFriendModal(true)} className="p-1.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded transition-colors" title="新增好友">
                                 <div className="icon-user-plus text-sm"></div>
                             </button>
                         </div>
                    </div>

                    {/* Chat List (Groups + Friends) */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {/* Friend Requests Item */}
                        {pendingRequestsCount > 0 && (
                            <div onClick={() => setShowFriendRequests(true)} className="px-3 py-3 mx-2 mb-2 bg-red-50 rounded-xl cursor-pointer hover:bg-red-100 transition-colors flex items-center justify-between border border-red-100">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-500">
                                        <div className="icon-user-plus"></div>
                                    </div>
                                    <span className="ml-3 text-sm font-bold text-gray-700">新的好友邀請</span>
                                </div>
                                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingRequestsCount}</span>
                            </div>
                        )}

                        {loadingFriends ? (
                            <div className="flex justify-center py-4 text-gray-400">
                                <div className="icon-loader animate-spin text-[var(--primary-color)]"></div>
                            </div>
                        ) : (
                            <ul className="px-2 space-y-1 mt-2">
                                {/* Render Groups */}
                                {groups
                                    .filter(group => {
                                        if (!friendSearchQuery) return true;
                                        const name = group.objectData.name || '';
                                        return name.toLowerCase().includes(friendSearchQuery.toLowerCase());
                                    })
                                    .map(group => (
                                    <li 
                                        key={group.objectId}
                                        onClick={() => setSelectedFriend(group)}
                                        className={`px-3 py-3 cursor-pointer hover:bg-gray-50 rounded-xl transition-all duration-200 border border-transparent ${selectedFriend?.objectId === group.objectId ? 'bg-emerald-50 border-emerald-100 shadow-sm' : ''}`}
                                    >
                                        <div className="flex items-center">
                                            <div className="relative">
                                                <img src={group.objectData.avatar} className="w-10 h-10 rounded-xl bg-gray-200 object-cover border border-emerald-100" alt="Group Avatar" />
                                                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-white">
                                                    <div className="icon-users text-[8px]"></div>
                                                </div>
                                            </div>
                                            <div className="ml-3 flex-1 overflow-hidden">
                                                <h3 className="text-sm font-bold text-gray-800 truncate">{group.objectData.name}</h3>
                                                <p className="text-xs text-gray-400 truncate mt-0.5">群組聊天</p>
                                            </div>
                                        </div>
                                    </li>
                                ))}

                                {/* Render Friends */}
                                {friends
                                    .filter(friend => {
                                        if (!friendSearchQuery) return true;
                                        const name = friend.objectData.username || '';
                                        return name.toLowerCase().includes(friendSearchQuery.toLowerCase());
                                    })
                                    .map(friend => (
                                    <li 
                                        key={friend.objectId}
                                        onClick={() => setSelectedFriend(friend)}
                                        className={`px-3 py-3 cursor-pointer hover:bg-gray-50 rounded-xl transition-all duration-200 border border-transparent ${selectedFriend?.objectId === friend.objectId ? 'bg-emerald-50 border-emerald-100 shadow-sm' : ''}`}
                                    >
                                        <div className="flex items-center">
                                            <div className="relative">
                                                <img src={friend.objectData.avatar} className="w-10 h-10 rounded-full bg-gray-200 object-cover" alt="Avatar" />
                                                <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full ${friend.objectData.status === 'online' ? 'bg-emerald-500' : friend.objectData.status === 'busy' ? 'bg-yellow-400' : 'bg-gray-400'}`}></div>
                                            </div>
                                            <div className="ml-3 flex-1 overflow-hidden">
                                                <h3 className="text-sm font-bold text-gray-800 truncate">{friend.objectData.username}</h3>
                                                <p className="text-xs text-gray-400 truncate mt-0.5">{friend.objectData.bio || 'Happy chatting!'}</p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                                {groups.length === 0 && friends.length === 0 && !loadingFriends && (
                                    <div className="text-center py-10 text-gray-400 px-4">
                                        <p className="text-sm">尚無聊天對象</p>
                                    </div>
                                )}
                            </ul>
                        )}
                    </div>
                </div>
            )}

            {/* Main Area: Chat or Moments or Others */}
            {activeTab === 'home' ? (
                <div className="flex-1 flex flex-col bg-gray-50 h-full overflow-y-auto relative z-10 w-full pb-20 md:pb-6 custom-scrollbar">
                    {/* Banner / Cover */}
                    <div className="flex-shrink-0 h-48 md:h-64 relative bg-cover bg-center rounded-b-[2rem] shadow-sm mb-16 md:mb-20" style={{ backgroundImage: `url(${user.objectData.cover_photo || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'})` }}>
                        <div className="absolute inset-0 bg-black/20 rounded-b-[2rem]"></div>
                        
                        {/* Avatar & Info - Positioned carefully to not get cut off by overflow */}
                        <div className="absolute -bottom-14 md:-bottom-16 left-6 md:left-12 flex items-end z-20">
                            <div className="relative group">
                                <img src={user.objectData.avatar} className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white shadow-xl bg-white object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300" onClick={() => setShowProfileSettings(true)} />
                                <div className={`absolute bottom-2 right-2 w-5 h-5 border-2 border-white rounded-full shadow-md ${user.objectData.status === 'online' ? 'bg-emerald-500' : user.objectData.status === 'busy' ? 'bg-yellow-400' : 'bg-gray-400'}`}></div>
                            </div>
                            <div className="ml-4 mb-3 md:mb-4 drop-shadow-md pb-2">
                                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 drop-shadow-sm">{user.objectData.username}</h2>
                                <p className="text-gray-600 font-medium text-sm md:text-base mt-1 drop-shadow-sm">{user.objectData.bio || '設定您的個性簽名...'}</p>
                            </div>
                        </div>
                        
                        {/* Settings Button */}
                        <div className="absolute top-4 right-4 flex space-x-2 z-20">
                            <button onClick={() => setShowProfileSettings(true)} className="p-2.5 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-all border border-white/20 shadow-lg">
                                <div className="icon-settings text-lg"></div>
                            </button>
                        </div>
                    </div>

                    <div className="px-4 md:px-12 max-w-6xl mx-auto w-full flex-1">
                        
                        {/* Welcome Announcement */}
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-6 md:p-8 text-white shadow-lg mb-8 relative overflow-hidden flex items-center justify-between">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full filter blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                            <div className="relative z-10 md:w-2/3">
                                <h3 className="text-xl md:text-2xl font-bold mb-2 flex items-center">
                                    <div className="icon-sparkles mr-2 text-yellow-300"></div>
                                    歡迎回來，{user.objectData.username}！
                                </h3>
                                <p className="text-emerald-50 text-sm md:text-base opacity-90">
                                    今天有 {pendingRequestsCount > 0 ? `${pendingRequestsCount} 個新好友邀請` : '0 個新好友邀請'}，以及 {inboxMessages.filter(m => !dismissedMsgs.includes(m.objectId)).length} 則未讀訊息。快去看看大家說了什麼吧！
                                </p>
                            </div>
                            <div className="hidden md:flex relative z-10 w-1/3 justify-end">
                                <div className="w-24 h-24 bg-white/20 rounded-full backdrop-blur-sm flex items-center justify-center shadow-inner border border-white/30">
                                    <div className="icon-message-circle text-5xl text-white"></div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions Grid */}
                        <div className="grid grid-cols-4 gap-3 md:gap-6 mb-10">
                            <button onClick={() => setShowAddFriendModal(true)} className="flex flex-col items-center justify-center p-4 md:p-6 bg-white rounded-[2rem] shadow-sm hover:shadow-md transition-all border border-gray-100 group hover:-translate-y-1">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-300">
                                    <div className="icon-user-plus text-xl md:text-3xl"></div>
                                </div>
                                <span className="text-xs md:text-sm font-bold text-gray-700">加入好友</span>
                            </button>
                            <button onClick={() => setShowCreateGroupModal(true)} className="flex flex-col items-center justify-center p-4 md:p-6 bg-white rounded-[2rem] shadow-sm hover:shadow-md transition-all border border-gray-100 group hover:-translate-y-1">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300">
                                    <div className="icon-users text-xl md:text-3xl"></div>
                                </div>
                                <span className="text-xs md:text-sm font-bold text-gray-700">建立群組</span>
                            </button>
                            <button onClick={() => setActiveTab('apps')} className="flex flex-col items-center justify-center p-4 md:p-6 bg-white rounded-[2rem] shadow-sm hover:shadow-md transition-all border border-gray-100 group hover:-translate-y-1">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-purple-100 transition-all duration-300">
                                    <div className="icon-layout-grid text-xl md:text-3xl"></div>
                                </div>
                                <span className="text-xs md:text-sm font-bold text-gray-700">所有服務</span>
                            </button>
                            <button onClick={() => setActiveTab('settings')} className="flex flex-col items-center justify-center p-4 md:p-6 bg-white rounded-[2rem] shadow-sm hover:shadow-md transition-all border border-gray-100 group hover:-translate-y-1">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-50 text-gray-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-gray-100 transition-all duration-300">
                                    <div className="icon-settings text-xl md:text-3xl"></div>
                                </div>
                                <span className="text-xs md:text-sm font-bold text-gray-700">系統設定</span>
                            </button>
                        </div>

                        {/* Two Columns Layout for Lists */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            
                            {/* Friends List Block */}
                            <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100 flex flex-col h-[400px]">
                                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                                    <h3 className="font-bold text-gray-800 text-lg flex items-center">
                                        <div className="icon-user mr-2 text-[var(--primary-color)]"></div>
                                        好友列表 ({friends.length})
                                    </h3>
                                </div>
                                <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                                    {friends.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                            <div className="icon-user-x text-4xl mb-3 opacity-50"></div>
                                            <p>尚無好友，去新增一些朋友吧！</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {friends.map(friend => (
                                                <div key={friend.objectId} className="flex items-center p-3 hover:bg-emerald-50/50 rounded-2xl cursor-pointer transition-colors border border-transparent hover:border-emerald-100 group" onClick={() => { setSelectedFriend(friend); setActiveTab('chat'); }}>
                                                    <div className="relative">
                                                        <img src={friend.objectData.avatar} className="w-12 h-12 rounded-full object-cover border border-gray-100 shadow-sm group-hover:border-emerald-200 transition-colors" />
                                                        <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${friend.objectData.status === 'online' ? 'bg-emerald-500' : friend.objectData.status === 'busy' ? 'bg-yellow-400' : 'bg-gray-400'}`}></div>
                                                    </div>
                                                    <div className="ml-4 flex-1 min-w-0">
                                                        <h4 className="text-sm font-bold text-gray-800 truncate group-hover:text-[var(--primary-color)] transition-colors">{friend.objectData.username}</h4>
                                                        <p className="text-xs text-gray-500 truncate mt-1">{friend.objectData.bio || 'Happy chatting!'}</p>
                                                    </div>
                                                    <div className="p-2 text-emerald-500 bg-emerald-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="icon-message-circle text-sm"></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Groups List Block */}
                            <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100 flex flex-col h-[400px]">
                                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                                    <h3 className="font-bold text-gray-800 text-lg flex items-center">
                                        <div className="icon-users mr-2 text-blue-500"></div>
                                        群組聊天 ({groups.length})
                                    </h3>
                                </div>
                                <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                                    {groups.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                            <div className="icon-users text-4xl mb-3 opacity-50"></div>
                                            <p>尚無群組，快去建立一個吧！</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {groups.map(group => (
                                                <div key={group.objectId} className="flex items-center p-3 hover:bg-blue-50/50 rounded-2xl cursor-pointer transition-colors border border-transparent hover:border-blue-100 group" onClick={() => { setSelectedFriend(group); setActiveTab('chat'); }}>
                                                    <img src={group.objectData.avatar} className="w-12 h-12 rounded-xl object-cover border border-gray-100 shadow-sm group-hover:border-blue-200 transition-colors" />
                                                    <div className="ml-4 flex-1 min-w-0">
                                                        <h4 className="text-sm font-bold text-gray-800 truncate group-hover:text-blue-600 transition-colors">{group.objectData.name}</h4>
                                                        <p className="text-xs text-gray-500 truncate mt-1">群組聊天</p>
                                                    </div>
                                                    <div className="p-2 text-blue-500 bg-blue-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="icon-message-circle text-sm"></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* App Shortcuts / Mini Widgets */}
                            <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100 flex flex-col h-[300px]">
                                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                                    <h3 className="font-bold text-gray-800 text-lg flex items-center">
                                        <div className="icon-layout-grid mr-2 text-purple-500"></div>
                                        常用工具
                                    </h3>
                                    <button onClick={() => setActiveTab('apps')} className="text-sm text-purple-600 hover:text-purple-800 font-bold">查看全部</button>
                                </div>
                                <div className="p-6 grid grid-cols-3 gap-4 flex-1 items-center">
                                    <button onClick={() => setActiveTab('tasks')} className="flex flex-col items-center justify-center p-4 hover:bg-purple-50 rounded-2xl transition-colors group">
                                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                            <div className="icon-check-square text-xl"></div>
                                        </div>
                                        <span className="text-xs font-bold text-gray-600">待辦事項</span>
                                    </button>
                                    <button onClick={() => setActiveTab('notes')} className="flex flex-col items-center justify-center p-4 hover:bg-purple-50 rounded-2xl transition-colors group">
                                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                            <div className="icon-book text-xl"></div>
                                        </div>
                                        <span className="text-xs font-bold text-gray-600">隨手筆記</span>
                                    </button>
                                    <button onClick={() => setActiveTab('translator')} className="flex flex-col items-center justify-center p-4 hover:bg-purple-50 rounded-2xl transition-colors group">
                                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                            <div className="icon-languages text-xl"></div>
                                        </div>
                                        <span className="text-xs font-bold text-gray-600">AI翻譯</span>
                                    </button>
                                </div>
                            </div>
                            
                            {/* Points & Stats */}
                            <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100 flex flex-col h-[300px] relative">
                                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                                    <h3 className="font-bold text-gray-800 text-lg flex items-center">
                                        <div className="icon-coins mr-2 text-yellow-500"></div>
                                        個人統計
                                    </h3>
                                </div>
                                <div className="p-6 flex-1 flex flex-col justify-center bg-gradient-to-br from-yellow-50 to-white">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <p className="text-gray-500 text-sm font-medium">總積分</p>
                                            <p className="text-3xl font-extrabold text-gray-800 mt-1">
                                                {user?.objectData?.username === 'littlefat' ? '∞ (無限)' : totalPoints}
                                                <span className="text-base text-yellow-500 ml-1">pts</span>
                                            </p>
                                        </div>
                                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                                            <div className="icon-trophy text-3xl text-yellow-500"></div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setActiveTab('points')}
                                        className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-white font-bold rounded-xl shadow-md shadow-yellow-200 transition-colors flex items-center justify-center"
                                    >
                                        進入積分中心
                                        <div className="icon-arrow-right ml-2 text-sm"></div>
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            ) : activeTab === 'inbox' ? (
                <div className="flex-1 flex flex-col bg-transparent h-full overflow-y-auto relative z-10">
                    <div className="max-w-4xl mx-auto w-full p-4 md:p-6 pb-20 md:pb-6">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center drop-shadow-sm">
                                <div className="icon-inbox mr-3 text-[var(--primary-color)]"></div>
                                最新訊息
                            </h2>
                        </div>
                        
                        {inboxMessages.filter(m => !dismissedMsgs.includes(m.objectId)).length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-gray-500 mt-20 liquid-glass p-12 rounded-3xl">
                                <div className="w-24 h-24 bg-white/50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                    <div className="icon-bell-off text-4xl text-emerald-400"></div>
                                </div>
                                <h2 className="text-xl font-bold text-gray-700">目前沒有新訊息</h2>
                                <p className="mt-2 text-sm text-gray-500">去聊天室找朋友聊聊吧！</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {inboxMessages
                                    .filter(m => !dismissedMsgs.includes(m.objectId))
                                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                    .map(msg => {
                                        const type = msg.objectData.msg_type;
                                        const meta = msg.objectData.metadata ? JSON.parse(msg.objectData.metadata) : {};
                                        return (
                                            <div 
                                                key={msg.objectId} 
                                                onClick={() => {
                                                    setSelectedFriend(msg.sender);
                                                    setActiveTab('chat');
                                                }}
                                                className="liquid-glass p-4 rounded-2xl hover:scale-[1.02] transition-transform duration-300 cursor-pointer flex items-center group relative overflow-hidden"
                                            >
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--primary-color)]"></div>
                                                <img src={msg.sender.objectData.avatar} className="w-12 h-12 rounded-full border border-gray-100 object-cover mr-4" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-baseline mb-1">
                                                        <h3 className="font-bold text-gray-800 text-sm truncate">{msg.sender.objectData.username}</h3>
                                                        <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                                                            {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 truncate">
                                                        {type === 'text' ? msg.objectData.content : 
                                                         type === 'image' ? '[圖片]' : 
                                                         type === 'sticker' ? '[貼圖]' : 
                                                         `[${meta.name || '檔案'}]`}
                                                    </p>
                                                </div>
                                                <button 
                                                    onClick={(e) => handleDismissInboxMsg(e, msg.objectId)}
                                                    className="ml-4 p-2 text-gray-300 hover:bg-red-50 hover:text-red-500 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all"
                                                    title="忽略此通知"
                                                >
                                                    <div className="icon-x"></div>
                                                </button>
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        )}
                    </div>
                </div>
            ) : activeTab === 'points' ? (
                <PointsCenter currentUser={user} />
            ) : activeTab === 'admin_console' && isAdmin ? (
                <AdminConsole currentUser={user} />
            ) : activeTab === 'apps' ? (
                <div className="flex-1 bg-transparent p-6 md:p-10 overflow-y-auto w-full relative z-10">
                    <div className="max-w-5xl mx-auto pb-20 md:pb-0">
                        <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center drop-shadow-sm">
                            <div className="icon-layout-grid mr-3 text-[var(--primary-color)]"></div>
                            應用程式中心
                        </h2>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
                            {[
                                ...(isAdmin ? [{ id: 'admin_console', icon: 'icon-shield-alert', title: '管理員', color: 'bg-red-500 shadow-red-200' }] : []),
                                { id: 'points', icon: 'icon-coins', title: '積分中心', color: 'bg-yellow-500 shadow-yellow-200' },
                                { id: 'files', icon: 'icon-folder', title: '檔案', color: 'bg-blue-500 shadow-blue-200' },
                                { id: 'favorites', icon: 'icon-bookmark', title: '收藏', color: 'bg-yellow-500 shadow-yellow-200' },
                                { id: 'notes', icon: 'icon-book', title: '筆記', color: 'bg-orange-500 shadow-orange-200' },
                                { id: 'tasks', icon: 'icon-check-square', title: '待辦事項', color: 'bg-green-500 shadow-green-200' },
                                { id: 'news', icon: 'icon-newspaper', title: '新聞', color: 'bg-red-500 shadow-red-200' },
                                { id: 'weather', icon: 'icon-cloud-sun', title: '天氣', color: 'bg-sky-500 shadow-sky-200' },
                                { id: 'translator', icon: 'icon-languages', title: '翻譯', color: 'bg-indigo-500 shadow-indigo-200' },
                                { id: 'whiteboard', icon: 'icon-palette', title: '白板', color: 'bg-purple-500 shadow-purple-200' },
                                { id: 'games', icon: 'icon-gamepad-2', title: '遊戲', color: 'bg-pink-500 shadow-pink-200' },
                                { id: 'music', icon: 'icon-music', title: '音樂', color: 'bg-rose-500 shadow-rose-200' },
                                { id: 'calculator', icon: 'icon-calculator', title: '計算機', color: 'bg-teal-500 shadow-teal-200' },
                                { id: 'calendar', icon: 'icon-calendar', title: '行事曆', color: 'bg-emerald-500 shadow-emerald-200' },
                                { id: 'worldclock', icon: 'icon-globe', title: '世界時鐘', color: 'bg-cyan-500 shadow-cyan-200' },
                                { id: 'expense', icon: 'icon-wallet', title: '記帳本', color: 'bg-amber-500 shadow-amber-200' },
                                { id: 'converter', icon: 'icon-arrow-right-left', title: '單位換算', color: 'bg-violet-500 shadow-violet-200' },
                                { id: 'stopwatch', icon: 'icon-timer', title: '碼錶', color: 'bg-fuchsia-500 shadow-fuchsia-200' },
                                { id: 'passwordgen', icon: 'icon-key', title: '密碼產生器', color: 'bg-slate-500 shadow-slate-200' },
                                { id: 'bmicalc', icon: 'icon-activity', title: 'BMI計算機', color: 'bg-lime-500 shadow-lime-200' },
                                { id: 'pomodoro', icon: 'icon-clock', title: '番茄鐘', color: 'bg-red-400 shadow-red-200' },
                                { id: 'randompicker', icon: 'icon-dices', title: '隨機抽籤', color: 'bg-purple-400 shadow-purple-200' },
                                { id: 'colorpicker', icon: 'icon-pipette', title: '調色盤', color: 'bg-pink-400 shadow-pink-200' },
                                { id: 'dictionary', icon: 'icon-book-open', title: 'AI 字典', color: 'bg-blue-400 shadow-blue-200' },
                                { id: 'qrmaker', icon: 'icon-qr-code', title: 'QR碼生成', color: 'bg-gray-800 shadow-gray-200' },
                                { id: 'habittracker', icon: 'icon-calendar-check', title: '習慣追蹤', color: 'bg-emerald-400 shadow-emerald-200' },
                                { id: 'textcounter', icon: 'icon-whole-word', title: '字數統計', color: 'bg-indigo-400 shadow-indigo-200' },
                                { id: 'tipcalc', icon: 'icon-coins', title: '小費計算', color: 'bg-yellow-400 shadow-yellow-200' },
                                { id: 'diceroller', icon: 'icon-hexagon', title: '擲骰子', color: 'bg-orange-400 shadow-orange-200' },
                                { id: 'coinflipper', icon: 'icon-circle-dollar-sign', title: '擲硬幣', color: 'bg-yellow-500 shadow-yellow-200' },
                                { id: 'base64', icon: 'icon-file-code', title: 'Base64', color: 'bg-slate-600 shadow-slate-200' },
                                { id: 'jsonformat', icon: 'icon-braces', title: 'JSON格式化', color: 'bg-blue-600 shadow-blue-200' },
                                { id: 'gradientgen', icon: 'icon-paint-bucket', title: '漸層產生器', color: 'bg-fuchsia-400 shadow-fuchsia-200' },
                                { id: 'urltool', icon: 'icon-link', title: 'URL轉換', color: 'bg-cyan-600 shadow-cyan-200' },
                                { id: 'loremgen', icon: 'icon-file-text', title: '假文產生器', color: 'bg-stone-500 shadow-stone-200' },
                                { id: 'agecalc', icon: 'icon-calendar-days', title: '年齡計算', color: 'bg-rose-400 shadow-rose-200' },
                                { id: 'interestcalc', icon: 'icon-trending-up', title: '複利計算', color: 'bg-emerald-600 shadow-emerald-200' },
                                { id: 'discountcalc', icon: 'icon-tag', title: '折扣計算', color: 'bg-red-500 shadow-red-200' },
                                { id: 'morsecode', icon: 'icon-radio', title: '摩斯密碼', color: 'bg-slate-700 shadow-slate-200' },
                                { id: 'aspectratio', icon: 'icon-monitor', title: '長寬比', color: 'bg-blue-500 shadow-blue-200' },
                                { id: 'datediff', icon: 'icon-calendar-range', title: '日期計算', color: 'bg-indigo-500 shadow-indigo-200' },
                                { id: 'regextester', icon: 'icon-code', title: '正則測試', color: 'bg-purple-600 shadow-purple-200' },
                                { id: 'uuidgen', icon: 'icon-fingerprint', title: 'UUID 產生', color: 'bg-teal-500 shadow-teal-200' },
                                { id: 'bpmcounter', icon: 'icon-audio-waveform', title: 'BPM 計拍', color: 'bg-pink-500 shadow-pink-200' },
                                { id: 'tts', icon: 'icon-mic', title: '文字轉語音', color: 'bg-orange-500 shadow-orange-200' },
                                { id: 'baseconverter', icon: 'icon-binary', title: '進制轉換', color: 'bg-green-600 shadow-green-200' },
                                { id: 'wordscrambler', icon: 'icon-shuffle', title: '文字打亂', color: 'bg-yellow-600 shadow-yellow-200' },
                                { id: 'html_encode', icon: 'icon-code', title: 'HTML 編碼', color: 'bg-slate-500 shadow-slate-200' },
                                { id: 'case_convert', icon: 'icon-type', title: '大小寫轉換', color: 'bg-indigo-400 shadow-indigo-200' },
                                { id: 'color_convert', icon: 'icon-paintbrush', title: '色碼轉換', color: 'bg-pink-500 shadow-pink-200' },
                                { id: 'percentage_calc', icon: 'icon-percent', title: '百分比計算', color: 'bg-emerald-500 shadow-emerald-200' },
                                { id: 'loan_calc', icon: 'icon-landmark', title: '貸款計算', color: 'bg-blue-600 shadow-blue-200' },
                                { id: 'margin_calc', icon: 'icon-dollar-sign', title: '毛利計算', color: 'bg-green-500 shadow-green-200' },
                                { id: 'salary_calc', icon: 'icon-banknote', title: '薪資換算', color: 'bg-teal-500 shadow-teal-200' },
                                { id: 'rule_of_three', icon: 'icon-equal', title: '比例計算', color: 'bg-orange-500 shadow-orange-200' },
                                { id: 'gcd_lcm', icon: 'icon-divide', title: '最大公因數', color: 'bg-purple-500 shadow-purple-200' },
                                { id: 'prime_checker', icon: 'icon-hash', title: '質數檢查', color: 'bg-rose-500 shadow-rose-200' },
                                { id: 'roman_numeral', icon: 'icon-columns-2', title: '羅馬數字', color: 'bg-stone-500 shadow-stone-200' },
                                { id: 'num_to_words', icon: 'icon-spell-check', title: '數字轉文字', color: 'bg-cyan-500 shadow-cyan-200' },
                                { id: 'time_calc', icon: 'icon-clock-4', title: '時間加減', color: 'bg-fuchsia-500 shadow-fuchsia-200' },
                                { id: 'bmr_calc', icon: 'icon-flame', title: 'BMR 基礎代謝', color: 'bg-red-500 shadow-red-200' },
                                { id: 'speed_calc', icon: 'icon-gauge', title: '速度計算', color: 'bg-sky-500 shadow-sky-200' },
                                { id: 'countdown', icon: 'icon-timer-reset', title: '倒數計時', color: 'bg-red-500 shadow-red-200' },
                                { id: 'tally', icon: 'icon-calculator', title: '計數器', color: 'bg-blue-500 shadow-blue-200' },
                                { id: 'random_num', icon: 'icon-dices', title: '隨機亂數', color: 'bg-green-500 shadow-green-200' },
                                { id: 'hash_gen', icon: 'icon-hash', title: '雜湊生成', color: 'bg-purple-500 shadow-purple-200' },
                                { id: 'csv_json', icon: 'icon-file-json', title: 'CSV轉JSON', color: 'bg-yellow-500 shadow-yellow-200' },
                                { id: 'water_track', icon: 'icon-droplet', title: '喝水紀錄', color: 'bg-cyan-500 shadow-cyan-200' },
                                { id: 'white_noise', icon: 'icon-waves', title: '白噪音', color: 'bg-slate-500 shadow-slate-200' },
                                { id: 'reaction', icon: 'icon-zap', title: '反應力測試', color: 'bg-orange-500 shadow-orange-200' },
                                { id: 'markdown', icon: 'icon-file-type-2', title: 'Markdown', color: 'bg-indigo-500 shadow-indigo-200' },
                                { id: 'ip_info', icon: 'icon-network', title: 'IP資訊', color: 'bg-teal-500 shadow-teal-200' }
                            ].map(app => (
                                <button 
                                    key={app.id}
                                    onClick={async () => {
                                        if (app.id === 'points') {
                                            setActiveTab(app.id);
                                        } else {
                                            const hasPoints = await updateUserPoints(-0.2, `開啟應用：${app.title}`);
                                            if (hasPoints) setActiveTab(app.id);
                                        }
                                    }}
                                    className="liquid-glass flex flex-col items-center justify-center p-4 rounded-2xl hover:scale-[1.05] transition-transform duration-300 group"
                                >
                                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${app.color} text-white flex items-center justify-center shadow-md mb-3 group-hover:scale-110 transition-transform duration-300`}>
                                        {customIcons[app.id] ? (
                                            <img src={customIcons[app.id]} className="w-6 h-6 object-contain filter brightness-0 invert" alt={app.title} />
                                        ) : (
                                            <div className={`${app.icon} text-xl md:text-2xl`}></div>
                                        )}
                                    </div>
                                    <span className="text-xs font-bold text-gray-700 group-hover:text-[var(--primary-color)] transition-colors truncate w-full text-center px-1">{app.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ) : activeTab === 'news' ? (
                <NewsFeed />
            ) : activeTab === 'shared' ? (
                <SharedGallery currentUser={user} updateUserPoints={updateUserPoints} />
            ) : activeTab === 'voom' ? (
                <VoomFeed currentUser={user} friends={friends} updateUserPoints={updateUserPoints} />
            ) : activeTab === 'moments' ? (
                <SocialFeed currentUser={user} friends={friends} updateUserPoints={updateUserPoints} />
            ) : activeTab === 'games' ? (
                <Games updateUserPoints={updateUserPoints} />
            ) : activeTab === 'music' ? (
                <Music />
            ) : activeTab === 'weather' ? (
                <Weather />
            ) : activeTab === 'translator' ? (
                <Translator updateUserPoints={updateUserPoints} />
            ) : activeTab === 'whiteboard' ? (
                <Whiteboard />
            ) : activeTab === 'mail' ? (
                <Mail currentUser={user} updateUserPoints={updateUserPoints} />
            ) : activeTab === 'calculator' ? (
                <Calculator />
            ) : activeTab === 'calendar' ? (
                <CalendarApp />
            ) : activeTab === 'worldclock' ? (
                <WorldClock />
            ) : activeTab === 'expense' ? (
                <ExpenseTracker />
            ) : activeTab === 'converter' ? (
                <UnitConverter />
            ) : activeTab === 'stopwatch' ? (
                <Stopwatch />
            ) : activeTab === 'passwordgen' ? (
                <PasswordGen />
            ) : activeTab === 'bmicalc' ? (
                <BMICalculator />
            ) : activeTab === 'pomodoro' ? (
                <Pomodoro />
            ) : activeTab === 'randompicker' ? (
                <RandomPicker />
            ) : activeTab === 'colorpicker' ? (
                <ColorPicker />
            ) : activeTab === 'dictionary' ? (
                <Dictionary />
            ) : activeTab === 'qrmaker' ? (
                <QRMaker />
            ) : activeTab === 'habittracker' ? (
                <HabitTracker currentUser={user} />
            ) : activeTab === 'textcounter' ? (
                <TextCounter />
            ) : activeTab === 'tipcalc' ? (
                <TipCalculator />
            ) : activeTab === 'diceroller' ? (
                <DiceRoller />
            ) : activeTab === 'coinflipper' ? (
                <CoinFlipper />
            ) : activeTab === 'base64' ? (
                <Base64Tool />
            ) : activeTab === 'jsonformat' ? (
                <JsonFormatter />
            ) : activeTab === 'gradientgen' ? (
                <GradientGen />
            ) : activeTab === 'urltool' ? (
                <UrlTool />
            ) : activeTab === 'loremgen' ? (
                <LoremGen />
            ) : activeTab === 'agecalc' ? (
                <AgeCalculator />
            ) : activeTab === 'interestcalc' ? (
                <InterestCalculator />
            ) : activeTab === 'discountcalc' ? (
                <DiscountCalc />
            ) : activeTab === 'morsecode' ? (
                <MorseCode />
            ) : activeTab === 'aspectratio' ? (
                <AspectRatioCalc />
            ) : activeTab === 'datediff' ? (
                <DateDiff />
            ) : activeTab === 'regextester' ? (
                <RegexTester />
            ) : activeTab === 'uuidgen' ? (
                <UUIDGen />
            ) : activeTab === 'bpmcounter' ? (
                <BpmCounter />
            ) : activeTab === 'tts' ? (
                <TextToSpeech />
            ) : activeTab === 'baseconverter' ? (
                <NumberBaseConverter />
            ) : activeTab === 'wordscrambler' ? (
                <WordScrambler />
            ) : activeTab === 'html_encode' ? (
                <HtmlEncode />
            ) : activeTab === 'case_convert' ? (
                <CaseConvert />
            ) : activeTab === 'color_convert' ? (
                <ColorConvert />
            ) : activeTab === 'percentage_calc' ? (
                <PercentageCalc />
            ) : activeTab === 'loan_calc' ? (
                <LoanCalc />
            ) : activeTab === 'margin_calc' ? (
                <MarginCalc />
            ) : activeTab === 'salary_calc' ? (
                <SalaryCalc />
            ) : activeTab === 'rule_of_three' ? (
                <RuleOfThree />
            ) : activeTab === 'gcd_lcm' ? (
                <GcdLcm />
            ) : activeTab === 'prime_checker' ? (
                <PrimeChecker />
            ) : activeTab === 'roman_numeral' ? (
                <RomanNumeral />
            ) : activeTab === 'num_to_words' ? (
                <NumToWords />
            ) : activeTab === 'time_calc' ? (
                <TimeCalc />
            ) : activeTab === 'bmr_calc' ? (
                <BmrCalc />
            ) : activeTab === 'speed_calc' ? (
                <SpeedCalc />
            ) : activeTab === 'countdown' ? (
                <CountdownTimer />
            ) : activeTab === 'tally' ? (
                <TallyCounter />
            ) : activeTab === 'random_num' ? (
                <RandomNumber />
            ) : activeTab === 'hash_gen' ? (
                <HashGenerator />
            ) : activeTab === 'csv_json' ? (
                <CsvToJson />
            ) : activeTab === 'water_track' ? (
                <WaterTracker />
            ) : activeTab === 'white_noise' ? (
                <WhiteNoise />
            ) : activeTab === 'reaction' ? (
                <ReactionTest />
            ) : activeTab === 'markdown' ? (
                <MarkdownPreview />
            ) : activeTab === 'ip_info' ? (
                <IpInfo />
            ) : activeTab === 'files' ? (
                <div className="flex-1 bg-gray-50 p-6 overflow-y-auto w-full">
                    <div className="max-w-5xl mx-auto">
                         <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                <div className="icon-folder mr-3 text-[var(--primary-color)]"></div>
                                檔案管理中心
                            </h2>
                            <div className="flex space-x-2">
                                <span className="bg-white px-3 py-1 rounded-lg text-xs font-bold text-gray-500 shadow-sm border border-gray-100">
                                    共 {userFiles.length} 個檔案
                                </span>
                            </div>
                         </div>
                         
                         {loadingFiles ? (
                            <div className="flex justify-center py-20">
                                <div className="icon-loader animate-spin text-2xl text-[var(--primary-color)]"></div>
                            </div>
                         ) : userFiles.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                                <div className="icon-folder-open text-4xl text-gray-200 mb-3 mx-auto"></div>
                                <p className="text-gray-400">尚無檔案</p>
                            </div>
                         ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {userFiles.map(file => {
                                    const meta = file.objectData.metadata ? JSON.parse(file.objectData.metadata) : {};
                                    const type = file.objectData.msg_type;
                                    const isImg = type === 'image';
                                    const isVideo = type === 'video';
                                    
                                    return (
                                        <div key={file.objectId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
                                            <div 
                                                className={`h-32 bg-gray-50 relative flex items-center justify-center cursor-pointer ${isImg ? '' : 'p-4'}`}
                                                onClick={() => isImg || isVideo ? handleMediaClick(file) : handleFileDownload(file)}
                                            >
                                                {isImg ? (
                                                    <img src={file.objectData.media_data || file.objectData.content} className="w-full h-full object-cover" />
                                                ) : isVideo ? (
                                                    <div className="relative w-full h-full bg-black flex items-center justify-center">
                                                        <div className="icon-video text-white/50 text-4xl"></div>
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                                                                <div className="icon-play text-white fill-current"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="icon-file-text text-5xl text-gray-300 group-hover:text-[var(--primary-color)] transition-colors"></div>
                                                )}
                                                
                                                {/* Overlay Actions */}
                                                <div className="absolute inset-0 bg-black/40 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleFileDownload(file); }}
                                                        className="p-2 bg-white rounded-full hover:bg-[var(--primary-color)] hover:text-white transition-colors"
                                                        title="下載"
                                                    >
                                                        <div className="icon-download"></div>
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleToggleFavorite(file); }}
                                                        className="p-2 bg-white rounded-full hover:bg-yellow-400 hover:text-white transition-colors"
                                                        title="收藏"
                                                    >
                                                        <div className="icon-star"></div>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="p-3">
                                                <div className="font-bold text-gray-800 text-sm truncate" title={meta.name || '未命名'}>
                                                    {meta.name || (type === 'image' ? '圖片' : '檔案')}
                                                </div>
                                                <div className="flex justify-between items-center mt-1 text-xs text-gray-400">
                                                    <span>{formatFileSize(meta.size)}</span>
                                                    <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                         )}
                    </div>
                </div>
            ) : activeTab === 'favorites' ? (
                <div className="flex-1 bg-gray-50 p-6 overflow-y-auto w-full">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                <div className="icon-star mr-3 text-yellow-400 fill-current"></div>
                                我的收藏
                            </h2>
                        </div>

                        {loadingFavorites ? (
                            <div className="flex justify-center py-20">
                                <div className="icon-loader animate-spin text-2xl text-[var(--primary-color)]"></div>
                            </div>
                        ) : userFavorites.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                                <div className="icon-bookmark text-4xl text-gray-200 mb-3 mx-auto"></div>
                                <p className="text-gray-400">還沒有收藏任何訊息</p>
                                <p className="text-xs text-gray-300 mt-1">在聊天中點擊收藏按鈕即可加入</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {userFavorites.map(msg => {
                                    const type = msg.objectData.msg_type;
                                    return (
                                        <div key={msg.objectId} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative group">
                                            <div className="flex items-start">
                                                <img src={msg.sender?.objectData.avatar || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full bg-gray-100 object-cover mr-3" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-baseline mb-1">
                                                        <span className="font-bold text-gray-800 text-sm">
                                                            {msg.sender?.objectData.username || 'Unknown'}
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            收藏於 {new Date(msg.favCreatedAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="text-sm text-gray-700">
                                                        {type === 'text' && (
                                                            <div className="max-h-[40vh] overflow-y-auto custom-scrollbar pr-1 mb-1">
                                                                <p className="break-words whitespace-pre-wrap">{msg.objectData.content}</p>
                                                            </div>
                                                        )}
                                                        {type === 'image' && (
                                                            <img 
                                                                src={msg.objectData.media_data || msg.objectData.content} 
                                                                className="max-h-48 rounded-lg mt-1 cursor-pointer hover:opacity-90"
                                                                onClick={() => handleMediaClick(msg)}
                                                            />
                                                        )}
                                                        {(type === 'file' || type === 'video' || type === 'audio') && (
                                                             <div className="flex items-center bg-gray-50 p-2 rounded-lg mt-1 border border-gray-200 w-fit">
                                                                <div className="icon-file-text text-gray-500 mr-2"></div>
                                                                <span className="truncate max-w-xs">{JSON.parse(msg.objectData.metadata || '{}').name || '檔案'}</span>
                                                                <button 
                                                                    onClick={() => handleFileDownload(msg)}
                                                                    className="ml-3 text-[var(--primary-color)] hover:underline text-xs"
                                                                >
                                                                    下載
                                                                </button>
                                                             </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <button 
                                                onClick={() => handleToggleFavorite(msg)}
                                                className="absolute top-2 right-2 p-2 text-yellow-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                                title="移除收藏"
                                            >
                                                <div className="icon-trash-2 text-sm"></div>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            ) : activeTab === 'notes' ? (
                <div className="flex-1 bg-gray-50 p-6 overflow-y-auto w-full">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                <div className="icon-book mr-3 text-[var(--primary-color)]"></div>
                                我的筆記
                            </h2>
                            <button 
                                onClick={() => openNoteModal()}
                                className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-xl shadow-lg shadow-emerald-200 hover:bg-[var(--primary-hover)] transition-all flex items-center text-sm font-bold"
                            >
                                <div className="icon-plus mr-1"></div>
                                新增筆記
                            </button>
                        </div>

                        {loadingNotes ? (
                            <div className="flex justify-center py-20">
                                <div className="icon-loader animate-spin text-2xl text-[var(--primary-color)]"></div>
                            </div>
                        ) : userNotes.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                                <div className="icon-sticky-note text-4xl text-gray-200 mb-3 mx-auto"></div>
                                <p className="text-gray-400">尚無筆記</p>
                                <p className="text-xs text-gray-300 mt-1">隨手記下你的想法吧</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {userNotes.map(note => (
                                    <div 
                                        key={note.objectId} 
                                        onClick={() => openNoteModal(note)}
                                        className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group flex flex-col h-48"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-gray-800 line-clamp-1">{note.objectData.title}</h3>
                                            <button 
                                                onClick={(e) => handleDeleteNote(e, note.objectId)}
                                                className="text-gray-300 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity p-1"
                                            >
                                                <div className="icon-trash-2 text-sm"></div>
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-500 line-clamp-4 flex-1 whitespace-pre-wrap">{note.objectData.content}</p>
                                        <div className="mt-2 text-xs text-gray-300 flex justify-end">
                                            {new Date(note.objectData.updated_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Note Modal */}
                    {showNoteModal && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                            <div className="bg-white rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100">
                                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                    <h3 className="text-lg font-bold text-gray-800">
                                        {currentNote ? '編輯筆記' : '新增筆記'}
                                    </h3>
                                    <button onClick={() => setShowNoteModal(false)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors">
                                        <div className="icon-x"></div>
                                    </button>
                                </div>
                                
                                <div className="flex-1 flex flex-col p-6 overflow-hidden">
                                    <input 
                                        type="text" 
                                        value={noteTitle}
                                        onChange={(e) => setNoteTitle(e.target.value)}
                                        placeholder="標題"
                                        className="text-xl font-bold border-none focus:ring-0 px-0 placeholder-gray-300 mb-2"
                                        autoFocus
                                    />
                                    <textarea
                                        value={noteContent}
                                        onChange={(e) => setNoteContent(e.target.value)}
                                        placeholder="開始輸入內容..."
                                        className="flex-1 resize-none border-none focus:ring-0 px-0 text-gray-600 leading-relaxed custom-scrollbar text-base placeholder-gray-300"
                                    ></textarea>
                                </div>
                                
                                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                                    <button 
                                        onClick={() => setShowNoteModal(false)}
                                        className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors font-medium"
                                    >
                                        取消
                                    </button>
                                    <button 
                                        onClick={handleSaveNote}
                                        disabled={savingNote}
                                        className="px-5 py-2.5 bg-[var(--primary-color)] text-white rounded-xl hover:bg-[var(--primary-hover)] transition-all flex items-center shadow-lg shadow-emerald-200 font-medium"
                                    >
                                        {savingNote && <div className="icon-loader animate-spin mr-2"></div>}
                                        儲存
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : activeTab === 'tasks' ? (
                <div className="flex-1 bg-gray-50 p-6 overflow-y-auto w-full">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                <div className="icon-check-square mr-3 text-[var(--primary-color)]"></div>
                                待辦事項
                            </h2>
                        </div>
                        
                        {/* Input Area */}
                        <form onSubmit={handleAddTodo} className="relative mb-8">
                            <input 
                                type="text"
                                value={newTodoContent}
                                onChange={(e) => setNewTodoContent(e.target.value)}
                                placeholder="新增一個待辦任務..."
                                className="w-full pl-5 pr-12 py-4 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-emerald-100 text-gray-700 placeholder-gray-400 bg-white"
                            />
                            <button 
                                type="submit"
                                disabled={addingTodo || !newTodoContent.trim()}
                                className="absolute right-2 top-2 p-2 bg-[var(--primary-color)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-200"
                            >
                                {addingTodo ? <div className="icon-loader animate-spin"></div> : <div className="icon-plus"></div>}
                            </button>
                        </form>

                        {/* List */}
                        {loadingTodos ? (
                            <div className="flex justify-center py-20">
                                <div className="icon-loader animate-spin text-2xl text-[var(--primary-color)]"></div>
                            </div>
                        ) : userTodos.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <div className="icon-list-todo text-3xl text-gray-300"></div>
                                </div>
                                <p className="text-gray-400 font-medium">目前沒有待辦事項</p>
                                <p className="text-xs text-gray-300 mt-1">今天想完成什麼目標呢？</p>
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {userTodos.map(todo => (
                                    <li 
                                        key={todo.objectId} 
                                        className={`group flex items-center p-4 bg-white rounded-xl shadow-sm border border-transparent transition-all hover:shadow-md ${todo.objectData.is_completed ? 'opacity-60 bg-gray-50' : 'hover:border-emerald-100'}`}
                                    >
                                        <button 
                                            onClick={() => handleToggleTodo(todo)}
                                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center mr-4 transition-all flex-shrink-0 ${
                                                todo.objectData.is_completed 
                                                ? 'bg-[var(--primary-color)] border-[var(--primary-color)] text-white' 
                                                : 'border-gray-400 text-transparent hover:border-[var(--primary-color)] bg-white'
                                            }`}
                                        >
                                            <div className="icon-check text-sm font-bold"></div>
                                        </button>
                                        
                                        <span className={`flex-1 text-gray-700 font-medium ${todo.objectData.is_completed ? 'line-through text-gray-400' : ''}`}>
                                            {todo.objectData.content}
                                        </span>
                                        
                                        <span className="text-xs text-gray-300 mr-3 hidden md:block">
                                            {new Date(todo.objectData.created_at).toLocaleDateString()}
                                        </span>
                                        
                                        <button 
                                            onClick={(e) => handleDeleteTodo(e, todo.objectId)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="刪除"
                                        >
                                            <div className="icon-trash-2 text-sm"></div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                        
                        {/* Summary */}
                        {userTodos.length > 0 && (
                            <div className="mt-6 text-center text-xs text-gray-400">
                                已完成 {userTodos.filter(t => t.objectData.is_completed).length} / {userTodos.length} 個任務
                            </div>
                        )}
                    </div>
                </div>
            ) : activeTab === 'settings' ? (
                <div className="flex-1 bg-transparent p-8 overflow-y-auto w-full relative z-10">
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center drop-shadow-sm">
                            <div className="icon-settings mr-3 text-[var(--primary-color)]"></div>
                            系統設定
                        </h2>
                        
                        <div className="liquid-glass rounded-2xl overflow-hidden mb-6">
                            <div className="p-4 border-b border-white/40 bg-white/30 font-bold text-gray-800">外觀設定</div>
                            <div className="p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-gray-800">全局背景圖片</div>
                                        <div className="text-xs text-gray-400">更換應用程式的整體背景</div>
                                    </div>
                                    <div className="flex space-x-2">
                                        {globalBg && (
                                            <button onClick={handleResetGlobalBg} className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-sm font-bold border border-red-100 hover:bg-red-100 transition-colors">
                                                移除
                                            </button>
                                        )}
                                        <label className="cursor-pointer px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-bold border border-emerald-100 hover:bg-emerald-100 transition-colors mb-0 block">
                                            更換
                                            <input type="file" accept="image/*" className="hidden" onChange={handleGlobalBgUpload} />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="liquid-glass rounded-2xl overflow-hidden mb-6">
                            <div className="p-4 border-b border-white/40 bg-white/30 font-bold text-gray-800">一般</div>
                            <div className="p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-gray-800">通知音效</div>
                                        <div className="text-xs text-gray-400">收到新訊息時播放提示音</div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-gray-800">桌面通知</div>
                                        <div className="text-xs text-gray-400">在背景執行時顯示通知</div>
                                        <button onClick={() => {
                                            if (typeof window.requestNotificationPermission === 'function') {
                                                window.requestNotificationPermission().then(granted => {
                                                    if(granted) window.showNotification('測試通知', { body: '您的通知功能已成功開啟！' });
                                                    else alert('無法開啟通知，請確認您是否在瀏覽器網址列封鎖了通知權限。');
                                                });
                                            }
                                        }} className="text-xs font-bold text-emerald-600 mt-1 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                                            測試並請求權限
                                        </button>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="liquid-glass rounded-2xl overflow-hidden mb-6">
                            <div className="p-4 border-b border-white/40 bg-white/30 font-bold text-gray-800 flex justify-between items-center">
                                <span>自定義按鈕樣式 (上傳套用)</span>
                            </div>
                            <div className="p-4 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {[
                                    { id: 'inbox', icon: 'icon-inbox', title: '最新消息' },
                                    { id: 'chat', icon: 'icon-message-circle', title: '聊天' },
                                    { id: 'translator', icon: 'icon-languages', title: '翻譯' },
                                    { id: 'whiteboard', icon: 'icon-palette', title: '白板' },
                                    { id: 'shared', icon: 'icon-images', title: '共享' },
                                    { id: 'voom', icon: 'icon-clapperboard', title: 'someboday\'s' },
                                    { id: 'moments', icon: 'icon-aperture', title: '朋友圈' },
                                    { id: 'news', icon: 'icon-newspaper', title: '新聞' },
                                    { id: 'mail', icon: 'icon-mail', title: '信箱' },
                                    { id: 'files', icon: 'icon-folder', title: '檔案' },
                                    { id: 'favorites', icon: 'icon-bookmark', title: '收藏' },
                                    { id: 'notes', icon: 'icon-book', title: '筆記' },
                                    { id: 'tasks', icon: 'icon-check-square', title: '待辦事項' },
                                    { id: 'games', icon: 'icon-gamepad-2', title: '遊戲' },
                                    { id: 'music', icon: 'icon-music', title: '音樂' },
                                    { id: 'weather', icon: 'icon-cloud-sun', title: '天氣' },
                                    { id: 'calculator', icon: 'icon-calculator', title: '計算機' },
                                    { id: 'calendar', icon: 'icon-calendar', title: '行事曆' },
                                    { id: 'worldclock', icon: 'icon-globe', title: '世界時鐘' },
                                    { id: 'expense', icon: 'icon-wallet', title: '記帳本' },
                                    { id: 'converter', icon: 'icon-arrow-right-left', title: '單位換算' },
                                    { id: 'stopwatch', icon: 'icon-timer', title: '碼錶' },
                                    { id: 'passwordgen', icon: 'icon-key', title: '密碼產生器' },
                                    { id: 'bmicalc', icon: 'icon-activity', title: 'BMI計算機' },
                                    { id: 'pomodoro', icon: 'icon-clock', title: '番茄鐘' },
                                    { id: 'randompicker', icon: 'icon-dices', title: '隨機抽籤' },
                                    { id: 'colorpicker', icon: 'icon-pipette', title: '調色盤' },
                                    { id: 'dictionary', icon: 'icon-book-open', title: 'AI 字典' },
                                    { id: 'qrmaker', icon: 'icon-qr-code', title: 'QR碼生成' },
                                    { id: 'habittracker', icon: 'icon-calendar-check', title: '習慣追蹤' },
                                    { id: 'textcounter', icon: 'icon-whole-word', title: '字數統計' },
                                    { id: 'tipcalc', icon: 'icon-coins', title: '小費計算' },
                                    { id: 'diceroller', icon: 'icon-hexagon', title: '擲骰子' },
                                    { id: 'coinflipper', icon: 'icon-circle-dollar-sign', title: '擲硬幣' },
                                    { id: 'base64', icon: 'icon-file-code', title: 'Base64' },
                                    { id: 'jsonformat', icon: 'icon-braces', title: 'JSON格式化' },
                                    { id: 'gradientgen', icon: 'icon-paint-bucket', title: '漸層產生器' },
                                    { id: 'urltool', icon: 'icon-link', title: 'URL轉換' },
                                    { id: 'loremgen', icon: 'icon-file-text', title: '假文產生器' },
                                    { id: 'agecalc', icon: 'icon-calendar-days', title: '年齡計算' },
                                    { id: 'interestcalc', icon: 'icon-trending-up', title: '複利計算' },
                                    { id: 'discountcalc', icon: 'icon-tag', title: '折扣計算' },
                                    { id: 'morsecode', icon: 'icon-radio', title: '摩斯密碼' },
                                    { id: 'aspectratio', icon: 'icon-monitor', title: '長寬比' },
                                    { id: 'datediff', icon: 'icon-calendar-range', title: '日期計算' },
                                    { id: 'regextester', icon: 'icon-code', title: '正則測試' },
                                    { id: 'uuidgen', icon: 'icon-fingerprint', title: 'UUID 產生' },
                                    { id: 'bpmcounter', icon: 'icon-audio-waveform', title: 'BPM 計拍' },
                                    { id: 'tts', icon: 'icon-mic', title: '文字轉語音' },
                                    { id: 'baseconverter', icon: 'icon-binary', title: '進制轉換' },
                                    { id: 'wordscrambler', icon: 'icon-shuffle', title: '文字打亂' },
                                    { id: 'html_encode', icon: 'icon-code', title: 'HTML 編碼' },
                                    { id: 'case_convert', icon: 'icon-type', title: '大小寫轉換' },
                                    { id: 'color_convert', icon: 'icon-paintbrush', title: '色碼轉換' },
                                    { id: 'percentage_calc', icon: 'icon-percent', title: '百分比計算' },
                                    { id: 'loan_calc', icon: 'icon-landmark', title: '貸款計算' },
                                    { id: 'margin_calc', icon: 'icon-dollar-sign', title: '毛利計算' },
                                    { id: 'salary_calc', icon: 'icon-banknote', title: '薪資換算' },
                                    { id: 'rule_of_three', icon: 'icon-equal', title: '比例計算' },
                                    { id: 'gcd_lcm', icon: 'icon-divide', title: '最大公因數' },
                                    { id: 'prime_checker', icon: 'icon-hash', title: '質數檢查' },
                                    { id: 'roman_numeral', icon: 'icon-columns-2', title: '羅馬數字' },
                                    { id: 'num_to_words', icon: 'icon-spell-check', title: '數字轉文字' },
                                    { id: 'time_calc', icon: 'icon-clock-4', title: '時間加減' },
                                    { id: 'bmr_calc', icon: 'icon-flame', title: 'BMR 基礎代謝' },
                                    { id: 'speed_calc', icon: 'icon-gauge', title: '速度計算' },
                                    { id: 'countdown', icon: 'icon-timer-reset', title: '倒數計時' },
                                    { id: 'tally', icon: 'icon-calculator', title: '計數器' },
                                    { id: 'random_num', icon: 'icon-dices', title: '隨機亂數' },
                                    { id: 'hash_gen', icon: 'icon-hash', title: '雜湊生成' },
                                    { id: 'csv_json', icon: 'icon-file-json', title: 'CSV轉JSON' },
                                    { id: 'water_track', icon: 'icon-droplet', title: '喝水紀錄' },
                                    { id: 'white_noise', icon: 'icon-waves', title: '白噪音' },
                                    { id: 'reaction', icon: 'icon-zap', title: '反應力測試' },
                                    { id: 'markdown', icon: 'icon-file-type-2', title: 'Markdown' },
                                    { id: 'ip_info', icon: 'icon-network', title: 'IP資訊' },
                                    { id: 'apps', icon: 'icon-layout-grid', title: '應用程式' },
                                    { id: 'points', icon: 'icon-coins', title: '積分中心' },
                                    { id: 'home', icon: 'icon-house', title: '首頁' },
                                    { id: 'settings', icon: 'icon-settings', title: '設定' },
                                    { id: 'send_btn', icon: 'icon-send', title: '傳送按鈕' },
                                    { id: 'upload_btn', icon: 'icon-image', title: '上傳圖片' },
                                    { id: 'emoji_btn', icon: 'icon-smile', title: '表情符號' },
                                    { id: 'sticker_btn', icon: 'icon-sticky-note', title: '貼圖' }
                                ].map(btn => (
                                    <div key={btn.id} className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-xl hover:bg-gray-50 relative group transition-colors">
                                        <div className="w-10 h-10 flex items-center justify-center mb-2 bg-white rounded-lg shadow-sm border border-gray-50">
                                            {customIcons[btn.id] ? (
                                                <img src={customIcons[btn.id]} className="max-w-[24px] max-h-[24px] object-contain drop-shadow-sm" alt={btn.title} />
                                            ) : (
                                                <div className={`${btn.icon} text-xl text-gray-400`}></div>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-gray-500 font-bold mb-2 text-center whitespace-nowrap">{btn.title}</span>
                                        <div className="flex space-x-1 w-full justify-center">
                                            <label className="cursor-pointer text-[10px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded hover:bg-emerald-100 transition-colors font-bold text-center border border-emerald-100">
                                                更換
                                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleButtonIconUpload(e, btn.id)} />
                                            </label>
                                            {customIcons[btn.id] && (
                                                <button onClick={() => handleResetIcon(btn.id)} className="text-[10px] bg-red-50 text-red-500 px-2 py-1 rounded hover:bg-red-100 transition-colors font-bold border border-red-100 text-center">還原</button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="liquid-glass rounded-2xl overflow-hidden mb-6">
                            <div className="p-4 border-b border-white/40 bg-white/30 font-bold text-gray-800">隱私</div>
                            <div className="p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-gray-800">顯示上線狀態</div>
                                        <div className="text-xs text-gray-400">允許其他人看到您是否在線</div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-gray-800">已讀回條</div>
                                        <div className="text-xs text-gray-400">顯示訊息已讀狀態</div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-gray-800">隱藏對話氣泡</div>
                                        <div className="text-xs text-gray-400">僅顯示文字，不顯示背景氣泡</div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={hideBubbles} onChange={toggleHideBubbles} />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <div className="text-center text-xs text-gray-400 mt-8">
                            someboday v2.1.0
                        </div>
                    </div>
                </div>
            ) : (
                <div className={`flex-1 flex flex-col bg-[#f0fdf4] relative bg-opacity-50 ${selectedFriend ? 'absolute inset-0 z-50 h-full md:static md:z-0 bg-white md:bg-transparent mobile-slide-in' : 'hidden md:flex'}`}>
                <style>{`
                    @keyframes slideInMobile {
                        from { transform: translateX(100%); }
                        to { transform: translateX(0); }
                    }
                    @media (max-width: 768px) {
                        .mobile-slide-in {
                            animation: slideInMobile 0.25s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                        }
                    }
                `}</style>
                {/* Background Pattern */}
                {chatBg ? (
                    <>
                        <div className="absolute inset-0 pointer-events-none z-0" style={{
                            backgroundImage: `url(${chatBg})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}></div>
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] pointer-events-none z-0"></div>
                    </>
                ) : (
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}></div>
                )}

                {selectedFriend ? (
                    <>
                        {/* Chat Header */}
                        <div className="shrink-0 h-16 bg-white/90 backdrop-blur-md border-b border-green-100 flex items-center px-2 md:px-6 justify-between shadow-sm z-10 w-full">
                            <div className="flex items-center flex-1 min-w-0 mr-2">
                                {/* Back Button (Mobile Only) */}
                                <button onClick={handleBackToFriends} className="mr-1 md:hidden p-1.5 text-gray-500 hover:bg-gray-100 rounded-full flex-shrink-0">
                                    <div className="icon-arrow-left text-xl"></div>
                                </button>
                                
                                <div 
                                    className="flex items-center cursor-pointer group flex-1 min-w-0"
                                    onClick={() => !selectedFriend.isGroup && setShowFriendProfile(true)}
                                >
                                    <img src={selectedFriend.objectData.avatar} className={`w-9 h-9 md:w-10 md:h-10 ${selectedFriend.isGroup ? 'rounded-xl' : 'rounded-full'} bg-green-100 object-cover border border-gray-100 group-hover:border-[var(--primary-color)] transition-colors flex-shrink-0`} alt="Avatar" />
                                    <div className="ml-2 md:ml-3 flex-1 min-w-0">
                                        <h2 className="text-sm font-bold text-gray-800 group-hover:text-[var(--primary-color)] transition-colors truncate">
                                            {selectedFriend.isGroup ? selectedFriend.objectData.name : selectedFriend.objectData.username}
                                        </h2>
                                        <div className="text-[10px] md:text-xs text-emerald-600 truncate font-medium flex items-center">
                                            {selectedFriend.isGroup ? (
                                                <><span className="icon-users mr-1 text-[10px]"></span>群組聊天</>
                                            ) : (
                                                <>
                                                    <span className={`w-1.5 h-1.5 rounded-full mr-1 flex-shrink-0 ${selectedFriend.objectData.status === 'online' ? 'bg-emerald-500' : selectedFriend.objectData.status === 'busy' ? 'bg-yellow-400' : 'bg-gray-400'}`}></span>
                                                    <span className="flex-shrink-0">{selectedFriend.objectData.status === 'online' ? '線上' : selectedFriend.objectData.status === 'busy' ? '忙碌' : '離線'}</span>
                                                    {selectedFriend.objectData.bio && <span className="text-gray-400 ml-1 truncate font-normal">· {selectedFriend.objectData.bio}</span>}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-0.5 md:space-x-1 flex-shrink-0">
                                {chatBg && (
                                    <button 
                                        onClick={handleResetChatBg}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-1.5 md:p-2 rounded-full hover:bg-red-50 block"
                                        title="移除背景"
                                    >
                                        <div className="icon-eraser text-lg md:text-base"></div>
                                    </button>
                                )}
                                <label 
                                    className="text-gray-400 hover:text-[var(--primary-color)] transition-colors p-1.5 md:p-2 rounded-full hover:bg-[var(--secondary-color)] cursor-pointer m-0 flex items-center justify-center flex"
                                    title="設定背景"
                                >
                                    <div className="icon-image text-lg md:text-base"></div>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleChatBgUpload} />
                                </label>
                                <button 
                                    onClick={() => {
                                        setShowMsgSearch(!showMsgSearch);
                                        if (showMsgSearch) setMsgSearchQuery('');
                                    }}
                                    className={`p-1.5 md:p-2 rounded-full transition-colors ${showMsgSearch ? 'bg-[var(--secondary-color)] text-[var(--primary-color)]' : 'text-gray-400 hover:text-[var(--primary-color)] hover:bg-[var(--secondary-color)]'}`}
                                    title="搜尋訊息"
                                >
                                    <div className="icon-search text-lg md:text-base"></div>
                                </button>
                                {selectedFriend.isGroup ? (
                                    <button 
                                        onClick={() => setShowGroupSettings(true)}
                                        className="text-gray-400 hover:text-[var(--primary-color)] transition-colors p-1.5 md:p-2 rounded-full hover:bg-[var(--secondary-color)]"
                                        title="群組設定"
                                    >
                                        <div className="icon-settings text-lg md:text-base"></div>
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => setShowFriendProfile(true)}
                                        className="text-gray-400 hover:text-[var(--primary-color)] transition-colors p-1.5 md:p-2 rounded-full hover:bg-[var(--secondary-color)]"
                                        title="好友資訊"
                                    >
                                        <div className="icon-info text-lg md:text-base"></div>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Message Search Bar */}
                        {showMsgSearch && (
                            <div className="shrink-0 bg-white border-b border-gray-100 px-6 py-3 flex items-center animate-fade-in">
                                <div className="flex-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <div className="icon-search text-gray-400 text-sm"></div>
                                    </div>
                                    <input 
                                        type="text"
                                        value={msgSearchQuery}
                                        onChange={(e) => setMsgSearchQuery(e.target.value)}
                                        placeholder="搜尋對話內容..."
                                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[var(--primary-color)] transition-all"
                                        autoFocus
                                    />
                                    {msgSearchQuery && (
                                        <button 
                                            onClick={() => setMsgSearchQuery('')}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                        >
                                            <div className="icon-x-circle w-4 h-4"></div>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Messages */}
                        <div 
                            className="flex-1 overflow-y-auto p-6 space-y-6 z-0 relative"
                            ref={scrollContainerRef}
                            onScroll={handleScroll}
                        >

                            {messages.filter(msg => {
                                const type = msg.objectData.msg_type;
                                
                                if (!msgSearchQuery) return true;
                                const content = msg.objectData.content || '';
                                return content.toLowerCase().includes(msgSearchQuery.toLowerCase());
                            }).map(msg => {
                                const isMe = msg.objectData.sender_id === user.objectId;
                                const type = msg.objectData.msg_type;
                                // Use media_data if available for media content, fallback to content
                                const mediaSrc = msg.objectData.media_data || msg.objectData.content;
                                const content = msg.objectData.content; // Display text or summary
                                const meta = msg.objectData.metadata ? JSON.parse(msg.objectData.metadata) : {};
                                const isRead = msg.objectData.is_read;
                                const isRevoked = msg.objectData.is_revoked;

                                if (isRevoked) {
                                    return (
                                        <div key={msg.objectId} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group mb-4`}>
                                             {!isMe && (
                                                <img src={selectedFriend.objectData.avatar} className="w-8 h-8 rounded-full mr-2 self-end mb-1 object-cover border border-white shadow-sm opacity-50" alt="Avatar" />
                                            )}
                                            <div className="px-4 py-2 bg-gray-100 text-gray-400 rounded-2xl text-sm italic border border-gray-200">
                                                <div className="flex items-center">
                                                    <div className="icon-slash mr-1.5 text-xs"></div>
                                                    訊息已收回
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }

                                // Determine sender for group chat display
                                const msgSender = isMe ? user : (friends.find(f => f.objectId === msg.objectData.sender_id) || { objectData: { username: '用戶', avatar: 'https://via.placeholder.com/40' } });

                                return (
                                    <div key={msg.objectId} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group w-full`}>
                                        {!isMe && (
                                            <img src={msgSender.objectData.avatar} className="w-8 h-8 rounded-full mr-2 self-end mb-1 object-cover border border-white shadow-sm flex-shrink-0" alt="Avatar" title={msgSender.objectData.username} />
                                        )}
                                        <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                            {!isMe && selectedFriend.isGroup && (
                                                <span className="text-[10px] text-gray-400 ml-1 mb-0.5">{msgSender.objectData.username}</span>
                                            )}
                                            {/* Message Bubble */}
                                            <div className="relative group/bubble">
                                                <div className={
                                                    hideBubbles && type === 'text' 
                                                    ? `text-sm py-1 transition-all ${isMe ? 'text-emerald-700 font-medium' : 'text-gray-800'}` 
                                                    : `px-4 py-2.5 shadow-sm text-sm transition-all hover:shadow-md ${
                                                        isMe 
                                                        ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl' 
                                                        : 'bg-white text-gray-800 rounded-2xl border border-gray-100'
                                                    }`
                                                }>
                                                    {type === 'text' && (
                                                        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                                                            <p className="leading-relaxed break-words whitespace-pre-wrap">
                                                                {msgSearchQuery && content.toLowerCase().includes(msgSearchQuery.toLowerCase()) ? (
                                                                    <span dangerouslySetInnerHTML={{
                                                                        __html: content.replace(
                                                                            new RegExp(`(${msgSearchQuery})`, 'gi'),
                                                                            '<span class="bg-yellow-300 text-black font-bold">$1</span>'
                                                                        )
                                                                    }} />
                                                                ) : (
                                                                    content
                                                                )}
                                                            </p>
                                                        </div>
                                                    )}
                                                    
                                                    {type === 'image' && (
                                                        <div className="relative">
                                                            <img 
                                                                src={mediaSrc || 'https://via.placeholder.com/300x200?text=Large+Image'} 
                                                                alt="Image" 
                                                                className={`max-w-full max-h-64 rounded-lg my-1 shadow-sm cursor-zoom-in hover:opacity-95 transition-opacity ${!mediaSrc ? 'opacity-50' : ''}`}
                                                                onClick={() => handleMediaClick(msg)}
                                                            />
                                                            {!mediaSrc && (
                                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                                    <div className="bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center">
                                                                        <div className="icon-download mr-1"></div> 點擊載入
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {type === 'sticker' && (
                                                        <img src={mediaSrc && mediaSrc !== '[STICKER]' ? mediaSrc : (meta.id ? `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${meta.id}&radius=10` : 'https://via.placeholder.com/128?text=Sticker')} alt="Sticker" className="w-32 h-32 drop-shadow-sm object-contain" />
                                                    )}
                                                    
                                                    {type === 'video' && (
                                                        <div 
                                                            className="relative group/vid cursor-pointer my-1 max-w-full w-64 aspect-video bg-black/5 rounded-lg overflow-hidden flex items-center justify-center border border-black/10 hover:shadow-md transition-all"
                                                            onClick={() => handleMediaClick(msg)}
                                                        >
                                                            <div className={`icon-video text-4xl ${isMe ? 'text-white/40' : 'text-emerald-900/20'}`}></div>
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover/vid:bg-black/30 transition-colors">
                                                                <div className="bg-white/30 backdrop-blur-sm w-12 h-12 rounded-full flex items-center justify-center shadow-lg border border-white/50">
                                                                    <div className="icon-play text-white text-2xl fill-current ml-1"></div>
                                                                </div>
                                                            </div>
                                                            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-white text-[10px] font-bold drop-shadow-md">
                                                                <span className="truncate mr-2">{meta.name || '影片'}</span>
                                                                <span>{meta.size ? (meta.size > 1024*1024 ? (meta.size/(1024*1024)).toFixed(1) + ' MB' : Math.round(meta.size/1024) + ' KB') : ''}</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {type === 'file' && (
                                                        <button 
                                                            onClick={() => handleFileDownload(msg)} 
                                                            className="flex items-center space-x-3 p-1 hover:opacity-80 transition-opacity text-left w-full min-w-[200px]"
                                                        >
                                                            <div className={`p-3 rounded-xl flex-shrink-0 ${isMe ? 'bg-white/20' : 'bg-green-100'}`}>
                                                                <div className="icon-file-text text-2xl ${isMe ? 'text-white' : 'text-emerald-600'}"></div>
                                                            </div>
                                                            <div className="flex-1 overflow-hidden">
                                                                <p className="font-bold text-sm truncate">{meta.name || '檔案'}</p>
                                                                <p className={`text-[10px] ${isMe ? 'text-emerald-100' : 'text-gray-400'}`}>
                                                                    {meta.size ? (meta.size > 1024*1024 ? (meta.size/(1024*1024)).toFixed(1) + ' MB' : Math.round(meta.size/1024) + ' KB') : '點擊下載'}
                                                                </p>
                                                            </div>
                                                            <div className={`icon-download ${isMe ? 'text-white/70' : 'text-gray-300'}`}></div>
                                                        </button>
                                                    )}

                                                    {type === 'audio' && (
                                                        <VoicePlayer msg={msg} isMe={isMe} />
                                                    )}
                                                </div>
                                                
                                                {/* Desktop Actions (Revoke & Favorite) */}
                                                <div className={`absolute ${isMe ? '-left-16' : '-right-16'} top-1/2 transform -translate-y-1/2 hidden md:flex space-x-1 opacity-0 group-hover/bubble:opacity-100 transition-all`}>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleToggleFavorite(msg); }}
                                                        className="p-1.5 bg-white text-gray-400 hover:text-yellow-400 rounded-full shadow-sm border border-gray-100 hover:scale-110 transition-transform"
                                                        title="收藏訊息"
                                                    >
                                                        <div className="icon-star text-xs"></div>
                                                    </button>
                                                    
                                                    {isMe && (
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleRevokeMessage(msg); }}
                                                            className="p-1.5 bg-white text-gray-400 hover:text-red-500 rounded-full shadow-sm border border-gray-100 hover:scale-110 transition-transform"
                                                            title="收回訊息"
                                                        >
                                                            <div className="icon-trash-2 text-xs"></div>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Meta Info: Time, Mobile Actions & Read Status */}
                                            <div className={`flex items-center mt-1 space-x-2 ${isMe ? 'justify-end mr-1' : 'justify-start ml-1'}`}>
                                                {/* Mobile Actions */}
                                                <div className="flex md:hidden space-x-2 items-center">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleToggleFavorite(msg); }}
                                                        className="text-gray-400 hover:text-yellow-400 active:scale-110 transition-transform"
                                                        title="收藏訊息"
                                                    >
                                                        <div className="icon-star text-xs"></div>
                                                    </button>
                                                    {isMe && (
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleRevokeMessage(msg); }}
                                                            className="text-gray-400 hover:text-red-500 active:scale-110 transition-transform"
                                                            title="收回訊息"
                                                        >
                                                            <div className="icon-trash-2 text-xs"></div>
                                                        </button>
                                                    )}
                                                </div>
                                                
                                                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                                    {new Date(msg.createdAt).toLocaleString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute:'2-digit' })}
                                                </span>
                                                {isMe && (
                                                    <span className={`text-[10px] flex items-center ${isRead ? 'text-[var(--primary-color)] font-bold' : 'text-gray-300'}`}>
                                                        {isRead ? (
                                                            <>
                                                                <div className="icon-check-check w-3 h-3 mr-0.5"></div>
                                                                已讀
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="icon-check w-3 h-3 mr-0.5"></div>
                                                                送達
                                                            </>
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {isFriendTyping && (
                                <div className="flex justify-start group w-full animate-fade-in">
                                    <img src={selectedFriend.objectData.avatar} className="w-8 h-8 rounded-full mr-2 self-end mb-1 object-cover border border-white shadow-sm flex-shrink-0" alt="Avatar" />
                                    <div className="max-w-[70%] items-start flex flex-col">
                                        <div className="px-4 py-3 bg-white text-gray-800 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-1">
                                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Scroll to Bottom Buttons */}
                        {!isAtBottom && unreadBottomCount > 0 && (
                            <button 
                                onClick={scrollToBottom}
                                className="absolute bottom-[100px] md:bottom-36 right-4 md:right-8 text-emerald-800 font-bold px-4 py-2 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all z-50 flex items-center animate-bounce border border-emerald-200 bg-white/95 backdrop-blur"
                            >
                                <div className="icon-arrow-down mr-2 text-sm"></div>
                                {unreadBottomCount} 則新訊息
                            </button>
                        )}
                        
                        {!isAtBottom && unreadBottomCount === 0 && (
                            <button 
                                onClick={scrollToBottom}
                                className="absolute bottom-[100px] md:bottom-36 right-4 md:right-8 text-emerald-700 w-10 h-10 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:text-emerald-900 transition-all z-50 flex items-center justify-center border border-emerald-200 bg-white/95 backdrop-blur"
                            >
                                <div className="icon-arrow-down text-xl"></div>
                            </button>
                        )}

                        {/* Input Area */}
                        <div className="shrink-0 liquid-glass !border-x-0 !border-b-0 !rounded-none p-4 z-10 relative">
                            {/* File Preview */}
                            {pendingFile && (
                                <div className="absolute bottom-full left-0 right-0 p-3 bg-white/95 backdrop-blur border-t border-green-100 flex items-center justify-between animate-fade-in-up">
                                    <div className="flex items-center overflow-hidden">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center border border-gray-200 overflow-hidden">
                                            {pendingFile.type === 'image' ? (
                                                <img src={pendingFile.data} className="w-full h-full object-cover" alt="Preview" />
                                            ) : pendingFile.type === 'video' ? (
                                                <div className="icon-video text-gray-500"></div>
                                            ) : pendingFile.type === 'audio' ? (
                                                <div className="icon-music text-gray-500"></div>
                                            ) : (
                                                <div className="icon-file-text text-gray-500"></div>
                                            )}
                                        </div>
                                        <div className="ml-3 overflow-hidden">
                                            <p className="text-sm font-bold text-gray-700 truncate">{pendingFile.name}</p>
                                            <p className="text-xs text-gray-400">{Math.round(pendingFile.size / 1024)} KB</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setPendingFile(null)}
                                        className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                                    >
                                        <div className="icon-x"></div>
                                    </button>
                                </div>
                            )}

                            {showEmojiPicker && (
                                <EmojiPicker
                                    onSelect={insertEmoji}
                                    onClose={() => setShowEmojiPicker(false)}
                                />
                            )}
                            {showStickerPicker && (
                                <StickerPicker 
                                    onSelect={(s) => handleSendSticker(s.url, s.id)} 
                                    onClose={() => setShowStickerPicker(false)}
                                    currentUserId={user.objectId}
                                />
                            )}
                            <div className="flex flex-col md:flex-row items-stretch md:items-center space-y-2 md:space-y-0 md:space-x-2 bg-gray-50 rounded-2xl px-2 py-2 border border-gray-200 focus-within:border-emerald-300 focus-within:ring-2 focus-within:ring-emerald-100 transition-all relative">
                                {isRecording ? (
                                    <div className="flex items-center space-x-2 bg-red-50 rounded-2xl px-4 py-2 flex-1 justify-between border border-red-100">
                                        <div className="flex items-center text-red-500 animate-pulse">
                                            <div className="icon-mic mr-2 text-lg"></div>
                                            <span className="font-mono font-bold">{formatRecordingTime(recordingTime)}</span>
                                        </div>
                                        <div className="flex space-x-3 items-center">
                                            <button onClick={cancelRecording} className="text-gray-400 hover:text-red-500 text-sm font-bold px-2 py-1">取消</button>
                                            <button onClick={stopRecording} className="bg-red-500 text-white px-4 py-1.5 rounded-xl text-sm font-bold shadow-md shadow-red-200 hover:bg-red-600 transition-colors">發送</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0 w-full md:w-auto overflow-x-auto no-scrollbar-on-mobile pb-1 md:pb-0">
                                            <button 
                                                onClick={() => fileInputRef.current.click()}
                                                className="text-gray-400 hover:text-[var(--primary-color)] transition-colors p-2 rounded-full hover:bg-[var(--secondary-color)] flex items-center justify-center flex-shrink-0"
                                                title="上傳檔案/圖片/影片"
                                            >
                                                {customIcons['upload_btn'] ? <img src={customIcons['upload_btn']} className="w-5 h-5 object-contain drop-shadow-sm" /> : <div className="icon-paperclip text-xl"></div>}
                                            </button>
                                            <input 
                                                type="file" 
                                                ref={fileInputRef} 
                                                className="hidden" 
                                                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
                                                onChange={handleFileUpload}
                                            />
                                            <button 
                                                onClick={() => {
                                                    setShowEmojiPicker(!showEmojiPicker);
                                                    setShowStickerPicker(false);
                                                }}
                                                className={`transition-colors p-2 rounded-full hover:bg-[var(--secondary-color)] flex items-center justify-center flex-shrink-0 ${showEmojiPicker ? 'text-[var(--primary-color)]' : 'text-gray-400 hover:text-[var(--primary-color)]'}`}
                                                title="表情符號"
                                            >
                                                {customIcons['emoji_btn'] ? <img src={customIcons['emoji_btn']} className="w-5 h-5 object-contain drop-shadow-sm" /> : <div className="icon-smile text-xl"></div>}
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setShowStickerPicker(!showStickerPicker);
                                                    setShowEmojiPicker(false);
                                                }}
                                                className={`transition-colors p-2 rounded-full hover:bg-[var(--secondary-color)] flex items-center justify-center flex-shrink-0 ${showStickerPicker ? 'text-[var(--primary-color)]' : 'text-gray-400 hover:text-[var(--primary-color)]'}`}
                                                title="貼圖"
                                            >
                                                {customIcons['sticker_btn'] ? <img src={customIcons['sticker_btn']} className="w-5 h-5 object-contain drop-shadow-sm" /> : <div className="icon-sticky-note text-xl"></div>}
                                            </button>
                                        </div>
                                        
                                        <div className="flex flex-1 items-center space-x-2 relative">
                                            {/* Mention Popup */}
                                            {showMentionList && (
                                                <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in-up max-h-48 overflow-y-auto">
                                                    <div className="px-3 py-2 text-xs font-bold text-gray-400 bg-gray-50 border-b border-gray-100">
                                                        提及好友
                                                    </div>
                                                    {friends.map(f => (
                                                        <button
                                                            key={f.objectId}
                                                            onClick={() => insertMention(f.objectData.username)}
                                                            className="w-full text-left px-4 py-2 hover:bg-emerald-50 text-sm flex items-center"
                                                        >
                                                            <img src={f.objectData.avatar} className="w-5 h-5 rounded-full mr-2" />
                                                            {f.objectData.username}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                value={inputText}
                                                onChange={handleInput}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                                placeholder="輸入訊息... (輸入 @ 提及好友)"
                                                className="liquid-input w-full outline-none text-sm text-gray-700 placeholder-gray-500 px-4 py-2.5 rounded-2xl"
                                            />
                                            
                                            <button 
                                                onClick={startRecording}
                                                className={`p-2 rounded-full transition-colors text-gray-400 hover:text-[var(--primary-color)] hover:bg-[var(--secondary-color)] flex items-center justify-center flex-shrink-0`}
                                                title="語音訊息"
                                            >
                                                <div className="icon-mic text-xl"></div>
                                            </button>
                                            
                                            <button 
                                                onClick={() => handleSendMessage()}
                                                className={`p-2.5 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm flex items-center justify-center flex-shrink-0 ${
                                                    (inputText.trim() || pendingFile) && !isUploading
                                                    ? 'text-emerald-800 shadow-emerald-200 border border-emerald-200' 
                                                    : 'text-gray-400 cursor-not-allowed border border-gray-200'
                                                }`}
                                                disabled={(!inputText.trim() && !pendingFile) || isUploading}
                                            >
                                                {isUploading ? (
                                                    <div className="icon-loader animate-spin text-sm"></div>
                                                ) : customIcons['send_btn'] ? (
                                                    <img src={customIcons['send_btn']} className="w-5 h-5 object-contain brightness-0 invert" />
                                                ) : (
                                                    <div className="icon-send text-sm"></div>
                                                )}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-green-50">
                            <div className="icon-message-square text-4xl text-emerald-200"></div>
                        </div>
                        <h2 className="text-xl font-bold text-gray-600">開始聊天</h2>
                        <p className="mt-2 text-sm text-gray-400">請在左側選擇一位好友</p>
                    </div>
                )}
            </div>
            )}
            </div>

            {/* Media Preview Lightbox */}
            {previewMedia && (
                <MediaLightbox 
                    src={previewMedia.url} 
                    type={previewMedia.type}
                    onClose={() => setPreviewMedia(null)} 
                />
            )}

            {/* Modals */}
            {showAddFriendModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-emerald-50 to-white">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                <div className="icon-user-plus mr-2 text-[var(--primary-color)]"></div>
                                新增好友
                            </h3>
                            <button onClick={() => setShowAddFriendModal(false)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors">
                                <div className="icon-x"></div>
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="flex space-x-2 mb-6">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <div className="icon-search text-gray-400"></div>
                                    </div>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            if (e.target.value === '') {
                                                setSearchResults([]);
                                            }
                                        }}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearchUsers()}
                                        placeholder="輸入用戶名稱搜尋..."
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-100 focus:border-[var(--primary-color)] transition-all bg-gray-50 focus:bg-white"
                                    />
                                </div>
                                <button 
                                    onClick={() => handleSearchUsers()}
                                    disabled={isSearching}
                                    className="px-5 py-2.5 text-gray-800 rounded-xl transition-colors shadow-lg shadow-gray-200 font-bold flex items-center whitespace-nowrap"
                                >
                                    {isSearching && <div className="icon-loader animate-spin mr-2"></div>}
                                    {isSearching ? '搜尋中' : '搜尋'}
                                </button>
                            </div>

                            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                                {isSearching && searchResults.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                                        <div className="icon-loader animate-spin text-2xl text-[var(--primary-color)] mb-2"></div>
                                        <span className="text-xs">正在載入用戶列表...</span>
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map(result => {
                                        const isMe = result.objectId === user.objectId;
                                        const isFriend = friends.some(f => f.objectId === result.objectId);
                                        
                                        return (
                                            <div key={result.objectId} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-transparent hover:border-emerald-100 hover:bg-emerald-50/50 transition-colors">
                                                <div className="flex items-center">
                                                    <img src={result.objectData.avatar} className="w-10 h-10 rounded-full bg-white border border-gray-200" alt="Avatar" />
                                                    <div className="ml-3">
                                                        <div className="font-bold text-gray-700">{result.objectData.username}</div>
                                                        {isMe && <div className="text-[10px] text-gray-400">你自己</div>}
                                                    </div>
                                                </div>
                                                
                                                {isMe ? (
                                                    <span className="text-xs text-gray-400 font-medium px-3 bg-gray-100 py-1 rounded-lg">本人</span>
                                                ) : isFriend ? (
                                                    <span className="text-xs text-emerald-600 font-medium px-3 bg-emerald-100 py-1 rounded-lg">已是好友</span>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleAddFriend(result)}
                                                        className="p-2 text-[var(--primary-color)] bg-[var(--secondary-color)] hover:bg-[var(--primary-color)] hover:text-white rounded-lg transition-all shadow-sm"
                                                        title="加為好友"
                                                    >
                                                        <div className="icon-user-plus text-lg"></div>
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <div className="icon-search text-3xl text-gray-300"></div>
                                        </div>
                                        <p className="text-gray-500 font-medium text-sm">{searchQuery ? '找不到相關用戶' : '輸入用戶名稱來搜尋並添加好友'}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showProfileSettings && (
                <ProfileSettings 
                    user={user} 
                    onClose={() => setShowProfileSettings(false)} 
                    onUpdate={setUser}
                />
            )}

            {showFriendRequests && (
                <FriendRequests
                    userId={user.objectId}
                    onClose={() => setShowFriendRequests(false)}
                    onUpdate={() => {
                        loadAllData();
                    }}
                />
            )}

            {showFriendProfile && selectedFriend && !selectedFriend.isGroup && (
                <FriendProfile 
                    friend={selectedFriend}
                    onClose={() => setShowFriendProfile(false)}
                    onDelete={handleDeleteFriend}
                />
            )}

            {showCreateGroupModal && (
                <CreateGroupModal 
                    currentUser={user}
                    friends={friends}
                    onClose={() => setShowCreateGroupModal(false)}
                    onCreate={() => {
                        setShowCreateGroupModal(false);
                        loadAllData();
                    }}
                />
            )}

            {showGroupSettings && selectedFriend && selectedFriend.isGroup && (
                <GroupSettingsModal 
                    group={selectedFriend}
                    currentUser={user}
                    onClose={() => setShowGroupSettings(false)}
                    onUpdate={(updatedGroup) => {
                        setSelectedFriend(updatedGroup);
                        loadAllData();
                        setShowGroupSettings(false);
                    }}
                    onDelete={() => {
                        setSelectedFriend(null);
                        loadAllData();
                        setShowGroupSettings(false);
                    }}
                />
            )}
        </div>
    );
}
