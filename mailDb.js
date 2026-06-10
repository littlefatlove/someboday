// Mail Database Helper Functions

async function getMailAccount(userId) {
    const result = await safeDbCall(() => trickleListObjects('mail_account', 100, true));
    return (result.items || []).find(a => a.objectData.user_id === userId);
}

async function getMailAccountByEmail(email) {
    const result = await safeDbCall(() => trickleListObjects('mail_account', 500, true));
    return (result.items || []).find(a => a.objectData.email_address === email);
}

async function createMailAccount(userId, email) {
    const existing = await getMailAccountByEmail(email);
    if (existing) throw new Error("此信箱地址已被使用");
    
    return await safeDbCall(() => trickleCreateObject('mail_account', {
        user_id: userId,
        email_address: email,
        is_active: true
    }));
}

async function toggleMailAccount(accountId, isActive) {
    const account = await safeDbCall(() => trickleGetObject('mail_account', accountId));
    if (!account) throw new Error("帳號不存在");
    return await safeDbCall(() => trickleUpdateObject('mail_account', accountId, {
        ...account.objectData,
        is_active: isActive
    }));
}

async function sendMail(senderEmail, receiverEmail, subject, content, attachments = "[]", replyToId = "") {
    return await safeDbCall(() => trickleCreateObject('mail_message', {
        sender_email: senderEmail,
        receiver_email: receiverEmail,
        subject: subject,
        content: content,
        attachments: attachments,
        is_read: false,
        reply_to_id: replyToId,
        created_at: new Date().toISOString()
    }));
}

async function getMails(email) {
    const result = await safeDbCall(() => trickleListObjects('mail_message', 500, true));
    const allMails = result.items || [];
    const inbox = allMails.filter(m => m.objectData.receiver_email === email).sort((a,b) => new Date(b.objectData.created_at) - new Date(a.objectData.created_at));
    const sent = allMails.filter(m => m.objectData.sender_email === email).sort((a,b) => new Date(b.objectData.created_at) - new Date(a.objectData.created_at));
    return { inbox, sent };
}

async function markMailAsRead(mailId) {
    const mail = await safeDbCall(() => trickleGetObject('mail_message', mailId));
    if (mail && !mail.objectData.is_read) {
        return await safeDbCall(() => trickleUpdateObject('mail_message', mailId, {
            ...mail.objectData,
            is_read: true
        }));
    }
    return mail;
}