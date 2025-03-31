// 调试信息显示
let debugTimer;
function showDebugInfo(message) {
    const debugEl = document.getElementById('debugInfo');
    debugEl.textContent = message;
    clearTimeout(debugTimer);
    debugTimer = setTimeout(() => debugEl.textContent = '', 5000);
}

// URL 提取
function extractURL(text) {
    try {
        const urlRegex = /(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*))/g;
        const matches = text.match(urlRegex);
        return matches ? matches[0] : null;
    } catch (e) {
        console.error('URL提取错误:', e);
        return null;
    }
}

// 解析内容
async function parseContent() {
    showDebugInfo('开始解析流程...');
    
    try {
        const input = document.getElementById('urlInput');
        if (!input) throw new Error('找不到输入框元素');
        
        const url = extractURL(input.value);
        showDebugInfo(`提取到URL: ${url || '无'}`);

        if (!url) {
            showAlert('🚨 请输入有效的链接哦～ (´•̥ ̯ •̥`)');
            return;
        }

        toggleLoading(true);
        
        showDebugInfo(`正在请求API: ${url}`);
        const apiUrl = `https://api.kxzjoker.cn/api/jiexi_video?url=${encodeURIComponent(url)}`;
        const response = await fetch(apiUrl);
        showDebugInfo(`收到响应状态: ${response.status}`);

        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        showDebugInfo(`API响应数据: ${JSON.stringify(data).slice(0, 100)}...`);

        if (!data || (data.success !== 200 && data.success !== true)) {
            throw new Error('API返回数据格式异常');
        }

        renderContent(data.data);
        showDebugInfo('内容渲染完成');
    } catch (error) {
        console.error('解析流程错误:', error);
        showDebugInfo(`错误: ${error.message}`);
        showAlert(`❌ 发生错误: ${error.message}`);
    } finally {
        toggleLoading(false);
    }
}

// 渲染内容（使用 Plyr 播放器）
function renderContent(data) {
    const contentBox = document.getElementById('contentBox');
    if (!contentBox) {
        throw new Error('找不到内容容器');
    }

    contentBox.innerHTML = '';
    
    try {
        if (data.images) {
            const galleryHTML = data.images.map((img, index) => `
                <div class="gallery-item" onclick="showFullImage('${img}')">
                    <img src="${img}" 
                         alt="图集 ${index + 1}"
                         loading="lazy"
                         style="border-radius: 10px; 
                                width: 100%; 
                                aspect-ratio: 1/1; 
                                object-fit: cover;
                                cursor: zoom-in;">
                    <div class="image-index">${index + 1}</div>
                </div>
            `).join('');

            contentBox.innerHTML = `
                <div class="media-card">
                    <h2 style="color: #9370DB; margin-bottom: 15px;">
                        ${data.title || '未命名图集'}
                    </h2>
                    <div style="display: grid; 
                              gap: 10px; 
                              grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));">
                        ${galleryHTML}
                    </div>
                </div>
            `;
        } else if (data.video_url) {
            contentBox.innerHTML = `
                <div class="media-card">
                    <h2 style="color: #9370DB; margin-bottom: 15px;">
                        ${data.video_title || '未命名视频'}
                    </h2>
                    <div style="position: relative; padding-top: 56.25%;">
                        <video id="player" playsinline controls>
                            <source src="${data.video_url}" type="video/mp4">
                            您的浏览器不支持视频播放
                        </video>
                    </div>
                    <div style="margin-top: 15px; text-align: center;">
                        <a href="${data.download_url}" 
                           style="display: inline-flex;
                                  align-items: center;
                                  padding: 12px 25px;
                                  background: #FFA1C9;
                                  color: white;
                                  border-radius: 25px;
                                  text-decoration: none;
                                  gap: 8px;">
                            <i class="fas fa-download"></i>
                            保存视频 (${(data.video_size || 0).toFixed(1)}MB)
                        </a>
                    </div>
                </div>
            `;
            // 初始化 Plyr 播放器
            const player = new Plyr('#player', {
                controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'],
                settings: ['quality', 'speed'],
                quality: { default: 720, options: [1080, 720, 480, 360] }
            });
        }
        contentBox.style.opacity = 1;
    } catch (e) {
        console.error('渲染错误:', e);
        showAlert('内容渲染失败，请检查数据格式');
    }
}

// 显示完整图片
function showFullImage(url) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        cursor: zoom-out;
    `;
    
    const img = document.createElement('img');
    img.src = url;
    img.style.maxWidth = '90%';
    img.style.maxHeight = '90%';
    img.style.borderRadius = '10px';
    
    overlay.onclick = () => overlay.remove();
    overlay.appendChild(img);
    document.body.appendChild(overlay);
}

// 工具函数
function toggleLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
}

function showAlert(message) {
    const alert = document.createElement('div');
    alert.style.position = 'fixed';
    alert.style.bottom = '30px';
    alert.style.left = '50%';
    alert.style.transform = 'translateX(-50%)';
    alert.style.background = 'rgba(255, 255, 255, 0.95)';
    alert.style.padding = '15px 30px';
    alert.style.borderRadius = '30px';
    alert.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
    alert.style.color = '#6A5ACD';
    alert.innerHTML = message;
    
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 3000);
}

// 确保按钮点击事件绑定（防止重复绑定问题）
document.addEventListener('DOMContentLoaded', () => {
    const parseBtn = document.querySelector('.parse-btn');
    if (parseBtn) {
        parseBtn.addEventListener('click', parseContent);
        parseBtn.addEventListener('touchend', parseContent);
    }
});
