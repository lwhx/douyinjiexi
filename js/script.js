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
        const response = await fetch(apiUrl, { 
            mode: 'cors',
            headers: { 'Accept': 'application/json' }
        });
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
        showAlert(`❌ 解析失败: ${error.message}，请检查链接或稍后重试`);
    } finally {
        toggleLoading(false);
    }
}

// 渲染内容
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
                         style="border-radius: 10px; width: 100%; aspect-ratio: 1/1; object-fit: cover; cursor: zoom-in;">
                    <div class="image-index">${index + 1}</div>
                </div>
            `).join('');

            contentBox.innerHTML = `
                <div class="media-card">
                    <h2 style="color: #9370DB; margin-bottom: 15px;">
                        ${data.title || '未命名图集'}
                    </h2>
                    <div style="display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));">
                        ${galleryHTML}
                    </div>
                </div>
            `;
        } else if (data.video_url) {
            // 文件名处理（保留中文、字母、数字，其他字符转下划线）
            const cleanFileName = (data.video_title || 'video')
                .replace(/[^a-zA-Z0-9\u4e00-\u9fa5_\-]/g, '_')
                .substring(0, 100);  // 限制文件名长度

            contentBox.innerHTML = `
                <div class="media-card">
                    <h2 style="color: #9370DB; margin-bottom: 15px;">
                        ${data.video_title || '未命名视频'}
                    </h2>
                    <div class="video-wrapper">
                        <video id="player" playsinline controls>
                            <source src="${data.video_url}" type="video/mp4">
                            您的浏览器不支持视频播放，请尝试下载查看。
                        </video>
                    </div>
                    <div style="margin-top: 20px; text-align: center;">
                        <a href="${data.download_url || data.video_url}" 
                           download="${cleanFileName}.mp4"
                           style="display: inline-flex; align-items: center; padding: 12px 25px; 
                                  background: #FFA1C9; color: white; border-radius: 25px; 
                                  text-decoration: none; gap: 8px;"
                           onclick="this.style.transform='scale(0.95)'">
                            <i class="fas fa-download"></i>
                            保存视频 (${(data.video_size || 0).toFixed(1)}MB)
                        </a>
                    </div>
                </div>
            `;
            
            // 初始化 Plyr 播放器
            const player = new Plyr('#player', {
                controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
                settings: ['quality', 'speed'],
                quality: { default: 720, options: [1080, 720, 480, 360] }
            });
            
            player.on('error', (event) => {
                console.error('播放器错误:', event.detail);
                showAlert('⚠️ 视频播放失败，可能由于格式不受支持或网络限制，请尝试下载');
            });
            
            player.on('ready', () => {
                showDebugInfo('播放器初始化成功');
            });
        } else {
            showAlert('⚠️ 未找到可播放的内容，请检查链接');
        }
        contentBox.classList.add('show');
    } catch (e) {
        console.error('渲染错误:', e);
        showAlert('内容渲染失败，请检查数据格式');
    }
}

// 显示完整图片
function showFullImage(url) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); display: flex; justify-content: center;
        align-items: center; z-index: 9999; cursor: zoom-out;
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
    alert.style.cssText = `
        position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
        background: rgba(255, 255, 255, 0.95); padding: 15px 30px; border-radius: 30px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2); color: #6A5ACD; z-index: 10000;
    `;
    alert.innerHTML = message;
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 4000);
}

// 事件监听
document.addEventListener('DOMContentLoaded', () => {
    const parseBtn = document.querySelector('.parse-btn');
    if (parseBtn) {
        parseBtn.addEventListener('click', parseContent);
        parseBtn.addEventListener('touchend', parseContent);
    }
});
