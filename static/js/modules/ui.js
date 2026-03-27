// UI通用功能：标签管理、确认框、提示等

// 添加新标签（用于发布页）
export function addTag(input) {
    if (input.value && input.value.trim()) {
        const tagText = input.value.trim();
        const tagContainer = input.parentElement;
        const newTag = document.createElement('span');
        newTag.className = 'tag';
        newTag.innerHTML = `${tagText} ✕`;
        newTag.onclick = function() {
            this.remove();
        };

        // 在input之前插入新标签
        tagContainer.insertBefore(newTag, input);
        input.value = '';
    }
}

// 初始化标签输入框
export function initTagInput() {
    document.addEventListener('keypress', function(e) {
        if (e.target.classList.contains('tag-input-field')) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTag(e.target);
            }
        }
    });
}

// 设置确认按钮（带data-confirm属性的按钮）
export function setupConfirmButtons() {
    document.querySelectorAll('[data-confirm]').forEach(button => {
        // 移除已有的事件监听器（避免重复）
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        newButton.addEventListener('click', function(e) {
            const message = this.getAttribute('data-confirm');
            if (!confirm(message)) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    });
}

// 显示提示消息（临时消息）
export function showMessage(message, type = 'info', duration = 3000) {
    // 创建消息元素
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background-color: ${type === 'error' ? '#ff6b6b' : '#51cf66'};
        color: white;
        border-radius: 8px;
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(messageDiv);

    // 自动移除
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            messageDiv.remove();
        }, 300);
    }, duration);
}

// 显示加载状态
export function showLoading(element, text = '加载中...') {
    if (element) {
        const originalText = element.textContent;
        element.setAttribute('data-original-text', originalText);
        element.textContent = text;
        element.disabled = true;
    }
}

// 隐藏加载状态
export function hideLoading(element) {
    if (element) {
        const originalText = element.getAttribute('data-original-text');
        if (originalText) {
            element.textContent = originalText;
            element.removeAttribute('data-original-text');
        }
        element.disabled = false;
    }
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);