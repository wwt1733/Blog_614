// ===== 导航栏激活状态管理 =====
document.addEventListener('DOMContentLoaded', function() {
    // 获取当前页面的文件名
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';

    // 设置导航栏激活状态
    setActiveNav(page);

    // 检查登录状态并更新用户标签显示
    checkLoginStatus();

    // 为所有带data-confirm属性的按钮添加确认框
    setupConfirmButtons();
});

// 设置导航栏激活状态
function setActiveNav(currentPage) {
    // 移除所有导航链接的active类
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });

    // 根据当前页面激活对应的导航链接
    switch(currentPage) {
        case 'index.html':
            document.getElementById('nav-home')?.classList.add('active');
            break;
        case 'login.html':
            document.getElementById('nav-login')?.classList.add('active');
            break;
        case 'publish.html':
            document.getElementById('nav-publish')?.classList.add('active');
            break;
        case 'profile.html':
            document.getElementById('nav-profile')?.classList.add('active');
            break;
    }
}

// 检查登录状态（模拟）
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userDisplay = document.getElementById('userDisplay');

    if (userDisplay) {
        if (isLoggedIn) {
            userDisplay.style.display = 'flex';
        } else {
            // 如果在非登录页面且未登录，显示访客模式
            const currentPage = window.location.pathname.split('/').pop();
            if (currentPage !== 'login.html') {
                userDisplay.style.display = 'flex';
                userDisplay.innerHTML = '<span>👤</span> 访客';
            } else {
                userDisplay.style.display = 'none';
            }
        }
    }
}

// 处理登录
function handleLogin() {
    // 模拟登录成功
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', '墨客');
    alert('登录成功！');
    window.location.href = 'index.html';
}

// 处理登出
function handleLogout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    alert('已退出登录');
    window.location.href = 'login.html';
}

// 处理发布文章
function handlePublish() {
    alert('发布成功！');
    window.location.href = 'index.html';
}

// 处理保存草稿
function handleSaveDraft() {
    alert('草稿已保存');
}

// 处理文章点击
function viewPost(postTitle) {
    alert(`进入文章: ${postTitle}`);
}

// 处理编辑文章
function editPost(event, postTitle) {
    event.stopPropagation();
    alert(`编辑文章: ${postTitle}`);
}

// 处理删除文章
function deletePost(event, postTitle) {
    event.stopPropagation();
    if (confirm(`确定要删除《${postTitle}》吗？`)) {
        alert('文章已删除（演示）');
    }
}

// 设置确认按钮
function setupConfirmButtons() {
    document.querySelectorAll('[data-confirm]').forEach(button => {
        button.addEventListener('click', function(e) {
            if (!confirm(this.getAttribute('data-confirm'))) {
                e.preventDefault();
            }
        });
    });
}

// 添加新标签（用于发布页）
function addTag(input) {
    if (input.value && input.value.trim()) {
        const tagText = input.value.trim();
        const tagContainer = input.parentElement;
        const newTag = document.createElement('span');
        newTag.className = 'tag';
        newTag.innerHTML = `${tagText} ✕`;
        newTag.onclick = function() { this.remove(); };

        // 在input之前插入新标签
        tagContainer.insertBefore(newTag, input);
        input.value = '';
    }
}

// 处理标签输入框的回车键
document.addEventListener('keypress', function(e) {
    if (e.target.classList.contains('tag-input-field')) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag(e.target);
        }
    }
});