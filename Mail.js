function Mail({ currentUser, updateUserPoints }) {
    const [mailAccount, setMailAccount] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [inbox, setInbox] = React.useState([]);
    const [sent, setSent] = React.useState([]);
    const [activeFolder, setActiveFolder] = React.useState('inbox'); // inbox, sent, compose
    
    // Compose state
    const [receiverEmail, setReceiverEmail] = React.useState('');
    const [subject, setSubject] = React.useState('');
    const [content, setContent] = React.useState('');
    const [attachments, setAttachments] = React.useState([]);
    const [isSending, setIsSending] = React.useState(false);
    
    // View mail state
    const [viewingMail, setViewingMail] = React.useState(null);
    
    const fileInputRef = React.useRef(null);

    React.useEffect(() => {
        let isMounted = true;
        let timeoutId;

        const pollData = async () => {
            if (!isMounted) return;
            if (!document.hidden) {
                try {
                    await loadData(false); // background poll
                } catch (e) {}
            }
            if (isMounted) {
                timeoutId = setTimeout(pollData, 10000);
            }
        };

        loadData(true).then(() => {
            pollData();
        });

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [currentUser.objectId]);

    const loadData = async (showLoading = false) => {
        if (showLoading) setLoading(true);
        try {
            const acc = await getMailAccount(currentUser.objectId);
            setMailAccount(acc);
            
            if (acc && acc.objectData.is_active) {
                const mails = await getMails(acc.objectData.email_address);
                setInbox(mails.inbox);
                setSent(mails.sent);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMail = async () => {
        if (!receiverEmail.trim() || !subject.trim() || !content.trim()) {
            alert("請填寫收件人、主旨與內容");
            return;
        }

        if (updateUserPoints) {
            const hasPoints = await updateUserPoints(-0.5, '發送郵件');
            if (!hasPoints) return;
        }
        
        setIsSending(true);
        try {
            await sendMail(
                mailAccount.objectData.email_address,
                receiverEmail.trim().toLowerCase(),
                subject.trim(),
                content,
                JSON.stringify(attachments),
                viewingMail ? viewingMail.objectId : ""
            );
            
            alert("郵件已發送");
            setReceiverEmail('');
            setSubject('');
            setContent('');
            setAttachments([]);
            setActiveFolder('sent');
            setViewingMail(null);
            loadData();
        } catch (e) {
            alert("發送失敗: " + e.message);
        } finally {
            setIsSending(false);
        }
    };

    const handleAttachmentUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            alert('目前僅支援圖片附件');
            return;
        }
        
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1200;
                let width = img.width;
                let height = img.height;
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                
                setAttachments(prev => [...prev, dataUrl]);
            };
        };
    };
    
    const openMail = async (mail) => {
        setViewingMail(mail);
        if (activeFolder === 'inbox' && !mail.objectData.is_read) {
            try {
                await markMailAsRead(mail.objectId);
                setInbox(prev => prev.map(m => m.objectId === mail.objectId ? { ...m, objectData: { ...m.objectData, is_read: true } } : m));
            } catch (e) {}
        }
    };
    
    const handleReply = () => {
        if (!viewingMail) return;
        setReceiverEmail(viewingMail.objectData.sender_email);
        setSubject(`Re: ${viewingMail.objectData.subject}`);
        setContent(`\n\n--- 原始郵件 ---\n${viewingMail.objectData.content}`);
        setAttachments([]);
        setViewingMail(null);
        setActiveFolder('compose');
    };

    if (loading) {
        return <div className="flex-1 flex justify-center items-center"><div className="icon-loader animate-spin text-3xl text-[var(--primary-color)]"></div></div>;
    }

    if (!mailAccount || !mailAccount.objectData.is_active) {
        return (
            <div className="flex-1 flex flex-col justify-center items-center bg-gray-50 p-6">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                    <div className="icon-mail text-4xl text-gray-300"></div>
                </div>
                <h2 className="text-xl font-bold text-gray-700">信箱尚未啟用</h2>
                <p className="text-gray-500 mt-2 text-sm max-w-md text-center">請前往「設定 &gt; 個人資料設定」中建立並啟用您的專屬信箱，即可開始收發郵件。</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col md:flex-row bg-gray-50 h-full overflow-hidden w-full">
            {/* Sidebar */}
            <div className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-gray-200 shrink-0 flex flex-row md:flex-col">
                <div className="p-2 md:p-4 border-r md:border-r-0 md:border-b border-gray-100 flex items-center justify-center shrink-0">
                    <button 
                        onClick={() => {
                            setActiveFolder('compose');
                            setViewingMail(null);
                            setReceiverEmail('');
                            setSubject('');
                            setContent('');
                            setAttachments([]);
                        }}
                        className="whitespace-nowrap px-4 py-2 md:w-full md:py-3 text-emerald-800 rounded-xl font-bold shadow-md shadow-emerald-200 transition-colors flex items-center justify-center"
                    >
                        <div className="icon-pen-tool mr-2 text-emerald-700"></div> <span className="hidden md:inline">撰寫郵件</span><span className="inline md:hidden">撰寫</span>
                    </button>
                </div>
                <div className="flex-1 flex flex-row md:flex-col p-2 gap-1 md:gap-1 overflow-x-auto md:overflow-y-auto">
                    <button 
                        onClick={() => { setActiveFolder('inbox'); setViewingMail(null); }}
                        className={`whitespace-nowrap flex items-center justify-center md:justify-between px-4 py-2 md:py-3 rounded-lg transition-colors ${activeFolder === 'inbox' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <div className="flex items-center"><div className="icon-inbox md:mr-3 mr-1"></div> 收件匣</div>
                        {inbox.filter(m => !m.objectData.is_read).length > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full ml-2">{inbox.filter(m => !m.objectData.is_read).length}</span>
                        )}
                    </button>
                    <button 
                        onClick={() => { setActiveFolder('sent'); setViewingMail(null); }}
                        className={`whitespace-nowrap flex items-center justify-center px-4 py-2 md:py-3 rounded-lg transition-colors ${activeFolder === 'sent' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <div className="icon-send md:mr-3 mr-1"></div> 寄件備份
                    </button>
                </div>
                <div className="hidden md:block mt-auto p-4 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 text-center font-medium">
                    您的信箱：<br/>
                    <span className="text-gray-800 break-all">{mailAccount.objectData.email_address}</span>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-white relative">
                {viewingMail ? (
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                        <div className="max-w-3xl mx-auto">
                            <button onClick={() => setViewingMail(null)} className="mb-4 md:mb-6 flex items-center text-gray-500 hover:text-gray-800 transition-colors">
                                <div className="icon-arrow-left mr-2"></div> 返回
                            </button>
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 break-words">{viewingMail.objectData.subject}</h2>
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 pb-4 md:pb-6 border-b border-gray-100 gap-4">
                                <div className="flex items-center min-w-0">
                                    <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-lg md:text-xl mr-3 md:mr-4 uppercase">
                                        {(activeFolder === 'inbox' ? viewingMail.objectData.sender_email : viewingMail.objectData.receiver_email).charAt(0)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-bold text-gray-800 truncate">{activeFolder === 'inbox' ? viewingMail.objectData.sender_email : viewingMail.objectData.receiver_email}</div>
                                        <div className="text-xs text-gray-400 mt-1 truncate">
                                            {activeFolder === 'inbox' ? '寄給 您' : `寄給 ${viewingMail.objectData.receiver_email}`}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-400 md:text-right flex flex-row md:flex-col justify-between items-center md:items-end w-full md:w-auto">
                                    <span>{new Date(viewingMail.objectData.created_at).toLocaleString()}</span>
                                    {activeFolder === 'inbox' && (
                                        <button onClick={handleReply} className="mt-0 md:mt-2 text-[var(--primary-color)] hover:underline flex items-center font-bold">
                                            <div className="icon-reply mr-1"></div> 回覆
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                                {viewingMail.objectData.content}
                            </div>
                            
                            {/* Attachments */}
                            {viewingMail.objectData.attachments && JSON.parse(viewingMail.objectData.attachments).length > 0 && (
                                <div className="mt-8 pt-6 border-t border-gray-100">
                                    <h4 className="text-sm font-bold text-gray-500 mb-4 flex items-center">
                                        <div className="icon-paperclip mr-2"></div> 附件圖片
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {JSON.parse(viewingMail.objectData.attachments).map((url, idx) => (
                                            <a key={idx} href={url} target="_blank" className="block rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
                                                <img src={url} className="w-full h-32 object-cover" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : activeFolder === 'compose' ? (
                    <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden max-w-4xl mx-auto w-full">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center shrink-0">
                            <div className="icon-pen-tool mr-3 text-[var(--primary-color)]"></div>
                            撰寫新郵件
                        </h2>
                        <div className="space-y-3 md:space-y-4 flex-1 flex flex-col min-h-0">
                            <input 
                                type="email"
                                value={receiverEmail}
                                onChange={e => setReceiverEmail(e.target.value)}
                                placeholder="收件人 (請輸入完整的 @someboday.mail)"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-100 focus:border-[var(--primary-color)] transition-all outline-none"
                            />
                            <input 
                                type="text"
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                placeholder="主旨"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-100 focus:border-[var(--primary-color)] transition-all outline-none font-bold"
                            />
                            <div className="flex-1 relative flex flex-col border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-100 focus-within:border-[var(--primary-color)] transition-all">
                                <textarea
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    placeholder="撰寫郵件內容..."
                                    className="flex-1 w-full p-4 resize-none outline-none bg-gray-50 focus:bg-white custom-scrollbar"
                                ></textarea>
                                
                                {attachments.length > 0 && (
                                    <div className="p-3 bg-white border-t border-gray-100 flex gap-2 overflow-x-auto custom-scrollbar">
                                        {attachments.map((url, idx) => (
                                            <div key={idx} className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden group border border-gray-200">
                                                <img src={url} className="w-full h-full object-cover" />
                                                <button 
                                                    onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                                                    className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <div className="icon-trash-2"></div>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                <div className="bg-white border-t border-gray-200 p-3 flex justify-between items-center shrink-0">
                                    <div>
                                        <button 
                                            onClick={() => fileInputRef.current.click()}
                                            className="text-gray-500 hover:text-[var(--primary-color)] p-2 rounded-lg hover:bg-emerald-50 transition-colors flex items-center text-sm font-bold"
                                        >
                                            <div className="icon-image mr-1 text-lg"></div> 加入圖片
                                        </button>
                                        <input type="file" ref={fileInputRef} onChange={handleAttachmentUpload} accept="image/*" className="hidden" />
                                    </div>
                                    <button 
                                        onClick={handleSendMail}
                                        disabled={isSending}
                                        className="px-6 py-2 text-emerald-800 rounded-lg font-bold transition-colors flex items-center shadow-md disabled:opacity-50"
                                    >
                                        {isSending ? <div className="icon-loader animate-spin mr-2"></div> : <div className="icon-send mr-2 text-emerald-700"></div>}
                                        傳送
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="p-4 md:p-6 border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur z-10 flex justify-between items-center">
                            <h2 className="text-lg md:text-xl font-bold text-gray-800 capitalize">{activeFolder === 'inbox' ? '收件匣' : '寄件備份'}</h2>
                            <span className="text-sm text-gray-500 font-medium">共 {(activeFolder === 'inbox' ? inbox : sent).length} 封</span>
                        </div>
                        
                        {(activeFolder === 'inbox' ? inbox : sent).length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <div className="icon-mail text-5xl text-gray-200 mb-4"></div>
                                <p>這裡空空如也</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {(activeFolder === 'inbox' ? inbox : sent).map(mail => (
                                    <div 
                                        key={mail.objectId} 
                                        onClick={() => openMail(mail)}
                                        className={`p-4 hover:bg-gray-50 cursor-pointer flex items-center transition-colors ${activeFolder === 'inbox' && !mail.objectData.is_read ? 'bg-emerald-50/30' : ''}`}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold mr-4 shrink-0 uppercase">
                                            {(activeFolder === 'inbox' ? mail.objectData.sender_email : mail.objectData.receiver_email).charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0 pr-4">
                                            <div className="flex items-baseline justify-between mb-1">
                                                <h4 className={`text-sm truncate mr-2 ${activeFolder === 'inbox' && !mail.objectData.is_read ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                                                    {activeFolder === 'inbox' ? mail.objectData.sender_email : `寄給: ${mail.objectData.receiver_email}`}
                                                </h4>
                                                <span className="text-xs text-gray-400 shrink-0">
                                                    {new Date(mail.objectData.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className={`text-sm truncate max-w-xs ${activeFolder === 'inbox' && !mail.objectData.is_read ? 'font-bold text-gray-800' : 'text-gray-800 font-medium'}`}>
                                                    {mail.objectData.subject || '(無主旨)'}
                                                </span>
                                                <span className="text-sm text-gray-400 truncate ml-2">
                                                    - {mail.objectData.content.replace(/\n/g, ' ')}
                                                </span>
                                            </div>
                                        </div>
                                        {mail.objectData.attachments && JSON.parse(mail.objectData.attachments).length > 0 && (
                                            <div className="icon-paperclip text-gray-300 ml-2"></div>
                                        )}
                                        {activeFolder === 'inbox' && !mail.objectData.is_read && (
                                            <div className="w-2.5 h-2.5 bg-[var(--primary-color)] rounded-full ml-4 shrink-0 shadow-sm shadow-emerald-200"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}