import { getCurrentUser, logout } from './auth.js';

// 设置导航栏激活状态
export function setActiveNav(currentPage) {
    // 移除所有导航链接的active类
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });

    // 根据当前页面激活对应的导航链接
    switch(currentPage) {
        case '':
        case '/':
        case 'index':
        case 'index.html':
            document.getElementById('nav-home')?.classList.add('active');
            break;
        case 'login':
        case 'login.html':
            document.getElementById('nav-login')?.classList.add('active');
            break;
        case 'pub':
        case 'publish.html':
            document.getElementById('nav-publish')?.classList.add('active');
            break;
        case 'profile':
        case 'profile.html':
            document.getElementById('nav-profile')?.classList.add('active');
            break;
    }
}

// 更新用户显示区域
export async function updateUserDisplay() {
    const userDisplay = document.getElementById('userDisplay');
    if (!userDisplay) return;

    const data = await getCurrentUser();
    const currentPage = window.location.pathname;
    const isAuthPage = currentPage.includes('login') || currentPage.includes('register');

    if (data.is_logged_in) {
        // 已登录，显示用户信息
        if (data.user.avatar) {
            userDisplay.innerHTML = `<img src="${data.user.avatar}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover; margin-right: 8px;"> ${data.user.username}`;
        } else {
            userDisplay.innerHTML = `<span>👤</span> ${data.user.username}`;
        }
        userDisplay.style.display = 'flex';
        userDisplay.style.cursor = 'pointer';

        // 点击用户标签显示菜单
        userDisplay.onclick = () => {
            if (confirm('确定要退出登录吗？')) {
                logout();
            }
        };
    } else if (!isAuthPage) {
        // 未登录且在非认证页面，显示访客模式
        userDisplay.innerHTML = '<span>👤</span> 访客';
        userDisplay.style.display = 'flex';
        userDisplay.style.cursor = 'pointer';
        userDisplay.onclick = () => {
            window.location.href = '/login';
        };
    } else {
        // 在登录/注册页面，隐藏用户标签
        userDisplay.style.display = 'none';
    }
}

// 检查登录状态并更新UI（页面初始化时调用）
export async function initNavigation() {
    // 获取当前路径
    let path = window.location.pathname;
    if (path.startsWith('/')) {
        path = path.substring(1);
    }
    const page = path || 'index';

    setActiveNav(page);
    await updateUserDisplay();
}