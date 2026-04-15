// 页面特定功能模块
import { showMessage, showLoading, hideLoading } from './ui.js';
import { getCurrentUser } from './auth.js';
import { publishPost, saveDraft, getPosts, getPost, deletePost } from './blog.js';

// 登录页面初始化
export function initLoginPage() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('registered') === 'true') {
        alert('注册成功！请使用你的账号登录');
    }

    // 登录处理函数
    window.handleLogin = async function() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const remember = document.querySelector('input[type="checkbox"]').checked;

        if (!username || !password) {
            alert('请输入用户名和密码');
            return;
        }

        try {
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);
            formData.append('remember', remember);

            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData
            });

            const data = await response.json();

            if (data.result) {
                alert(`欢迎回来，${data.user.username}！`);
                window.location.href = '/index';
            } else {
                alert(data.msg || '登录失败，请检查用户名和密码');
            }
        } catch (error) {
            console.error('登录失败:', error);
            alert('网络错误，请稍后重试');
        }
    };
}

// 注册页面初始化
export function initRegisterPage() {
    const form = document.getElementById('registerForm');
    if (!form) return;

    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirmPassword');
    const avatarInput = document.getElementById('avatarInput');
    const avatarPreview = document.getElementById('avatarPreview');
    const successMessage = document.getElementById('successMessage');
    const usernameError = document.getElementById('usernameError');
    const passwordError = document.getElementById('passwordError');
    const confirmError = document.getElementById('confirmError');

    let selectedAvatar = null;

    // 头像上传预览
    if (avatarInput) {
        avatarInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                if (!file.type.match('image/jpeg') && !file.type.match('image/png') && !file.type.match('image/gif')) {
                    showMessage('只支持 JPG、PNG、GIF 格式的图片', 'error');
                    avatarInput.value = '';
                    return;
                }

                if (file.size > 2 * 1024 * 1024) {
                    showMessage('图片大小不能超过 2MB', 'error');
                    avatarInput.value = '';
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(e) {
                    selectedAvatar = e.target.result;
                    if (avatarPreview) {
                        avatarPreview.innerHTML = `<img src="${selectedAvatar}" alt="头像">`;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 清除头像函数
    window.clearAvatar = function() {
        selectedAvatar = null;
        if (avatarInput) avatarInput.value = '';
        if (avatarPreview) avatarPreview.innerHTML = '<div class="default-avatar">✧</div>';
    };

    // 验证表单
    function validateForm() {
        let isValid = true;

        const username = usernameInput?.value.trim() || '';
        const password = passwordInput?.value || '';
        const confirm = confirmInput?.value || '';

        // 清除之前的错误
        if (usernameError) usernameError.classList.remove('show');
        if (passwordError) passwordError.classList.remove('show');
        if (confirmError) confirmError.classList.remove('show');

        if (!username) {
            if (usernameError) {
                usernameError.textContent = '请输入用户名';
                usernameError.classList.add('show');
            }
            isValid = false;
        } else if (username.length < 3 || username.length > 20) {
            if (usernameError) {
                usernameError.textContent = '用户名长度必须在3-20个字符之间';
                usernameError.classList.add('show');
            }
            isValid = false;
        }

        if (!password) {
            if (passwordError) {
                passwordError.textContent = '请输入密码';
                passwordError.classList.add('show');
            }
            isValid = false;
        } else if (password.length < 6) {
            if (passwordError) {
                passwordError.textContent = '密码长度至少为6位';
                passwordError.classList.add('show');
            }
            isValid = false;
        }

        if (!confirm) {
            if (confirmError) {
                confirmError.textContent = '请确认密码';
                confirmError.classList.add('show');
            }
            isValid = false;
        } else if (password !== confirm) {
            if (confirmError) {
                confirmError.textContent = '两次输入的密码不一致';
                confirmError.classList.add('show');
            }
            isValid = false;
        }

        return isValid;
    }

    // 表单提交
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        const submitBtn = form.querySelector('.login-btn');

        showLoading(submitBtn, '注册中...');

        try {
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);
            if (selectedAvatar) {
                formData.append('avatar', selectedAvatar);
            }

            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData
            });

            const data = await response.json();

            if (data.result) {
                if (successMessage) successMessage.classList.add('show');
                submitBtn.textContent = '注册成功，正在跳转...';

                setTimeout(() => {
                    window.location.href = '/login?registered=true';
                }, 2000);
            } else {
                showMessage(data.msg || '注册失败，请重试', 'error');
                hideLoading(submitBtn);
                submitBtn.textContent = '注册新账号';
            }
        } catch (error) {
            console.error('注册失败:', error);
            showMessage('网络错误，请稍后重试', 'error');
            hideLoading(submitBtn);
            submitBtn.textContent = '注册新账号';
        }
    });
}

