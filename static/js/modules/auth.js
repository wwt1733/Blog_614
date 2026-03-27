// 认证相关功能：登录、注册、退出、获取当前用户

// 登录函数
export async function login(username, password, remember) {
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
        return data;
    } catch (error) {
        console.error('登录失败:', error);
        return { result: false, msg: '网络错误，请稍后重试' };
    }
}

// 注册函数
export async function register(username, password, avatar = null) {
    try {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);
        if (avatar) {
            formData.append('avatar', avatar);
        }

        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('注册失败:', error);
        return { result: false, msg: '网络错误，请稍后重试' };
    }
}

// 退出登录
export async function logout() {
    window.location.href = '/logout';
}

// 获取当前登录用户信息
export async function getCurrentUser() {
    try {
        const response = await fetch('/api/current_user');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('获取用户信息失败:', error);
        return { is_logged_in: false };
    }
}