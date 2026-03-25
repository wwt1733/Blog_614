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


        // 检查登录状态 - 调用后端API
        async function checkLoginStatus() {
            try {
                const response = await fetch('/api/current_user');
                const data = await response.json();

                const userDisplay = document.getElementById('userDisplay');

                if (data.is_logged_in && userDisplay) {
                    // 已登录，显示用户信息
                    if (data.user.avatar) {
                        userDisplay.innerHTML = `<img src="${data.user.avatar}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover; margin-right: 8px;"> ${data.user.username}`;
                    } else {
                        userDisplay.innerHTML = `<span>👤</span> ${data.user.username}`;
                    }
                    userDisplay.style.display = 'flex';
                    userDisplay.style.cursor = 'pointer';

                    // 添加点击退出功能（可选）
                    userDisplay.onclick = () => {
                        if (confirm('确定要退出登录吗？')) {
                            window.location.href = '/logout';
                        }
                    };
                } else if (userDisplay) {
                    // 未登录
                    const currentPage = window.location.pathname;
                    if (!currentPage.includes('login') && !currentPage.includes('register')) {
                        userDisplay.innerHTML = '<span>👤</span> 访客';
                        userDisplay.style.display = 'flex';
                        userDisplay.style.cursor = 'pointer';
                        userDisplay.onclick = () => {
                            window.location.href = '/login';
                        };
                    } else {
                        userDisplay.style.display = 'none';
                    }
                }
            } catch (error) {
                console.error('检查登录状态失败:', error);
            }
        }

        // 删除原有的 getCurrentUser 和 updateUserDisplay 函数
        // 因为现在直接从后端获取用户信息

        // 更新导航栏激活状态（修改一下）
        function setActiveNav(currentPage) {
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.classList.remove('active');
            });

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

        // 修改 DOMContentLoaded 事件
        document.addEventListener('DOMContentLoaded', function() {
            // 获取当前路径
            let path = window.location.pathname;
            if (path.startsWith('/')) {
                path = path.substring(1);
            }
            const page = path || 'index';

            setActiveNav(page);
            checkLoginStatus();
            setupConfirmButtons();
        });

// 处理登录
function handleLogin() {
    const username = document.getElementById('username')?.value;
    const password = document.getElementById('password')?.value;

    if (!username || !password) {
        alert('请输入用户名和密码');
        return;
    }

    // 获取用户列表
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // 查找用户
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // 登录成功
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify({
            username: user.username,
            avatar: user.avatar
        }));
        alert(`欢迎回来，${user.username}！`);
        window.location.href = 'index.html';
    } else {
        // 登录失败
        const userExists = users.some(u => u.username === username);
        if (userExists) {
            alert('密码错误，请重试');
        } else {
            alert('用户名不存在，请先注册');
        }
    }
}





// 退出登录
function handleLogout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    alert('已退出登录');
    window.location.href = 'login.html';
}

// 在页面加载时更新用户显示
document.addEventListener('DOMContentLoaded', function() {
    updateUserDisplay();
    // ... 其他初始化代码
});

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