// 发布页面初始化
export function initPublishPage() {
    const form = document.getElementById('publishForm');
    if (!form) return;

    const titleInput = document.getElementById('title');
    const categoryInput = document.getElementById('category');
    const pictureInput = document.getElementById('picture');
    const contentTextarea = document.getElementById('content');
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    const successMessage = document.getElementById('successMessage');

    const titleError = document.getElementById('titleError');
    const categoryError = document.getElementById('categoryError');
    const contentError = document.getElementById('contentError');

    // 清除错误提示
    function clearErrors() {
        if (titleError) titleError.classList.remove('show');
        if (categoryError) categoryError.classList.remove('show');
        if (contentError) contentError.classList.remove('show');
    }

    // 显示错误信息
    function showError(element, message) {
        if (element) {
            element.textContent = message;
            element.classList.add('show');
        }
    }

    // 验证表单
    function validateForm() {
        let isValid = true;
        clearErrors();

        const title = titleInput?.value.trim() || '';
        const category = categoryInput?.value.trim() || '';
        const content = contentTextarea?.value.trim() || '';

        if (!title) {
            showError(titleError, '请输入文章标题');
            isValid = false;
        } else if (title.length > 100) {
            showError(titleError, '标题不能超过100个字符');
            isValid = false;
        }

        if (!category) {
            showError(categoryError, '请输入文章分类');
            isValid = false;
        } else if (category.length > 100) {
            showError(categoryError, '分类名称不能超过100个字符');
            isValid = false;
        }

        if (!content) {
            showError(contentError, '请输入文章内容');
            isValid = false;
        }

        return isValid;
    }

    // 发布文章
    async function handlePublishSubmit(event) {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        const title = titleInput.value.trim();
        const category = categoryInput.value.trim();
        const picture = pictureInput?.value.trim() || '';
        const content = contentTextarea.value.trim();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = '发布中...';

        const result = await publishPost(title, content, category, [], picture);

        if (result.result) {
            if (successMessage) successMessage.classList.add('show');
            submitBtn.textContent = '发布成功！';

            // 2秒后跳转到首页
            setTimeout(() => {
                window.location.href = '/index';
            }, 2000);
        } else {
            showMessage(result.msg || '发布失败，请重试', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    // 保存草稿
    async function handleSaveDraft() {
        const title = titleInput?.value.trim() || '';
        const category = categoryInput?.value.trim() || '';
        const picture = pictureInput?.value.trim() || '';
        const content = contentTextarea?.value.trim() || '';

        if (!title && !content) {
            showMessage('标题或内容不能都为空', 'error');
            return;
        }

        const saveBtn = saveDraftBtn;
        const originalText = saveBtn.textContent;
        saveBtn.disabled = true;
        saveBtn.textContent = '保存中...';

        const result = await saveDraft(title, content, category, picture);

        if (result.result) {
            showMessage('草稿保存成功', 'info');
        } else {
            showMessage(result.msg || '保存失败，请重试', 'error');
        }

        saveBtn.disabled = false;
        saveBtn.textContent = originalText;
    }

    // 绑定事件
    form.addEventListener('submit', handlePublishSubmit);
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', handleSaveDraft);
    }

    // 实时清除错误
    if (titleInput) {
        titleInput.addEventListener('input', () => {
            if (titleError) titleError.classList.remove('show');
        });
    }
    if (categoryInput) {
        categoryInput.addEventListener('input', () => {
            if (categoryError) categoryError.classList.remove('show');
        });
    }
    if (contentTextarea) {
        contentTextarea.addEventListener('input', () => {
            if (contentError) contentError.classList.remove('show');
        });
    }
}

// 个人主页初始化
export function initProfilePage() {
    loadUserPosts();
    loadUserInfo();
}

// 加载用户信息
async function loadUserInfo() {
    const data = await getCurrentUser();

    if (data.is_logged_in) {
        const profileName = document.getElementById('profileName');
        const profileAvatar = document.getElementById('profileAvatar');

        if (profileName) {
            profileName.textContent = data.user.username;
        }

        if (profileAvatar) {
            if (data.user.avatar) {
                profileAvatar.innerHTML = `<img src="${data.user.avatar}" alt="头像">`;
            } else {
                profileAvatar.textContent = '✧';
            }
        }
    }
}

// 加载用户文章
async function loadUserPosts() {
    const postsContainer = document.getElementById('postsContainer');

    try {
        const response = await fetch('/api/user/posts');
        const data = await response.json();

        if (!data.result) {
            postsContainer.innerHTML = `<div class="empty-posts">${data.msg || '加载失败'}</div>`;
            return;
        }

        const posts = data.posts;
        const postCount = document.getElementById('postCount');
        if (postCount) {
            postCount.textContent = posts.length;
        }

        if (posts.length === 0) {
            postsContainer.innerHTML = `
                <div class="empty-posts">
                    <p>还没有发布过文章</p>
                    <a href="/pub" style="color: var(--gold);">去发布第一篇</a>
                </div>
            `;
            return;
        }

        // 渲染文章列表
        postsContainer.innerHTML = `
            <div class="my-posts">
                ${posts.map(post => `
                    <div class="post-item" data-post-id="${post.id}">
                        <div class="post-info">
                            <h4>${escapeHtml(post.title)}</h4>
                            <div class="post-date">${post.pub_date}</div>
                        </div>
                        <div class="post-actions">
                            <button class="edit-btn" onclick="window.editPostById(${post.id})">✎ 编辑</button>
                            <button class="delete-btn" onclick="window.deletePostById(${post.id}, '${escapeHtml(post.title)}')">🗑️ 删除</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

    } catch (error) {
        console.error('加载文章失败:', error);
        postsContainer.innerHTML = '<div class="empty-posts">加载失败，请刷新页面重试</div>';
    }
}

// HTML 转义函数
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 编辑文章（全局函数）
window.editPostById = async function(postId) {
    try {
        // 获取文章详情
        const response = await fetch(`/api/post/${postId}`);
        const data = await response.json();

        if (data.result) {
            // 填充表单
            document.getElementById('editTitle').value = data.post.title;
            document.getElementById('editCategory').value = data.post.category || '';
            document.getElementById('editContent').value = data.post.content;

            // 存储当前编辑的文章ID
            window.currentEditPostId = postId;

            // 显示模态框
            document.getElementById('editModal').classList.add('show');
        } else {
            showMessage(data.msg || '获取文章失败', 'error');
        }
    } catch (error) {
        console.error('获取文章失败:', error);
        showMessage('网络错误，请稍后重试', 'error');
    }
};

// 关闭编辑模态框
window.closeEditModal = function() {
    document.getElementById('editModal').classList.remove('show');
    window.currentEditPostId = null;
};

// 保存编辑
async function saveEditPost(event) {
    event.preventDefault();

    const postId = window.currentEditPostId;
    if (!postId) return;

    const title = document.getElementById('editTitle').value.trim();
    const category = document.getElementById('editCategory').value.trim();
    const content = document.getElementById('editContent').value.trim();

    if (!title || !content) {
        showMessage('标题和内容不能为空', 'error');
        return;
    }

    const submitBtn = document.querySelector('#editForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '保存中...';

    try {
        const response = await fetch(`/api/post/${postId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: title,
                content: content,
                category: category
            })
        });

        const data = await response.json();

        if (data.result) {
            showMessage('文章更新成功', 'info');
            closeEditModal();
            loadUserPosts();  // 刷新文章列表
        } else {
            showMessage(data.msg || '更新失败', 'error');
        }
    } catch (error) {
        console.error('更新失败:', error);
        showMessage('网络错误，请稍后重试', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// 删除文章（全局函数）
window.deletePostById = async function(postId, postTitle) {
    if (!confirm(`确定要删除《${postTitle}》吗？此操作不可恢复。`)) {
        return;
    }

    try {
        const response = await fetch(`/api/post/${postId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.result) {
            showMessage('文章已删除', 'info');
            loadUserPosts();  // 刷新文章列表
        } else {
            showMessage(data.msg || '删除失败', 'error');
        }
    } catch (error) {
        console.error('删除失败:', error);
        showMessage('网络错误，请稍后重试', 'error');
    }
};

// 绑定编辑表单提交事件
document.addEventListener('DOMContentLoaded', function() {
    const editForm = document.getElementById('editForm');
    if (editForm) {
        editForm.addEventListener('submit', saveEditPost);
    }
});

// 首页初始化
let currentPage = 1;
let totalPages = 1;
let isLoading = false;

export function initHomePage() {
    currentPage = 1;
    loadPosts();
}

// 加载文章列表
async function loadPosts(append = false) {
    if (isLoading) return;

    isLoading = true;
    const postsGrid = document.getElementById('postsGrid');
    const loadMoreContainer = document.getElementById('loadMoreContainer');

    if (!append) {
        postsGrid.innerHTML = '<div class="loading-spinner">加载中</div>';
    }

    try {
        const response = await fetch(`/api/posts?page=${currentPage}&per_page=6`);
        const data = await response.json();

        if (!data.result) {
            postsGrid.innerHTML = `<div class="empty-posts">${data.msg || '加载失败'}</div>`;
            return;
        }

        const posts = data.posts;
        totalPages = data.pages;

        if (posts.length === 0 && !append) {
            postsGrid.innerHTML = `
                <div class="empty-posts">
                    <p>还没有文章</p>
                    <a href="/pub">发布第一篇</a>
                </div>
            `;
            loadMoreContainer.style.display = 'none';
            return;
        }

        // 渲染文章卡片
        const postsHtml = posts.map(post => `
            <div class="post-card" onclick="viewPostDetail(${post.id})">
                <div class="post-image">${getPostIcon(post.picture)}</div>
                <div class="post-content">
                    <div class="post-meta">
                        <span>${escapeHtml(post.category)}</span>
                        <span>${post.pub_date}</span>
                    </div>
                    <h3>${escapeHtml(post.title)}</h3>
                    <p>${escapeHtml(post.content)}</p>
                    <span class="read-more">阅读全文 →</span>
                </div>
            </div>
        `).join('');

        if (append) {
            postsGrid.insertAdjacentHTML('beforeend', postsHtml);
        } else {
            postsGrid.innerHTML = postsHtml;
        }

        // 控制加载更多按钮显示
        if (currentPage < totalPages) {
            loadMoreContainer.style.display = 'block';
        } else {
            loadMoreContainer.style.display = 'none';
        }

    } catch (error) {
        console.error('加载文章失败:', error);
        postsGrid.innerHTML = '<div class="empty-posts">加载失败，请刷新页面重试</div>';
    } finally {
        isLoading = false;
    }
}

// 获取文章图标
function getPostIcon(picture) {
    // 如果 picture 是 URL，显示图片缩略图
    if (picture && (picture.startsWith('http://') || picture.startsWith('https://'))) {
        return `<img src="${picture}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`;
    }
    // 否则返回默认图标
    const icons = ['📘', '✨', '✍️', '🎨', '💡', '🚀', '⚡', '🌟'];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];
    return `<span style="font-size: 3rem;">${randomIcon}</span>`;
}

// 查看文章详情（全局函数）
window.viewPostDetail = function(postId) {
    window.location.href = `/post/${postId}`;
};

// 加载更多
function loadMorePosts() {
    if (currentPage < totalPages && !isLoading) {
        currentPage++;
        loadPosts(true);
    }
}

// 绑定加载更多按钮事件
document.addEventListener('DOMContentLoaded', function() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMorePosts);
    }
});

