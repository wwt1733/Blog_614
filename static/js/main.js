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
    // 个人主页的特定初始化逻辑
}

// 首页初始化
function initHomePage() {
    // 首页的特定初始化逻辑
}