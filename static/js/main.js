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
import {
    initLoginPage, initRegisterPage, initPublishPage,
    initProfilePage, initHomePage, initPostDetailPage
} from './modules/pages.js';

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

window.viewPost = function (postId){
    window.location.href = `/post/${postId}`;
};
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

    if (path.includes('login')) {
        // 登录页面初始化
        initLoginPage();
    } else if (path.includes('register')) {
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
    } else if (path.includes('/post/')) {
        // 文章详情页初始化
        initPostDetailPage();
    }
});