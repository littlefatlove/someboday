// Database Helper Functions

const RETRY_COUNT = 3;

// Simple in-memory cache
const userCache = new Map();
const CACHE_TTL = 60000; // 1 minute

async function safeDbCall(apiCall) {
    let lastError = null;
    for (let i = 0; i < RETRY_COUNT; i++) {
        try {
            return await apiCall();
        } catch (error) {
            lastError = error;
            // If rate limited or network error, wait and retry
            if (error && (error.message?.includes('Rate limit') || error.message?.includes('fetch'))) {
                await new Promise(r => setTimeout(r, 1000 * (i + 1)));
                continue;
            }
            throw error;
        }
    }
    throw lastError;
}

/**
 * Save User App Data
 */
async function saveAppData(userId, appName, data) {
    let nextPageToken = undefined;
    let allMatches = [];
    
    // Fetch all to clean up duplicates
    for (let i = 0; i < 50; i++) {
        const result = await safeDbCall(() => trickleListObjects('user_app_data', 100, true, nextPageToken));
        const matches = (result.items || []).filter(d => 
            d.objectData.user_id === userId && d.objectData.app_name === appName
        );
        allMatches = [...allMatches, ...matches];
        nextPageToken = result.nextPageToken;
        if (!nextPageToken) break;
    }

    try {
        if (allMatches.length > 0) {
            // Sort by updated_at desc
            allMatches.sort((a, b) => new Date(b.objectData.updated_at || b.createdAt).getTime() - new Date(a.objectData.updated_at || a.createdAt).getTime());
            const primary = allMatches[0];
            
            // Delete older duplicates to prevent conflicts
            for (let i = 1; i < allMatches.length; i++) {
                safeDbCall(() => trickleDeleteObject('user_app_data', allMatches[i].objectId)).catch(e => console.error(e));
            }

            return await trickleUpdateObject('user_app_data', primary.objectId, {
                data: JSON.stringify(data),
                updated_at: new Date().toISOString()
            });
        } else {
            return await trickleCreateObject('user_app_data', {
                user_id: userId,
                app_name: appName,
                data: JSON.stringify(data),
                updated_at: new Date().toISOString()
            });
        }
    } catch (error) {
        console.error("Save app data error:", error);
        throw error;
    }
}

/**
 * Get User App Data
 */
async function getAppData(userId, appName) {
    let nextPageToken = undefined;
    let allMatches = [];

    for (let i = 0; i < 50; i++) {
        const result = await safeDbCall(() => trickleListObjects('user_app_data', 100, true, nextPageToken));
        const matches = (result.items || []).filter(d => 
            d.objectData.user_id === userId && d.objectData.app_name === appName
        );
        allMatches = [...allMatches, ...matches];
        nextPageToken = result.nextPageToken;
        if (!nextPageToken) break;
    }
    
    if (allMatches.length > 0) {
        // Sort by updated_at desc to get the newest
        allMatches.sort((a, b) => new Date(b.objectData.updated_at || b.createdAt).getTime() - new Date(a.objectData.updated_at || a.createdAt).getTime());
        const item = allMatches[0];
        try {
            return JSON.parse(item.objectData.data);
        } catch (e) {
            return item.objectData.data;
        }
    }
    return null;
}

window.getUserWithCache = async function(userId) {
    if (userCache.has(userId)) {
        const cached = userCache.get(userId);
        if (Date.now() - cached.timestamp < CACHE_TTL) {
            return cached.data;
        }
    }
    
    try {
        const user = await safeDbCall(() => trickleGetObject('chat_user', userId));
        if (user) {
            userCache.set(userId, { data: user, timestamp: Date.now() });
            return user;
        }
    } catch(e) {
        console.warn("Failed to fetch user", e);
    }
    
    // Fallback to expired cache if available
    if (userCache.has(userId)) {
        return userCache.get(userId).data;
    }
    
    return null;
};

/**
 * Register a new user
 */
