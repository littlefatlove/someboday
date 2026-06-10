// Social Media Database Functions

/**
 * Create a new social post
 */
async function createPost(userId, content, images = [], visibility = 'public') {
    return await safeDbCall(() => trickleCreateObject('social_post', {
        user_id: userId,
        content: content,
        images: JSON.stringify(images),
        visibility: visibility
    }));
}

/**
 * Delete a social post
 */
async function deletePost(postId) {
    return await safeDbCall(() => trickleDeleteObject('social_post', postId));
}

/**
 * Get posts for the feed (Self + Friends)
 * Optimized to fetch authors individually instead of listing all users
 */
async function getSocialFeed(currentUserId, friendIds) {
    // 1. Fetch posts, comments, likes in parallel
    const [postsResult, commentsResult, likesResult] = await Promise.all([
        safeDbCall(() => trickleListObjects('social_post', 100, true)),
        safeDbCall(() => trickleListObjects('social_comment', 200, true)),
        safeDbCall(() => trickleListObjects('social_like', 200, true))
    ]);

    const allPosts = postsResult.items || [];
    const allComments = commentsResult.items || [];
    const allLikes = likesResult.items || [];

    // 2. Filter relevant posts
    const relevantPosts = allPosts.filter(post => {
        const authorId = post.objectData.user_id;
        const visibility = post.objectData.visibility;
        
        if (authorId === currentUserId) return true;
        
        if (friendIds.includes(authorId)) {
            return visibility === 'public' || visibility === 'friends';
        }
        
        return false;
    });

    // 3. Collect User IDs needed (Authors of posts, comments)
    const postAuthorIds = relevantPosts.map(p => p.objectData.user_id);
    const commentAuthorIds = allComments
        .filter(c => relevantPosts.some(p => p.objectId === c.objectData.post_id))
        .map(c => c.objectData.user_id);
    
    const uniqueUserIds = [...new Set([...postAuthorIds, ...commentAuthorIds, currentUserId])];

    // 4. Fetch Users individually with CACHE (using window.getUserWithCache from db.js)
    const users = await Promise.all(
        uniqueUserIds.map(id => window.getUserWithCache ? window.getUserWithCache(id) : safeDbCall(() => trickleGetObject('chat_user', id)).catch(() => null))
    );
    const validUsers = users.filter(u => u !== null);

    // 5. Map/Enrich data
    const enrichedPosts = relevantPosts.map(post => {
        // Find Author
        const author = validUsers.find(u => u.objectId === post.objectData.user_id) || {
            objectId: 'unknown',
            objectData: { username: 'Unknown User', avatar: 'https://via.placeholder.com/40' }
        };
        
        // Find Comments for this post
        const postComments = allComments
            .filter(c => c.objectData.post_id === post.objectId)
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            .map(c => {
                const cAuthor = validUsers.find(u => u.objectId === c.objectData.user_id) || {
                    objectId: 'unknown',
                    objectData: { username: 'Unknown', avatar: 'https://via.placeholder.com/40' }
                };
                return { ...c, author: cAuthor };
            });

        // Find Likes for this post
        const postLikes = allLikes.filter(l => l.objectData.post_id === post.objectId);
        
        return {
            ...post,
            author: author,
            comments: postComments,
            likes: postLikes,
            isLikedByMe: postLikes.some(l => l.objectData.user_id === currentUserId)
        };
    });

    return enrichedPosts;
}

/**
 * Get public Voom videos (Global)
 */
async function getPublicVoomFeed(currentUserId) {
    const [postsResult, commentsResult, likesResult] = await Promise.all([
        safeDbCall(() => trickleListObjects('social_post', 200, true)),
        safeDbCall(() => trickleListObjects('social_comment', 200, true)),
        safeDbCall(() => trickleListObjects('social_like', 200, true))
    ]);

    const allPosts = postsResult.items || [];
    const allComments = commentsResult.items || [];
    const allLikes = likesResult.items || [];

    const relevantPosts = allPosts.filter(post => {
        const visibility = post.objectData.visibility;
        if (visibility !== 'public' && post.objectData.user_id !== currentUserId) return false;
        try {
            const imgs = JSON.parse(post.objectData.images || '[]');
            return imgs.some(img => img.isVoom);
        } catch(e) { return false; }
    });

    const postAuthorIds = relevantPosts.map(p => p.objectData.user_id);
    const commentAuthorIds = allComments
        .filter(c => relevantPosts.some(p => p.objectId === c.objectData.post_id))
        .map(c => c.objectData.user_id);
    
    const uniqueUserIds = [...new Set([...postAuthorIds, ...commentAuthorIds, currentUserId])];

    const users = await Promise.all(
        uniqueUserIds.map(id => window.getUserWithCache ? window.getUserWithCache(id) : safeDbCall(() => trickleGetObject('chat_user', id)).catch(() => null))
    );
    const validUsers = users.filter(u => u !== null);

    return relevantPosts.map(post => {
        const author = validUsers.find(u => u.objectId === post.objectData.user_id) || {
            objectId: 'unknown',
            objectData: { username: 'Unknown User', avatar: 'https://via.placeholder.com/40' }
        };
        
        const postComments = allComments
            .filter(c => c.objectData.post_id === post.objectId)
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            .map(c => {
                const cAuthor = validUsers.find(u => u.objectId === c.objectData.user_id) || {
                    objectId: 'unknown',
                    objectData: { username: 'Unknown', avatar: 'https://via.placeholder.com/40' }
                };
                return { ...c, author: cAuthor };
            });

        const postLikes = allLikes.filter(l => l.objectData.post_id === post.objectId);
        
        return {
            ...post,
            author: author,
            comments: postComments,
            likes: postLikes,
            isLikedByMe: postLikes.some(l => l.objectData.user_id === currentUserId)
        };
    });
}

/**
 * Add a comment
 */
async function addComment(postId, userId, content) {
    return await safeDbCall(() => trickleCreateObject('social_comment', {
        post_id: postId,
        user_id: userId,
        content: content
    }));
}

/**
 * Toggle Like
 */
async function toggleLike(postId, userId) {
    const result = await safeDbCall(() => trickleListObjects('social_like', 100, true));
    const existingLike = (result.items || []).find(l => 
        l.objectData.post_id === postId && l.objectData.user_id === userId
    );

    if (existingLike) {
        // Unlike
        await safeDbCall(() => trickleDeleteObject('social_like', existingLike.objectId));
        return false; // Liked status: false
    } else {
        // Like
        await safeDbCall(() => trickleCreateObject('social_like', {
            post_id: postId,
            user_id: userId
        }));
        return true; // Liked status: true
    }
}