// 文章详情页初始化
export function initPostDetailPage() {
    const postId = window.location.pathname.split('/').pop();
    loadArticle(postId);
}

// 加载文章详情
async function loadArticle(postId) {
    const container = document.getElementById('articleContainer');

    try {
        const response = await fetch(`/api/post/${postId}`);
        const data = await response.json();

        if (!data.result) {
            container.innerHTML = `
                <div class="error-container">
                    <h2>❌ ${data.msg || '文章不存在'}</h2>
                    <p>请检查链接是否正确，或返回首页浏览其他文章。</p>
                    <button class="btn btn-gold" onclick="window.location.href='/index'">返回首页</button>
                </div>
            `;
            return;
        }

        const post = data.post;
        const currentUser = await getCurrentUser();
        const isAuthor = currentUser.is_logged_in && currentUser.user.id === post.publisher_id;

        container.innerHTML = `
            <div class="article-card">
                <div class="article-header">
                    <h1 class="article-title">${escapeHtml(post.title)}</h1>
                    <div class="article-meta">
                        <div class="article-meta-item">
                            <span>📅</span>
                            <span>${post.pub_date}</span>
                        </div>
                        ${post.category ? `
                        <div class="article-meta-item">
                            <span>🏷️</span>
                            <span class="article-category">${escapeHtml(post.category)}</span>
                        </div>
                        ` : ''}
                        <div class="article-meta-item">
                            <span>👤</span>
                            <span>${escapeHtml(post.author_name || '墨客')}</span>
                        </div>
                        <div class="article-meta-item">
                            <span>📖</span>
                            <span>${estimateReadTime(post.content)}分钟阅读</span>
                        </div>
                    </div>
                </div>

                ${post.picture ? `
                <div class="article-cover">
                    <img src="${post.picture}" alt="封面图" style="width: 100%; border-radius: 12px; margin-bottom: 30px;">
                </div>
                ` : ''}

                <div class="article-content">
                    ${formatContent(post.content)}
                </div>

                <div class="article-footer">
                    <div class="author-info">
                        <div class="author-avatar">
                            ${post.author_avatar ? `<img src="${post.author_avatar}" alt="头像">` : '✧'}
                        </div>
                        <div class="author-details">
                            <div class="author-name">${escapeHtml(post.author_name || '墨客')}</div>
                            <div class="author-bio">热爱分享，持续创作</div>
                        </div>
                    </div>

                    <div class="article-actions">
                        <button class="action-btn back" onclick="window.location.href='/index'">← 返回首页</button>
                        ${isAuthor ? `
                            <button class="action-btn edit" onclick="editArticle(${post.id})">✎ 编辑文章</button>
                            <button class="action-btn delete" onclick="deleteArticle(${post.id}, '${escapeHtml(post.title)}')">🗑️ 删除文章</button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

    } catch (error) {
        console.error('加载文章失败:', error);
        container.innerHTML = `
            <div class="error-container">
                <h2>❌ 加载失败</h2>
                <p>网络错误，请稍后重试。</p>
                <button class="btn btn-gold" onclick="window.location.href='/index'">返回首页</button>
            </div>
        `;
    }
}

