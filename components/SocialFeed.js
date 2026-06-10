function SocialFeed({ currentUser, friends, updateUserPoints }) {
    const [posts, setPosts] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [showCreateModal, setShowCreateModal] = React.useState(false);
    
    // Create Post State
    const [newPostContent, setNewPostContent] = React.useState('');
    const [newPostImages, setNewPostImages] = React.useState([]);
    const [newPostVisibility, setNewPostVisibility] = React.useState('public');
    const [isPosting, setIsPosting] = React.useState(false);

    // Comment State
    const [activeCommentPostId, setActiveCommentPostId] = React.useState(null);
    const [commentContent, setCommentContent] = React.useState('');

    // Menu State
    const [activeMenuPostId, setActiveMenuPostId] = React.useState(null);

    // Use ref for dependencies in polling closure
    const userRef = React.useRef(currentUser);
    const friendsRef = React.useRef(friends);

    React.useEffect(() => {
        userRef.current = currentUser;
        friendsRef.current = friends;
    }, [currentUser, friends]);

    React.useEffect(() => {
        let isMounted = true;
        let timeoutId;

        const pollFeed = async () => {
            if (!isMounted) return;
            if (!document.hidden) {
                try {
                    await loadFeed();
                } catch (e) {
                    console.warn("Feed polling error", e);
                }
            }
            if (isMounted) {
                timeoutId = setTimeout(pollFeed, 10000);
            }
        };

        pollFeed();

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, []); // Empty dependency array as we rely on Refs and internal state updates

    const loadFeed = async () => {
        try {
            const friendIds = friends.map(f => f.objectId);
            const feedData = await getSocialFeed(currentUser.objectId, friendIds);
            setPosts(feedData);
        } catch (error) {
            console.error("Failed to load feed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length + newPostImages.length > 9) {
            alert("最多只能上傳 9 張照片");
            return;
        }

        for (const file of files) {
            if (!file.type.startsWith('image/')) continue;
            
            try {
                // Simplified compression for feed
                const compress = (f) => new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(f);
                    reader.onload = (ev) => {
                        const img = new Image();
                        img.src = ev.target.result;
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            const MAX = 1200;
                            let w = img.width, h = img.height;
                            if (w > h && w > MAX) { h *= MAX/w; w = MAX; }
                            else if (h > MAX) { w *= MAX/h; h = MAX; }
                            canvas.width = w; canvas.height = h;
                            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                            resolve(canvas.toDataURL('image/jpeg', 0.8));
                        };
                    };
                });

                const dataUrl = await compress(file);
                setNewPostImages(prev => [...prev, dataUrl]);
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim() && newPostImages.length === 0) return;

        if (updateUserPoints) {
            const hasPoints = await updateUserPoints(-0.3, '發佈朋友圈動態');
            if (!hasPoints) return;
        }

        setIsPosting(true);
        try {
            await createPost(currentUser.objectId, newPostContent, newPostImages, newPostVisibility);
            setShowCreateModal(false);
            setNewPostContent('');
            setNewPostImages([]);
            loadFeed();
        } catch (error) {
            alert("發佈失敗");
        } finally {
            setIsPosting(false);
        }
    };

    const handleLike = async (post) => {
        try {
            const isLiked = await toggleLike(post.objectId, currentUser.objectId);
            // Optimistic update
            setPosts(prev => prev.map(p => {
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
            // Don't close comment input immediately for better UX if they want to add more? 
            // Or maybe close it. Let's keep it open or close based on preference. 
            // Here we keep activeCommentPostId as is, just clear content.
            // But we need to reload to show the new comment properly with author info.
            loadFeed(); 
        } catch (error) {
            alert("留言失敗");
        }
    };

    const handleDeletePost = async (postId) => {
        if (!confirm("確定要刪除這則貼文嗎？")) return;
        
        // Optimistic update
        setPosts(prev => prev.filter(p => p.objectId !== postId));
        setActiveMenuPostId(null);

        try {
            await deletePost(postId);
        } catch (error) {
            console.error("Delete post failed", error);
            alert("刪除失敗");
            loadFeed(); // Revert
        }
    };

    if (loading) return <div className="flex justify-center items-center h-full bg-gray-50"><div className="icon-loader animate-spin text-2xl text-[var(--primary-color)]"></div></div>;

    return (
        <div className="flex-1 bg-gray-50 h-full relative overflow-hidden flex flex-col font-sans">
            {/* Header */}
            <div className="h-16 border-b border-gray-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 z-20 sticky top-0 shadow-sm transition-all">
                <h2 className="text-xl font-bold text-gray-800 tracking-tight flex items-center">
                    <div className="w-2 h-6 bg-[var(--primary-color)] rounded-full mr-3"></div>
                    朋友圈
                </h2>
                <button 
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-[var(--primary-color)] text-white rounded-xl hover:bg-[var(--primary-hover)] transition-all shadow-lg shadow-emerald-200 transform hover:-translate-y-0.5"
                >
                    <div className="icon-camera text-lg"></div>
                    <span className="text-sm font-bold">發佈動態</span>
                </button>
            </div>

            {/* Feed List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-0 pb-20">
                {/* Cover Image */}
                <div className="h-72 bg-gradient-to-b from-gray-700 to-gray-900 relative mb-16 shadow-lg group">
                     <img 
                        src={currentUser.objectData.cover_photo || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"} 
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-90 transition-opacity duration-700"
                        alt="Cover"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                     
                     <div className="absolute -bottom-10 right-8 flex items-end">
                         <div className="text-right mr-4 mb-3 text-white drop-shadow-lg">
                             <div className="font-bold text-xl">{currentUser.objectData.username}</div>
                             <div className="text-xs opacity-80 font-medium tracking-wide">
                                {currentUser.objectData.bio || '寫點什麼介紹自己吧...'}
                             </div>
                         </div>
                         <div className="relative">
                            <img 
                                src={currentUser.objectData.avatar} 
                                className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl bg-white object-cover transform hover:scale-105 transition-transform duration-300"
                                alt="Me"
                            />
                            <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                         </div>
                     </div>
                </div>

                {posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <div className="icon-image text-3xl text-gray-300"></div>
                        </div>
                        <p className="font-medium text-lg text-gray-500">尚無動態</p>
                        <p className="text-sm mt-1">分享你的第一則貼文，讓生活更精彩！</p>
                        <button 
                            onClick={() => setShowCreateModal(true)}
                            className="mt-6 px-6 py-2 border border-[var(--primary-color)] text-[var(--primary-color)] rounded-lg hover:bg-[var(--secondary-color)] transition-colors text-sm font-bold"
                        >
                            立即發佈
                        </button>
                    </div>
                ) : (
                    <div className="max-w-2xl mx-auto px-4 space-y-8">
                        {posts.filter(p => {
                            try {
                                const imgs = JSON.parse(p.objectData.images || '[]');
                                return !imgs.some(img => img.isVoom);
                            } catch(e) { return true; }
                        }).map(post => {
                            const images = JSON.parse(post.objectData.images || '[]');
                            return (
                                <div key={post.objectId} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
                                    {/* Post Header */}
                                    <div className="p-5 flex items-start justify-between">
                                        <div className="flex items-center group cursor-pointer">
                                            <img 
                                                src={post.author.objectData.avatar} 
                                                className="w-12 h-12 rounded-full bg-gray-100 object-cover border border-gray-100 group-hover:border-[var(--primary-color)] transition-colors"
                                                alt="Avatar"
                                            />
                                            <div className="ml-3">
                                                <h4 className="font-bold text-gray-800 text-base group-hover:text-[var(--primary-color)] transition-colors">
                                                    {post.author.objectData.username}
                                                </h4>
                                                <p className="text-xs text-gray-400 mt-0.5 font-medium">
                                                    {new Date(post.createdAt).toLocaleString()}
                                                    {post.objectData.visibility !== 'public' && (
                                                        <span className="ml-2 px-1.5 py-0.5 bg-gray-100 rounded text-[10px] text-gray-500">
                                                            {post.objectData.visibility === 'friends' ? '僅好友' : '私人'}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        {/* Post Menu Actions */}
                                        <div className="relative">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveMenuPostId(activeMenuPostId === post.objectId ? null : post.objectId);
                                                }}
                                                className={`p-2 rounded-full transition-colors ${activeMenuPostId === post.objectId ? 'bg-gray-100 text-gray-800' : 'text-gray-300 hover:text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                <div className="icon-ellipsis"></div>
                                            </button>
                                            
                                            {activeMenuPostId === post.objectId && (
                                                <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-xl border border-gray-100 z-10 overflow-hidden animate-fade-in-up">
                                                    {post.author.objectId === currentUser.objectId ? (
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeletePost(post.objectId);
                                                            }}
                                                            className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 flex items-center transition-colors font-medium"
                                                        >
                                                            <div className="icon-trash-2 mr-2 text-xs"></div>
                                                            刪除貼文
                                                        </button>
                                                    ) : (
                                                         <button 
                                                            className="w-full text-left px-4 py-3 text-sm text-gray-500 hover:bg-gray-50 flex items-center transition-colors cursor-not-allowed"
                                                            disabled
                                                        >
                                                            <div className="icon-flag mr-2 text-xs"></div>
                                                            檢舉
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Post Content */}
                                    <div className="px-5 pb-3">
                                        {post.objectData.content && (
                                            <div className="max-h-[50vh] overflow-y-auto custom-scrollbar pr-2 mb-4">
                                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words text-base">
                                                    {post.objectData.content}
                                                </p>
                                            </div>
                                        )}
                                        
                                        {/* Images Grid */}
                                        {images.length > 0 && (
                                            <div className={`grid gap-1.5 rounded-xl overflow-hidden ${
                                                images.length === 1 ? 'grid-cols-1' : 
                                                images.length === 2 ? 'grid-cols-2' :
                                                images.length === 4 ? 'grid-cols-2' : 'grid-cols-3'
                                            }`}>
                                                {images.map((img, idx) => (
                                                    <div 
                                                        key={idx} 
                                                        className={`bg-gray-100 cursor-zoom-in relative group overflow-hidden ${images.length === 1 ? 'max-h-[500px]' : 'aspect-square'}`}
                                                    >
                                                        <img 
                                                            src={img} 
                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                                            alt="Post content" 
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions Bar */}
                                    <div className="px-5 py-3 flex items-center justify-between border-t border-gray-50 bg-gray-50/30">
                                        <div className="flex items-center space-x-6">
                                            <button 
                                                onClick={() => handleLike(post)}
                                                className={`flex items-center space-x-2 group transition-colors ${post.isLikedByMe ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                                            >
                                                <div className={`text-xl transition-transform transform group-active:scale-125 ${post.isLikedByMe ? 'icon-heart fill-current' : 'icon-heart'}`}></div>
                                                <span className={`text-sm font-bold ${post.isLikedByMe ? 'text-red-600' : 'text-gray-600'}`}>
                                                    {post.likes.length > 0 ? post.likes.length : '讚'}
                                                </span>
                                            </button>

                                            <button 
                                                onClick={() => setActiveCommentPostId(activeCommentPostId === post.objectId ? null : post.objectId)}
                                                className={`flex items-center space-x-2 group transition-colors ${activeCommentPostId === post.objectId ? 'text-[var(--primary-color)]' : 'text-gray-500 hover:text-[var(--primary-color)]'}`}
                                            >
                                                <div className="icon-message-circle text-xl transition-transform transform group-active:scale-125"></div>
                                                <span className="text-sm font-bold text-gray-600">
                                                    {post.comments.length > 0 ? post.comments.length : '留言'}
                                                </span>
                                            </button>
                                            
                                            <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 group transition-colors">
                                                <div className="icon-share-2 text-xl transition-transform transform group-active:scale-125"></div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Likes & Comments Section */}
                                    {(post.likes.length > 0 || post.comments.length > 0 || activeCommentPostId === post.objectId) && (
                                        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                                            {/* Like Count / List */}
                                            {post.likes.length > 0 && (
                                                <div className="flex items-center mb-3 text-sm text-gray-600 font-medium">
                                                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mr-2 text-red-500">
                                                        <div className="icon-heart w-3 h-3 fill-current"></div>
                                                    </div>
                                                    <span>
                                                        {post.likes.length} 人覺得這很讚
                                                    </span>
                                                </div>
                                            )}

                                            {/* Comments List */}
                                            {post.comments.length > 0 && (
                                                <div className="space-y-3 mb-3">
                                                    {post.comments.map(comment => (
                                                        <div key={comment.objectId} className="flex items-start group">
                                                            <img src={comment.author.objectData.avatar} className="w-8 h-8 rounded-full bg-white border border-gray-200 mt-0.5 flex-shrink-0" />
                                                            <div className="ml-2 bg-white px-3 py-2 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 flex-1">
                                                                <div className="flex justify-between items-baseline">
                                                                    <span className="text-sm font-bold text-gray-800 hover:text-[var(--primary-color)] cursor-pointer transition-colors">
                                                                        {comment.author.objectData.username}
                                                                    </span>
                                                                    <span className="text-[10px] text-gray-400">
                                                                        {new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-gray-600 mt-0.5">{comment.objectData.content}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            {/* Comment Input */}
                                            {activeCommentPostId === post.objectId && (
                                                <div className="flex items-start gap-2 mt-4 animate-fade-in pt-2 border-t border-gray-200/50">
                                                    <img src={currentUser.objectData.avatar} className="w-8 h-8 rounded-full border border-gray-200 bg-white" />
                                                    <div className="flex-1 relative">
                                                        <input 
                                                            type="text" 
                                                            value={commentContent}
                                                            onChange={(e) => setCommentContent(e.target.value)}
                                                            className="w-full bg-white border border-gray-300 rounded-xl pl-4 pr-12 py-2 text-sm focus:border-[var(--primary-color)] focus:ring-2 focus:ring-emerald-100 outline-none transition-all shadow-inner"
                                                            placeholder="寫下你的留言..."
                                                            onKeyPress={(e) => e.key === 'Enter' && handleComment(post.objectId)}
                                                            autoFocus
                                                        />
                                                        <button 
                                                            onClick={() => handleComment(post.objectId)}
                                                            disabled={!commentContent.trim()}
                                                            className="absolute right-1 top-1 p-1.5 text-[var(--primary-color)] hover:bg-emerald-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                                                        >
                                                            <div className="icon-send text-sm"></div>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Create Post Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] border border-gray-100 overflow-hidden transform transition-all">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-800">發表動態</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors">
                                <div className="icon-x"></div>
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            <div className="flex items-center mb-4 space-x-3">
                                <img src={currentUser.objectData.avatar} className="w-12 h-12 rounded-full border border-gray-200 shadow-sm" />
                                <div>
                                    <div className="font-bold text-gray-800 text-base">{currentUser.objectData.username}</div>
                                    <div className="relative inline-block mt-1 group/select">
                                        <div className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors border border-transparent hover:border-gray-300">
                                            <span>
                                                {newPostVisibility === 'public' && '🌎 公開'}
                                                {newPostVisibility === 'friends' && '👥 僅好友'}
                                                {newPostVisibility === 'private' && '🔒 僅自己'}
                                            </span>
                                            <div className="icon-chevron-down w-3 h-3"></div>
                                        </div>
                                        <select 
                                            value={newPostVisibility} 
                                            onChange={(e) => setNewPostVisibility(e.target.value)}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        >
                                            <option value="public">🌎 公開</option>
                                            <option value="friends">👥 僅好友</option>
                                            <option value="private">🔒 僅自己</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="relative group/input mb-2">
                                <textarea
                                    value={newPostContent}
                                    onChange={(e) => setNewPostContent(e.target.value)}
                                    placeholder="這一刻的想法..."
                                    className="w-full h-36 p-4 border-none focus:ring-0 resize-none text-lg placeholder-gray-400 bg-gray-50/50 rounded-2xl transition-all focus:bg-white focus:shadow-inner outline-none"
                                    autoFocus
                                ></textarea>
                                <div className="absolute bottom-3 right-3 text-xs text-gray-300 pointer-events-none">
                                    {newPostContent.length} 字
                                </div>
                            </div>
                            
                            {/* Image Preview Grid */}
                            <div className="grid grid-cols-3 gap-2 mt-4">
                                {newPostImages.map((img, i) => (
                                    <div key={i} className="aspect-square relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                                        <img src={img} className="w-full h-full object-cover" alt="Preview" />
                                        <button 
                                            onClick={() => setNewPostImages(prev => prev.filter((_, idx) => idx !== i))}
                                            className="absolute top-1 right-1 bg-black/60 backdrop-blur-sm text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:scale-110"
                                        >
                                            <div className="icon-x w-3 h-3"></div>
                                        </button>
                                    </div>
                                ))}
                                
                                {newPostImages.length < 9 && (
                                    <label className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] transition-all group">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 group-hover:bg-white flex items-center justify-center mb-2 transition-colors">
                                            <div className="icon-plus text-gray-500 group-hover:text-[var(--primary-color)]"></div>
                                        </div>
                                        <span className="text-xs text-gray-400 font-medium group-hover:text-[var(--primary-color)]">新增照片</span>
                                        <input 
                                            type="file" 
                                            multiple 
                                            accept="image/*" 
                                            className="hidden" 
                                            onChange={handleImageUpload}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>
                        
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end items-center">
                            <span className="text-xs text-gray-400 mr-4">
                                {newPostImages.length}/9 張照片
                            </span>
                            <button 
                                onClick={handleCreatePost}
                                disabled={isPosting || (!newPostContent.trim() && newPostImages.length === 0)}
                                className="px-6 py-2.5 bg-[var(--primary-color)] text-white rounded-xl hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg shadow-emerald-200 transform hover:translate-y-px transition-all flex items-center"
                            >
                                {isPosting && <div className="icon-loader animate-spin mr-2"></div>}
                                {isPosting ? '發佈中...' : '發佈'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}