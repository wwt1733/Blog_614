// 主入口文件 - 导入各模块功能
import { initNavigation, setActiveNav, updateUserDisplay } from './modules/nav.js';
import { login, register, logout, getCurrentUser } from './modules/auth.js';
import {
    publishPost, getPosts, getPost,
    viewPost, handleEditPost, handleDeletePost
} from './modules/blog.js';
import {
    addTag, initTagInput, setupConfirmButtons,
    showMessage, showLoading, hideLoading
} from './modules/ui.js';

// 导出所有公共函数（供HTML中的内联事件使用）
window.handleLogin = async function() {
    const username = document.getElementById('username')?.value.trim();
    const password = document.getElementById('password')?.value;
    const remember = document.querySelector('input[type="checkbox"]')?.checked || false;

    if (!username || !password) {
        showMessage('请输入用户名和密码', 'error');
        return;
    }

    const result = await login(username, password, remember);

    if (result.result) {
        showMessage(`欢迎回来，${result.user.username}！`, 'info');
        setTimeout(() => {
            window.location.href = '/index';
        }, 1000);
    } else {
        showMessage(result.msg || '登录失败，请检查用户名和密码', 'error');
    }
};

window.handleRegister = async function(username, password, avatar) {
    const result = await register(username, password, avatar);
    return result;
};

window.handlePublish = async function() {
    const form= document.getElementById('publishForm');
    if(form){
        form.dispatchEvent(new Event('submit'));
    }
};

window.handleSaveDraft = function() {
    const saveBtn = document.getElementById('saveDraftBtn');
    if(saveBtn){
        saveBtn.click();
    }
};

window.viewPost = viewPost;
window.editPost = handleEditPost;
window.deletePost = handleDeletePost;
window.addTag = addTag;

// 导出模块供其他脚本使用（如果需要）
export {
    initNavigation,
    setActiveNav,
    updateUserDisplay,
    login,
    register,
    logout,
    getCurrentUser,
    publishPost,
    getPosts,
    getPost,
    viewPost,
    handleEditPost,
    handleDeletePost,
    addTag,
    initTagInput,
    setupConfirmButtons,
    showMessage,
    showLoading,
    hideLoading
};

// 页面初始化
document.addEventListener('DOMContentLoaded', async function() {
    // 初始化导航栏
    await initNavigation();

    // 初始化标签输入框
    initTagInput();

    // 设置确认按钮
    setupConfirmButtons();

    // 页面特定的初始化（根据当前页面）
    const path = window.location.pathname;

    if (path.includes('register')) {
        // 注册页面初始化
        initRegisterPage();
    } else if (path.includes('pub')) {
        // 发布页面初始化
        initPublishPage();
    } else if (path.includes('profile')) {
        // 个人主页初始化
        initProfilePage();
    } else if (path === '/' || path === '/index') {
        // 首页初始化
        initHomePage();
    }
});

// 注册页面初始化
function initRegisterPage() {
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

        const result = await register(username, password, selectedAvatar);

        if (result.result) {
            if (successMessage) successMessage.classList.add('show');
            submitBtn.textContent = '注册成功，正在跳转...';

            setTimeout(() => {
                window.location.href = '/login?registered=true';
            }, 2000);
        } else {
            showMessage(result.msg || '注册失败，请重试', 'error');
            hideLoading(submitBtn);
            submitBtn.textContent = '注册新账号';
        }
    });
}

// 发布页面初始化
function initPublishPage() {
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

        const result = await publishPost(title, content, category, picture);

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
function initProfilePage() {
    loadUserPosts();
    loadUserInfo();
}

// 加载用户信息
async function loadUserInfo() {
    const { getCurrentUser } = await import('./modules/auth.js');
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

// HTML 转义函数，防止 XSS 攻击
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
function initHomePage() {
    // 首页的特定初始化逻辑
}