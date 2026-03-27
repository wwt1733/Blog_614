// 博客相关功能：发布、编辑、删除、查看

// 发布文章
export async function publishPost(title, content, category, tags, picture = null) {
    try {
        const formData = new URLSearchParams();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('category', category);
        if (picture) {
            formData.append('picture', picture);
        }

        const response = await fetch('/pub', {
            method: 'POST',
            headers:{
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('发布失败:', error);
        return { success: false, message: '网络错误，请稍后重试' };
    }
}

// 保存草稿（可选功能）
export async function saveDraft(title, content, category, picture = null) {
    try {
        const formData = new URLSearchParams();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('category', category);
        formData.append('is_draft', 'true');
        if (picture) {
            formData.append('picture', picture);
        }

        const response = await fetch('/pub', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('保存草稿失败:', error);
        return { result: false, msg: '网络错误，请稍后重试' };
    }
}

// 获取文章列表
export async function getPosts(page = 1, category = null) {
    try {
        let url = `/api/posts?page=${page}`;
        if (category) {
            url += `&category=${category}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('获取文章列表失败:', error);
        return { posts: [], total: 0 };
    }
}

// 获取单篇文章
export async function getPost(postId) {
    try {
        const response = await fetch(`/api/post/${postId}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('获取文章失败:', error);
        return null;
    }
}

// 编辑文章
export async function editPost(postId, title, content, category, tags) {
    try {
        const response = await fetch(`/api/post/${postId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                content,
                category,
                tags
            })
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('编辑失败:', error);
        return { success: false, message: '网络错误，请稍后重试' };
    }
}

// 删除文章
export async function deletePost(postId) {
    try {
        const response = await fetch(`/api/post/${postId}`, {
            method: 'DELETE'
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('删除失败:', error);
        return { success: false, message: '网络错误，请稍后重试' };
    }
}

// 处理文章点击
export function viewPost(postId, postTitle) {
    // 跳转到文章详情页
    window.location.href = `/post/${postId}`;
}

// 处理编辑文章（带事件冒泡阻止）
export function handleEditPost(event, postId, postTitle) {
    event.stopPropagation();
    window.location.href = `/edit/${postId}`;
}

// 处理删除文章（带确认框）
export async function handleDeletePost(event, postId, postTitle) {
    event.stopPropagation();
    if (confirm(`确定要删除《${postTitle}》吗？`)) {
        const result = await deletePost(postId);
        if (result.success) {
            alert('文章已删除');
            // 刷新当前页面
            window.location.reload();
        } else {
            alert(result.message || '删除失败');
        }
    }
}