async function registerUser(username, password) {
    if (!username || !password) throw new Error("Username and password are required");
    
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    // Check if user exists (Scan more pages to be safer)
    try {
        let nextPageToken = undefined;
        // Check first 500 users (5 pages)
        for(let i=0; i<5; i++) {
            const result = await safeDbCall(() => trickleListObjects('chat_user', 100, true, nextPageToken));
            const users = result.items || [];
            const existingUser = users.find(u => {
                const name = u.objectData?.username;
                return name && String(name) === cleanUsername;
            });
            if (existingUser) {
                throw new Error("用戶名稱已被使用");
            }
            nextPageToken = result.nextPageToken;
            if (!nextPageToken) break;
        }
    } catch (e) {
        if (!e.toString().includes('NoPermission') && e.message !== "用戶名稱已被使用") {
            throw e;
        } else if (e.message === "用戶名稱已被使用") {
            throw e;
        }
    }

    // Create new user
    const newUser = {
        username: cleanUsername,
        password: cleanPassword, 
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanUsername}`,
        status: 'online',
        bio: '這傢伙很懶，什麼都沒寫'
    };
    
    return await safeDbCall(() => trickleCreateObject('chat_user', newUser));
}

/**
 * Login user
 */
async function loginUser(username, password) {
    if (!username || !password) throw new Error("Username and password are required");
    
    const result = await safeDbCall(() => trickleListObjects('chat_user', 100, true));
    const users = result.items || [];
    const user = users.find(u => u.objectData.username === username);

    if (!user) {
        throw new Error("用戶不存在");
    }

    if (user.objectData.password && user.objectData.password !== password) {
        throw new Error("密碼錯誤");
    }
    
    // Update status to online
    try {
        await safeDbCall(() => trickleUpdateObject('chat_user', user.objectId, {
            ...user.objectData,
            status: 'online'
        }));
    } catch(e) {
        console.warn("Failed to update status", e);
    }
    
    return { ...user, objectData: { ...user.objectData, status: 'online' } };
}

/**
 * Update User Status
 */
async function updateUserStatus(userId, status) {
    try {
        const user = await safeDbCall(() => trickleGetObject('chat_user', userId));
        if (user && user.objectData.status !== status) {
            const updatedUser = await safeDbCall(() => trickleUpdateObject('chat_user', userId, {
                ...user.objectData,
                status: status
            }));
            userCache.set(userId, { data: updatedUser, timestamp: Date.now() });
        }
    } catch(e) {
        console.warn("Update status failed", e);
    }
}

/**
 * Update User Profile
 */
async function updateUserProfile(userId, data) {
    const user = await safeDbCall(() => trickleGetObject('chat_user', userId));
    if (!user) throw new Error("User not found");
    
    const updatedData = { ...user.objectData, ...data };
    const updatedUser = await safeDbCall(() => trickleUpdateObject('chat_user', userId, updatedData));
    
    // Update cache
    userCache.set(userId, { data: updatedUser, timestamp: Date.now() });
    
    return updatedUser;
}

/**
 * Get Recent Users (for Explore/Add Friend list)
 */
async function getRecentUsers(limit = 100) {
    const result = await safeDbCall(() => trickleListObjects('chat_user', limit, true));
    return result.items || [];
}

/**
 * Search users by partial username
 * Support pagination to search through more users (Incremental)
 * If onProgress is provided, it calls it with new matches found on each page
 */
async function searchUsers(query, currentUserId, onProgress) {
    if (!query) return [];
    const lowerQuery = query.trim().toLowerCase();
    if (!lowerQuery) return [];
    
    let allMatches = [];
    let nextPageToken = undefined;
    
    try {
        // Scan up to 100 pages (10000 users) to ensure we find older users
        for (let i = 0; i < 100; i++) {
            const result = await safeDbCall(() => trickleListObjects('chat_user', 100, true, nextPageToken));
            const items = result.items || [];
            
            // Update cache
            const now = Date.now();
            items.forEach(u => {
                userCache.set(u.objectId, { data: u, timestamp: now });
            });

            // Find matches in this page
            const matches = items.filter(u => {
                const name = u.objectData?.username;
                return name && String(name).toLowerCase().includes(lowerQuery);
            });
            
            if (matches.length > 0) {
                allMatches = [...allMatches, ...matches];
                if (onProgress) {
                    onProgress(matches);
                }
            }

            nextPageToken = result.nextPageToken;
            if (!nextPageToken) break;
            
            // Very small breathing room
            if (i % 5 === 0) await new Promise(r => setTimeout(r, 5));
        }

        return allMatches;
    } catch (error) {
        console.warn("Search failed", error);
        return allMatches;
    }
}

/**
 * Get Friend List
 * Refactored to avoid listing all users
 */
async function getFriends(currentUserId) {
    const result = await safeDbCall(() => trickleListObjects('chat_friend', 100, true));
    
    const friendships = (result.items || []).filter(f => 
        (f.objectData.user_id === currentUserId || f.objectData.friend_id === currentUserId) &&
        f.objectData.status === 'accepted'
    );
    
    // Extract IDs
    const friendIds = friendships.map(f => f.objectData.user_id === currentUserId ? f.objectData.friend_id : f.objectData.user_id);
    const uniqueIds = [...new Set(friendIds)];
    
    if (uniqueIds.length === 0) return [];

    // Fetch individual users with cache
    const users = await Promise.all(
        uniqueIds.map(id => window.getUserWithCache(id))
    );
    
    return users.filter(u => u !== null);
}

/**
 * Get Pending Friend Requests
 * Refactored to avoid listing all users
 */
async function getFriendRequests(currentUserId) {
    const result = await safeDbCall(() => trickleListObjects('chat_friend', 100, true));
    const requests = (result.items || []).filter(f => 
        f.objectData.friend_id === currentUserId &&
        f.objectData.status === 'pending'
    );
    
    if (requests.length === 0) return [];

    // Fetch individual users with cache
    const enrichedRequests = await Promise.all(requests.map(async req => {
        try {
            const requester = await window.getUserWithCache(req.objectData.user_id);
            return { ...req, requester };
        } catch (e) {
            return null;
        }
    }));
    
    return enrichedRequests.filter(r => r && r.requester);
}

/**
 * Add Friend Request
 */
async function addFriend(currentUserId, targetUserId) {
    // Check if already friends or pending
    const result = await safeDbCall(() => trickleListObjects('chat_friend', 100, true));
    const existing = (result.items || []).find(f => 
        (f.objectData.user_id === currentUserId && f.objectData.friend_id === targetUserId) ||
        (f.objectData.user_id === targetUserId && f.objectData.friend_id === currentUserId)
    );
    
    if (existing) return existing;
    
    // Set status to pending
    return await safeDbCall(() => trickleCreateObject('chat_friend', {
        user_id: currentUserId,
        friend_id: targetUserId,
        status: 'pending'
    }));
}

/**
 * Respond to Friend Request
 */
async function respondToFriendRequest(requestId, status) {
    if (status === 'rejected') {
        // Delete request on rejection so they can request again if needed
        return await safeDbCall(() => trickleDeleteObject('chat_friend', requestId));
    } else {
        // Accept
        const request = await safeDbCall(() => trickleGetObject('chat_friend', requestId));
        if (!request) throw new Error("Request not found");
        
        return await safeDbCall(() => trickleUpdateObject('chat_friend', requestId, {
            ...request.objectData,
            status: 'accepted'
        }));
    }
}

/**
 * Delete Friend
 */
async function deleteFriend(currentUserId, friendId) {
    let nextPageToken = undefined;
    let friendship = null;
    
    for (let i = 0; i < 10; i++) {
        const result = await safeDbCall(() => trickleListObjects('chat_friend', 100, true, nextPageToken));
        friendship = (result.items || []).find(f => 
            (f.objectData.user_id === currentUserId && f.objectData.friend_id === friendId) ||
            (f.objectData.user_id === friendId && f.objectData.friend_id === currentUserId)
        );
        if (friendship) break;
        nextPageToken = result.nextPageToken;
        if (!nextPageToken) break;
    }
    
    if (friendship) {
        return await safeDbCall(() => trickleDeleteObject('chat_friend', friendship.objectId));
    } else {
        throw new Error("Friendship not found");
    }
}

/**
 * Update Friend Chat Bg
 */
async function updateFriendBg(friendshipId, bgDataUrl) {
    const friendship = await safeDbCall(() => trickleGetObject('chat_friend', friendshipId));
    if (friendship) {
        return await safeDbCall(() => trickleUpdateObject('chat_friend', friendshipId, {
            ...friendship.objectData,
            chat_bg: bgDataUrl
        }));
    }
}

/**
 * Update Group Chat Bg
 */
async function updateGroupBg(groupId, bgDataUrl) {
    const group = await safeDbCall(() => trickleGetObject('chat_group', groupId));
    if (group) {
        return await safeDbCall(() => trickleUpdateObject('chat_group', groupId, {
            ...group.objectData,
            chat_bg: bgDataUrl
        }));
    }
}

/**
 * Update Group
 */
async function updateGroup(groupId, name, avatarUrl) {
    const group = await safeDbCall(() => trickleGetObject('chat_group', groupId));
    if (!group) throw new Error("Group not found");
    return await safeDbCall(() => trickleUpdateObject('chat_group', groupId, {
        ...group.objectData,
        name: name,
        avatar: avatarUrl
    }));
}

/**
 * Get System Messages
 */
async function getSystemMessages() {
    const result = await safeDbCall(() => trickleListObjects('chat_message', 500, true));
    const msgs = result.items || [];
    return msgs.filter(m => {
        const d = m.objectData;
        return d.sender_id === 'system_admin' || d.receiver_id === 'system_admin';
    }).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

/**
 * Send Message
 */
async function sendMessage(senderId, receiverId, content, type = 'text', metadata = '{}', mediaData = null, mediaId = null) {
    const payload = {
        sender_id: senderId,
        receiver_id: receiverId,
        content: content, 
        msg_type: type,
        metadata: metadata,
        is_read: false,
        is_revoked: false
    };
    
    if (mediaData) {
        payload.media_data = mediaData;
    }
    
    if (mediaId) {
        payload.media_id = mediaId;
    }
    
    return await safeDbCall(() => trickleCreateObject('chat_message', payload));
}

/**
 * Get Unread Messages for User
 */
async function getUnreadMessages(userId) {
    let allMsgs = [];
    let nextPageToken = undefined;
    for (let i = 0; i < 5; i++) {
        const result = await safeDbCall(() => trickleListObjects('chat_message', 100, true, nextPageToken));
        allMsgs = [...allMsgs, ...(result.items || [])];
        nextPageToken = result.nextPageToken;
        if (!nextPageToken) break;
    }
    
    return allMsgs.filter(m => 
        m.objectData.receiver_id === userId && 
        !m.objectData.is_read && 
        !m.objectData.is_revoked
    );
}

/**
 * Get Messages between two users
 */
async function getMessages(currentUserId, friendId) {
    let allMsgs = [];
    let nextPageToken = undefined;
    
    // Fetch up to 10 pages (1000 messages total) to find history
    for (let i = 0; i < 10; i++) {
        const result = await safeDbCall(() => trickleListObjects('chat_message', 100, true, nextPageToken)); 
        const msgs = result.items || [];
        
        const chatMsgs = msgs.filter(m => {
            const d = m.objectData;
            return (d.sender_id === currentUserId && d.receiver_id === friendId) ||
                   (d.sender_id === friendId && d.receiver_id === currentUserId);
        });
        
        allMsgs = [...allMsgs, ...chatMsgs];
        
        nextPageToken = result.nextPageToken;
        if (!nextPageToken) break;
        
        // Stop early if we have enough messages
        if (allMsgs.length >= 100) break;
    }
    
    // Sort by createdAt ascending (oldest first)
    return allMsgs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

/**
 * Mark messages as read
 */
async function markMessagesAsRead(messages) {
    const unreadMessages = messages.filter(m => !m.objectData.is_read);
    if (unreadMessages.length === 0) return;

    await Promise.all(unreadMessages.map(msg => 
        safeDbCall(() => trickleUpdateObject('chat_message', msg.objectId, {
            ...msg.objectData,
            is_read: true
        }))
    ));
}

/**
 * Revoke a message
 */
async function revokeMessage(msg) {
    return await safeDbCall(() => trickleUpdateObject('chat_message', msg.objectId, {
        ...msg.objectData,
        is_revoked: true
    }));
}

/**
 * Optimized: Fetch both Friends and Requests in one go to reduce network calls
 * AND Avoid listing all users
 */
async function fetchChatData(currentUserId) {
    // 1. Fetch friendships first
    let allFriendships = [];
    let nextPageToken = undefined;
    for (let i = 0; i < 10; i++) {
        const friendsResult = await safeDbCall(() => trickleListObjects('chat_friend', 100, true, nextPageToken));
        allFriendships = [...allFriendships, ...(friendsResult.items || [])];
        nextPageToken = friendsResult.nextPageToken;
        if (!nextPageToken) break;
    }

    // 2. Identify relevant user IDs
    const friendRelations = allFriendships.filter(f => 
        (f.objectData.user_id === currentUserId || f.objectData.friend_id === currentUserId) &&
        f.objectData.status === 'accepted'
    );
    
    const requestRelations = allFriendships.filter(f => 
        f.objectData.friend_id === currentUserId &&
        f.objectData.status === 'pending'
    );

    const friendIds = friendRelations.map(f => f.objectData.user_id === currentUserId ? f.objectData.friend_id : f.objectData.user_id);
    const requesterIds = requestRelations.map(f => f.objectData.user_id);
    
    const userIdsToFetch = [...new Set([...friendIds, ...requesterIds])];

    // 3. Fetch User Details individually WITH CACHE
    const users = await Promise.all(
        userIdsToFetch.map(id => window.getUserWithCache(id))
    );
    
    const validUsers = users.filter(u => u !== null);

    // 4. Map back to structure
    const friends = validUsers.filter(u => friendIds.includes(u.objectId)).map(u => {
        const relation = friendRelations.find(f => f.objectData.user_id === u.objectId || f.objectData.friend_id === u.objectId);
        return {
            ...u,
            friendshipId: relation ? relation.objectId : null,
            chatBg: relation ? relation.objectData.chat_bg : null
        };
    });

    const requests = requestRelations.map(req => {
        const requester = validUsers.find(u => u.objectId === req.objectData.user_id);
        return requester ? { ...req, requester } : null;
    }).filter(r => r !== null);

    return { friends, requests };
}

/**
 * Create a new Chat Group
 */
async function createGroup(name, avatarUrl, creatorId, memberIds) {
    const group = await safeDbCall(() => trickleCreateObject('chat_group', {
        name: name,
        avatar: avatarUrl,
        creator_id: creatorId
    }));
    
    // Add creator as admin
    await safeDbCall(() => trickleCreateObject('chat_group_member', {
        group_id: group.objectId,
        user_id: creatorId,
        role: 'admin'
    }));
    
    // Add selected members
    for (const memberId of memberIds) {
        await safeDbCall(() => trickleCreateObject('chat_group_member', {
            group_id: group.objectId,
            user_id: memberId,
            role: 'member'
        }));
    }
    
    return { ...group, isGroup: true };
}

/**
 * Leave Group (For Member)
 */
async function leaveGroup(userId, groupId) {
    let nextPageToken = undefined;
    let membership = null;
    for (let i = 0; i < 10; i++) {
        const result = await safeDbCall(() => trickleListObjects('chat_group_member', 100, true, nextPageToken));
        membership = (result.items || []).find(m => m.objectData.user_id === userId && m.objectData.group_id === groupId);
        if (membership) break;
        nextPageToken = result.nextPageToken;
        if (!nextPageToken) break;
    }
    if (membership) {
        return await safeDbCall(() => trickleDeleteObject('chat_group_member', membership.objectId));
    }
}

/**
 * Delete Group Completely (For Creator)
 */
async function deleteGroupComplete(groupId) {
    await safeDbCall(() => trickleDeleteObject('chat_group', groupId));
    let nextPageToken = undefined;
    let allMemberships = [];
    for (let i = 0; i < 10; i++) {
        const result = await safeDbCall(() => trickleListObjects('chat_group_member', 100, true, nextPageToken));
        allMemberships = [...allMemberships, ...(result.items || [])];
        nextPageToken = result.nextPageToken;
        if (!nextPageToken) break;
    }
    const groupMemberships = allMemberships.filter(m => m.objectData.group_id === groupId);
    for (const m of groupMemberships) {
        try {
            await safeDbCall(() => trickleDeleteObject('chat_group_member', m.objectId));
        } catch (e) {
            console.warn('Failed to delete membership', e);
        }
    }
}

/**
 * Get User's Groups
 */
async function getUserGroups(userId) {
    let allMemberships = [];
    let nextPageToken = undefined;
    for (let i = 0; i < 10; i++) {
        const membersResult = await safeDbCall(() => trickleListObjects('chat_group_member', 100, true, nextPageToken));
        allMemberships = [...allMemberships, ...(membersResult.items || [])];
        nextPageToken = membersResult.nextPageToken;
        if (!nextPageToken) break;
    }
    
    const myMemberships = allMemberships.filter(m => m.objectData.user_id === userId);
    
    if (myMemberships.length === 0) return [];
    
    const groupIds = myMemberships.map(m => m.objectData.group_id);
    
    let allGroups = [];
    nextPageToken = undefined;
    for (let i = 0; i < 10; i++) {
        const groupsResult = await safeDbCall(() => trickleListObjects('chat_group', 100, true, nextPageToken));
        allGroups = [...allGroups, ...(groupsResult.items || [])];
        nextPageToken = groupsResult.nextPageToken;
        if (!nextPageToken) break;
    }
    
    return allGroups
        .filter(g => groupIds.includes(g.objectId))
        .map(g => ({ ...g, isGroup: true }));
}

/**
 * Get Group Messages
 */
async function getGroupMessages(groupId) {
    let allMsgs = [];
    let nextPageToken = undefined;
    
    for (let i = 0; i < 10; i++) {
        const result = await safeDbCall(() => trickleListObjects('chat_message', 100, true, nextPageToken));
        const msgs = (result.items || []).filter(m => m.objectData.receiver_id === groupId);
        allMsgs = [...allMsgs, ...msgs];
        
        nextPageToken = result.nextPageToken;
        if (!nextPageToken) break;
        
        if (allMsgs.length >= 100) break;
    }
    
    return allMsgs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

/**
 * Add Custom Sticker
 */
async function addCustomSticker(userId, dataUrl) {
    return await safeDbCall(() => trickleCreateObject('user_sticker', {
        owner_id: userId,
        url: dataUrl,
        created_at: new Date().toISOString()
    }));
}

/**
 * Get Custom Stickers
 */
async function getCustomStickers(userId) {
    const result = await safeDbCall(() => trickleListObjects('user_sticker', 100, true));
    return (result.items || []).filter(s => s.objectData.owner_id === userId);
}

/**
 * Delete Custom Sticker
 */
async function deleteCustomSticker(stickerId) {
    return await safeDbCall(() => trickleDeleteObject('user_sticker', stickerId));
}

/**
 * Upload large media to chat_media table (with Chunking)
 */
async function uploadMedia(data, mimeType, originalName) {
    const CHUNK_SIZE = 100 * 1024; // Reduced chunk size to 100KB
    
    if (data.length <= CHUNK_SIZE) {
        return await safeDbCall(() => trickleCreateObject('chat_media', {
            data: data,
            mime_type: mimeType,
            original_name: originalName,
            is_chunked: false,
            chunk_count: 0
        }));
    }

    const totalChunks = Math.ceil(data.length / CHUNK_SIZE);
    
    const parentObj = await safeDbCall(() => trickleCreateObject('chat_media', {
        data: "", 
        mime_type: mimeType,
        original_name: originalName,
        is_chunked: true,
        chunk_count: totalChunks
    }));
    
    const parentId = parentObj.objectId;
    const CONCURRENCY = 1; 

    try {
        for (let i = 0; i < totalChunks; i += CONCURRENCY) {
            const chunkIndex = i;
            const start = chunkIndex * CHUNK_SIZE;
            const end = start + CHUNK_SIZE;
            const chunkData = data.substring(start, end);
            
            await safeDbCall(() => trickleCreateObject('chat_media_chunk', {
                parent_id: parentId,
                chunk_index: chunkIndex,
                data: chunkData
            }));
            
            if (i < totalChunks - 1) {
                // Increase delay to 500ms to be safer against rate limits and database overload
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        
        return parentObj;
    } catch (error) {
        console.error("Chunk upload failed", error);
        throw error;
    }
}

/**
 * Get media by ID (Reconstruct from chunks if needed)
 */
async function getMedia(mediaId) {
    const mediaObj = await safeDbCall(() => trickleGetObject('chat_media', mediaId));
    
    if (!mediaObj) return null;
    
    if (!mediaObj.objectData.is_chunked) {
        return mediaObj;
    }

    let myChunks = [];
    let nextPageToken = undefined;
    const expectedCount = mediaObj.objectData.chunk_count;

    do {
        const result = await safeDbCall(() => trickleListObjects('chat_media_chunk', 500, false, nextPageToken));
        const items = result.items || [];
        nextPageToken = result.nextPageToken;

        const relevant = items.filter(c => c.objectData.parent_id === mediaId);
        myChunks = [...myChunks, ...relevant];

        if (myChunks.length >= expectedCount) {
            break;
        }
    } while (nextPageToken);

    myChunks.sort((a, b) => a.objectData.chunk_index - b.objectData.chunk_index);
        
    if (myChunks.length === 0) {
        return mediaObj;
    }
    
    const fullData = myChunks.map(c => c.objectData.data).join('');
    
    return {
        ...mediaObj,
        objectData: {
            ...mediaObj.objectData,
            data: fullData
        }
    };
}

/**
 * Get All Files for User
 */
async function getAllUserFiles(currentUserId) {
    const result = await safeDbCall(() => trickleListObjects('chat_message', 100, true));
    const msgs = result.items || [];
    
    const fileMsgs = msgs.filter(m => {
        const d = m.objectData;
        const isMyMsg = d.sender_id === currentUserId || d.receiver_id === currentUserId;
        const isFile = ['image', 'video', 'audio', 'file'].includes(d.msg_type);
        return isMyMsg && isFile && !d.is_revoked;
    });

    return fileMsgs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Add Favorite
 */
async function addFavorite(userId, messageId) {
    return await safeDbCall(() => trickleCreateObject('user_favorite', {
        user_id: userId,
        message_id: messageId,
        created_at: new Date().toISOString()
    }));
}

/**
 * Remove Favorite
 */
async function removeFavorite(userId, messageId) {
    const result = await safeDbCall(() => trickleListObjects('user_favorite', 100, true));
    const fav = (result.items || []).find(f => 
        f.objectData.user_id === userId && f.objectData.message_id === messageId
    );
    
    if (fav) {
        return await safeDbCall(() => trickleDeleteObject('user_favorite', fav.objectId));
    }
}

/**
 * Get User Favorites
 */
async function getFavorites(userId) {
    const favResult = await safeDbCall(() => trickleListObjects('user_favorite', 100, true));
    const myFavs = (favResult.items || []).filter(f => f.objectData.user_id === userId);
    
    if (myFavs.length === 0) return [];

    const msgResult = await safeDbCall(() => trickleListObjects('chat_message', 100, true));
    const allMsgs = msgResult.items || [];
    
    // We also need sender info.
    const favMessages = myFavs.map(fav => {
        const msg = allMsgs.find(m => m.objectId === fav.objectData.message_id);
        return msg ? { ...msg, favId: fav.objectId, favCreatedAt: fav.objectData.created_at } : null;
    }).filter(m => m && !m.objectData.is_revoked);
    
    const senderIds = [...new Set(favMessages.map(m => m.objectData.sender_id))];
    const senders = await Promise.all(
        senderIds.map(id => window.getUserWithCache(id))
    );
    
    const validSenders = senders.filter(u => u !== null);

    return favMessages.map(msg => {
        const sender = validSenders.find(u => u.objectId === msg.objectData.sender_id);
        return { ...msg, sender };
    }).sort((a, b) => new Date(b.favCreatedAt) - new Date(a.favCreatedAt));
}

/**
 * Check if message is favorited
 */
async function checkIsFavorite(userId, messageId) {
    const result = await safeDbCall(() => trickleListObjects('user_favorite', 100, true));
    return (result.items || []).some(f => 
        f.objectData.user_id === userId && f.objectData.message_id === messageId
    );
}

/**
 * Create Note
 */
async function createNote(userId, title, content) {
    return await safeDbCall(() => trickleCreateObject('user_note', {
        user_id: userId,
        title: title,
        content: content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }));
}

/**
 * Update Note
 */
async function updateNote(noteId, title, content) {
    const note = await safeDbCall(() => trickleGetObject('user_note', noteId));
    if (!note) throw new Error("Note not found");
    
    return await safeDbCall(() => trickleUpdateObject('user_note', noteId, {
        ...note.objectData,
        title: title,
        content: content,
        updated_at: new Date().toISOString()
    }));
}

/**
 * Delete Note
 */
async function deleteNote(noteId) {
    return await safeDbCall(() => trickleDeleteObject('user_note', noteId));
}

/**
 * Get User Notes
 */
async function getUserNotes(userId) {
    const result = await safeDbCall(() => trickleListObjects('user_note', 100, true));
    return (result.items || [])
        .filter(n => n.objectData.user_id === userId)
        .sort((a, b) => new Date(b.objectData.updated_at) - new Date(a.objectData.updated_at));
}

/**
 * Create Todo
 */
async function createTodo(userId, content) {
    return await safeDbCall(() => trickleCreateObject('user_todo', {
        user_id: userId,
        content: content,
        is_completed: false,
        created_at: new Date().toISOString()
    }));
}



/**
 * Toggle Todo Status
 */
async function toggleTodoStatus(todoId, currentStatus) {
    return await safeDbCall(() => trickleUpdateObject('user_todo', todoId, {
        is_completed: !currentStatus
    }));
}

/**
 * Delete Todo
 */
async function deleteTodo(todoId) {
    return await safeDbCall(() => trickleDeleteObject('user_todo', todoId));
}

/**
 * Get User Todos
 */
async function getUserTodos(userId) {
    const result = await safeDbCall(() => trickleListObjects('user_todo', 100, true));
    return (result.items || [])
        .filter(t => t.objectData.user_id === userId)
        .sort((a, b) => {
            if (a.objectData.is_completed === b.objectData.is_completed) {
                return new Date(b.objectData.created_at) - new Date(a.objectData.created_at);
            }
            return a.objectData.is_completed ? 1 : -1;
        });
}