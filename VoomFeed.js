function VoomFeed({ currentUser, friends, updateUserPoints }) {
    const [videos, setVideos] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [showUpload, setShowUpload] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState(null);
    const [caption, setCaption] = React.useState('');
    const [uploading, setUploading] = React.useState(false);
    const [progress, setProgress] = React.useState(0);
    const [activeCommentsPostId, setActiveCommentsPostId] = React.useState(null);
    const [commentContent, setCommentContent] = React.useState('');
    const [subscriptions, setSubscriptions] = React.useState([]);
    const fileInputRef = React.useRef(null);

    React.useEffect(() => {
        const subs = JSON.parse(localStorage.getItem(`voom_subs_${currentUser.objectId}`) || '[]');
        setSubscriptions(subs);
        
        loadVideos();
        const interval = setInterval(loadVideos, 10000);
        return () => clearInterval(interval);
    }, [currentUser, friends]);

    const loadVideos = async () => {
        try {
            const voomPosts = await getPublicVoomFeed(currentUser.objectId);
            setVideos(voomPosts.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('video/')) {
            alert('請上傳影片檔案');
            return;
        }
        if (file.size > 50 * 1024 * 1024) {
            alert('影片大小不能超過 50MB');
            return;
        }
        setSelectedFile(file);
        setShowUpload(true);
        e.target.value = null; // reset
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        if (updateUserPoints) {
            const hasPoints = await updateUserPoints(-0.5, '發佈 someboday\'s 影片');
            if (!hasPoints) return;
        }

        setUploading(true);
        
        if (typeof trickleUploadFile === 'undefined') {
            alert('Trickle File Storage API 尚未準備好');
            setUploading(false);
            return;
        }

        trickleUploadFile(
            selectedFile,
            (p) => setProgress(p),
            async (url) => {
                try {
                    const imagesData = [{ type: 'video', url: url, isVoom: true }];
                    await createPost(currentUser.objectId, caption, imagesData, 'public');
                    setShowUpload(false);
                    setSelectedFile(null);
                    setCaption('');
                    loadVideos();
                } catch (e) {
                    alert('發佈失敗');
                } finally {
                    setUploading(false);
                    setProgress(0);
                }
            },
            (err) => {
                alert('上傳失敗: ' + err);
                setUploading(false);
                setProgress(0);
            }
        );
    };

    const handleLike = async (post) => {
        try {
            const isLiked = await toggleLike(post.objectId, currentUser.objectId);
            setVideos(prev => prev.map(p => {
                if (p.objectId !== post.objectId) return p;
                const newLikes = isLiked 
                    ? [...p.likes, { objectData: { user_id: currentUser.objectId } }] 
                    : p.likes.filter(l => l.objectData.user_id !== currentUser.objectId);
                return { ...p, isLikedByMe: isLiked, likes: newLikes };
            }));
        } catch (error) {
            console.error(error);
        }
    };

    const handleComment = async (postId) => {
        if (!commentContent.trim()) return;
        try {
            await addComment(postId, currentUser.objectId, commentContent);
            setCommentContent('');
            loadVideos(); 
        } catch (error) {
            alert("留言失敗");
        }
    };

    const handleDeletePost = async (postId) => {
        if (!confirm("確定要取消發佈這部影片嗎？")) return;
        setVideos(prev => prev.filter(p => p.objectId !== postId));
        try {
            await deletePost(postId);
        } catch (error) {
            console.error("Delete post failed", error);
            alert("取消發佈失敗");
            loadVideos();
        }
    };

    const toggleSubscribe = (authorId) => {
        setSubscriptions(prev => {
            let nextSubs;
            if (prev.includes(authorId)) {
                nextSubs = prev.filter(id => id !== authorId);
            } else {
                nextSubs = [...prev, authorId];
            }
            localStorage.setItem(`voom_subs_${currentUser.objectId}`, JSON.stringify(nextSubs));
            return nextSubs;
        });
    };

    return (
        <div className="flex-1 bg-[var(--bg-color)] h-full relative overflow-hidden flex flex-col font-sans">
            {/* Header */}
            <div className="h-16 bg-[var(--secondary-color)]/80 backdrop-blur-md flex items-center justify-between px-6 z-20 absolute top-0 left-0 right-0 border-b border-emerald-100/50">
                <h2 className="text-xl font-bold text-gray-800 tracking-tight flex items-center drop-shadow-sm">
                    <div className="icon-clapperboard mr-3 text-[var(--primary-color)]"></div>
                    someboday's
                </h2>
                <button 
                    onClick={() => fileInputRef.current.click()}
                    className="flex items-center space-x-2 px-4 py-2 bg-[var(--primary-color)] text-white rounded-full hover:bg-[var(--primary-hover)] transition-all shadow-md shadow-emerald-200"
                >
                    <div className="icon-video text-lg"></div>
                    <span className="text-sm font-bold">分享影片</span>
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="video/*" className="hidden" />
            </div>

            {/* Feed */}
            <div className="flex-1 overflow-y-auto custom-scrollbar snap-y snap-mandatory scroll-smooth pb-16 md:pb-0 h-full bg-emerald-50/30">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="icon-loader animate-spin text-4xl text-[var(--primary-color)]"></div>
                    </div>
                ) : videos.length === 0 ? (
                     <div className="flex flex-col items-center justify-center h-full text-gray-400">
                         <div className="icon-film text-6xl mb-4 opacity-50 text-emerald-200"></div>
                         <p className="font-bold text-gray-600">尚無影片</p>
                         <p className="text-sm mt-1">快來成為第一個分享的人！</p>
                     </div>
                ) : (
                    videos.map(post => {
                        let videoData;
                        try {
                            videoData = JSON.parse(post.objectData.images || '[]')[0];
                        } catch (e) {
                            return null;
                        }
                        if (!videoData || !videoData.url) return null;
                        
                        const isSubscribed = subscriptions.includes(post.author.objectId);
                        const isMe = post.author.objectId === currentUser.objectId;
                        
                        return (
                            <div key={post.objectId} className="h-full w-full max-w-md mx-auto snap-start flex items-center justify-center relative bg-[var(--bg-color)] group/voom">
                                <CustomVideoPlayer 
                                    src={videoData.url} 
                                    loop={true}
                                    className="w-full h-full pb-16 md:pb-0"
                                />
                                
                                {/* Overlay Info */}
                                <div className="absolute bottom-16 md:bottom-20 left-0 right-0 p-4 flex justify-between items-end pointer-events-none z-10 opacity-100 transition-opacity">
                                    <div className="text-gray-800 flex-1 pr-4">
                                        <div className="flex items-center mb-2">
                                            <img src={post.author.objectData.avatar} className="w-10 h-10 rounded-full border-2 border-white mr-3 shadow-sm bg-white" />
                                            <span className="font-bold text-lg drop-shadow-sm">@{post.author.objectData.username}</span>
                                            {isMe ? (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleDeletePost(post.objectId); }}
                                                    className="ml-3 px-3 py-1 rounded-full text-xs font-bold transition-colors pointer-events-auto shadow-sm bg-red-500/90 text-white hover:bg-red-600 flex items-center backdrop-blur-sm"
                                                >
                                                    <div className="icon-trash-2 mr-1 text-[10px]"></div>取消發佈
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); toggleSubscribe(post.author.objectId); }}
                                                    className={`ml-3 px-3 py-1 rounded-full text-xs font-bold transition-colors pointer-events-auto shadow-sm backdrop-blur-sm ${
                                                        isSubscribed 
                                                        ? 'bg-white/80 text-gray-700' 
                                                        : 'bg-[var(--primary-color)] text-white'
                                                    }`}
                                                >
                                                    {isSubscribed ? '已訂閱' : '+ 訂閱'}
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-sm font-medium drop-shadow-sm">{post.objectData.content}</p>
                                    </div>
                                    <div className="flex flex-col items-center space-y-6 pointer-events-auto pb-4">
                                        <button onClick={() => handleLike(post)} className="text-gray-600 flex flex-col items-center group/btn hover:scale-105 transition-transform">
                                            <div className="w-12 h-12 bg-white/80 border border-emerald-100 rounded-full flex items-center justify-center backdrop-blur-md shadow-sm transition-colors group-hover/btn:border-[var(--primary-color)]">
                                                <div className={`text-2xl transition-transform ${post.isLikedByMe ? 'icon-heart fill-current text-red-500' : 'icon-heart text-gray-600'}`}></div>
                                            </div>
                                            <span className="text-xs mt-1 font-bold text-gray-700">{post.likes.length}</span>
                                        </button>
                                        <button 
                                            onClick={() => setActiveCommentsPostId(post.objectId)} 
                                            className="text-gray-600 flex flex-col items-center group/btn hover:scale-105 transition-transform"
                                        >
                                            <div className="w-12 h-12 bg-white/80 border border-emerald-100 rounded-full flex items-center justify-center backdrop-blur-md shadow-sm transition-colors group-hover/btn:border-[var(--primary-color)]">
                                                <div className="icon-message-circle text-2xl text-gray-600"></div>
                                            </div>
                                            <span className="text-xs mt-1 font-bold text-gray-700">{post.comments.length}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Comments Overlay */}
            {activeCommentsPostId && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-40 flex flex-col justify-end animate-fade-in" onClick={() => setActiveCommentsPostId(null)}>
                    <div 
                        className="bg-white rounded-t-3xl h-[60vh] flex flex-col shadow-2xl transform transition-transform"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center p-4 border-b border-gray-100">
                            <h3 className="font-bold text-gray-800">
                                評論 ({videos.find(v => v.objectId === activeCommentsPostId)?.comments?.length || 0})
                            </h3>
                            <button onClick={() => setActiveCommentsPostId(null)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                                <div className="icon-x"></div>
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {(() => {
                                const activePost = videos.find(v => v.objectId === activeCommentsPostId);
                                if (!activePost || activePost.comments.length === 0) {
                                    return <div className="text-center text-gray-400 py-10 text-sm">尚無評論，來搶頭香吧！</div>;
                                }
                                return activePost.comments.map(comment => (
                                    <div key={comment.objectId} className="flex items-start">
                                        <img src={comment.author.objectData.avatar} className="w-8 h-8 rounded-full bg-gray-100 mr-3 border border-gray-200" />
                                        <div className="flex-1">
                                            <div className="flex items-baseline space-x-2">
                                                <span className="font-bold text-sm text-gray-800">{comment.author.objectData.username}</span>
                                                <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-0.5 bg-gray-50 p-2.5 rounded-xl rounded-tl-sm inline-block border border-gray-100">
                                                {comment.objectData.content}
                                            </p>
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                        
                        <div className="p-4 border-t border-gray-100 bg-white">
                            <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 p-1 focus-within:border-[var(--primary-color)] focus-within:ring-2 focus-within:ring-emerald-50 transition-all">
                                <input 
                                    type="text" 
                                    value={commentContent}
                                    onChange={(e) => setCommentContent(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleComment(activeCommentsPostId)}
                                    placeholder="新增評論..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-3 py-2 outline-none"
                                />
                                <button 
                                    onClick={() => handleComment(activeCommentsPostId)}
                                    disabled={!commentContent.trim()}
                                    className="p-2 bg-[var(--primary-color)] text-white rounded-lg disabled:opacity-50 hover:bg-[var(--primary-hover)] transition-all flex-shrink-0"
                                >
                                    <div className="icon-send text-sm"></div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Modal */}
            {showUpload && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-scale-in border border-gray-100 shadow-2xl">
                        <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-4">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                <div className="icon-video mr-2 text-[var(--primary-color)]"></div>
                                分享影片
                            </h3>
                            <button onClick={() => !uploading && setShowUpload(false)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                                <div className="icon-x text-xl"></div>
                            </button>
                        </div>
                        
                        <div className="mb-4 bg-emerald-50/50 rounded-xl flex flex-col items-center justify-center h-40 overflow-hidden relative border-2 border-dashed border-emerald-200">
                            <div className="icon-film text-5xl text-emerald-300 mb-2"></div>
                            <div className="text-emerald-600 font-bold text-sm">
                                {selectedFile ? selectedFile.name : '選擇了影片'}
                            </div>
                            <div className="absolute bottom-2 right-2 bg-[var(--primary-color)] text-white text-xs px-2 py-1 rounded-lg font-bold shadow-sm">
                                {selectedFile ? Math.round(selectedFile.size / (1024*1024)) + ' MB' : ''}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">影片說明</label>
                            <textarea
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder="寫下這段影片的故事..."
                                className="w-full h-24 p-3 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-emerald-100 focus:border-[var(--primary-color)] outline-none transition-all"
                                disabled={uploading}
                            />
                        </div>

                        {uploading ? (
                            <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="flex justify-between text-sm font-bold text-gray-600 mb-2">
                                    <span className="flex items-center">
                                        <div className="icon-loader animate-spin mr-2 text-[var(--primary-color)]"></div>
                                        上傳中...
                                    </span>
                                    <span className="text-[var(--primary-color)]">{Math.round(progress)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div className="bg-[var(--primary-color)] h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                </div>
                            </div>
                        ) : null}

                        <button 
                            onClick={handleUpload}
                            disabled={uploading}
                            className="w-full py-3 bg-[var(--primary-color)] text-white rounded-xl font-bold hover:bg-[var(--primary-hover)] transition-all disabled:opacity-50 flex justify-center items-center shadow-lg shadow-emerald-200"
                        >
                            {uploading ? '處理中請稍候' : '確認發佈影片'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}