// 估算阅读时间
function estimateReadTime(content) {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes || 1;
}

// 格式化内容（简单的 Markdown 支持）
function formatContent(content) {
    if (!content) return '';

    let formatted = content;
    formatted = escapeHtml(formatted);
    formatted = formatted.replace(/\n/g, '<br>');
    formatted = formatted.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    formatted = formatted.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
    formatted = formatted.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/__(.*?)__/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/_(.*?)_/g, '<em>$1</em>');
    formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color: var(--gold);">$1</a>');
    formatted = formatted.replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>');
    formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');
    formatted = formatted.replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>');
    return formatted;
}

// 编辑文章
window.editArticle = function(postId) {
    window.location.href = `/edit/${postId}`;
};

// 删除文章
window.deleteArticle = async function(postId, postTitle) {
    if (!confirm(`确定要删除《${postTitle}》吗？此操作不可恢复。`)) {
        return;
    }

    try {
        const response = await fetch(`/api/post/${postId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.result) {
            showMessage('文章已删除', 'info');
            setTimeout(() => {
                window.location.href = '/index';
            }, 1500);
        } else {
            showMessage(data.msg || '删除失败', 'error');
        }
    } catch (error) {
        console.error('删除失败:', error);
        showMessage('网络错误，请稍后重试', 'error');
    }
};