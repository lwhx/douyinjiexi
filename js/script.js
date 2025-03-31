// 显示调试信息
function showDebugInfo(message) {
    const debugEl = document.getElementById('debugInfo');
    debugEl.textContent = message;
    setTimeout(() => debugEl.textContent = '', 5000);
}

// 提取 URL
function extractURL(text) {
    const urlRegex = /(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*))/g;
    const matches = text.match(urlRegex);
    return matches ? matches[0] : null;
}

// 解析内容
async function parseContent() {
    showDebugInfo('开始解析流程...');
    const input = document.getElementById('urlInput');
    const url = extractURL(input.value);

    if (!url) {
        showAlert('🚨 请输入有效的链接哦～ (´•̥ ̯ •̥`)');
        return;
    }

    toggleLoading(true);

    try {
        const apiUrl = `https://api.kxzjoker.cn/api/jiexi_video?url=${encodeURIComponent(url)}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API 请求失败: ${response.status}`);
        const data = await response.json();

        if (!data || (data.success !== 200 && data.success !== true)) {
            throw new Error('API 返回数据异常');
        }

        renderContent(data.data);
        showDebugInfo('内容渲染完成');
    } catch (error) {
        showDebugInfo(`错误: ${error.message}`);
        showAlert(`❌ 发生错误: ${error.message}`);
    } finally {
        toggleLoading(false);
    }
}

// 渲染内容
function renderContent(data) {
    const contentBox = document.getElementById('contentBox');
    contentBox.innerHTML = '';

    if (data.video_url) {
        // 创建 Video.js 播放器
        const videoId = 'my-video-' + Date.now();
        contentBox.innerHTML = `
            <div class="media-card">
                <h2 style="color: #9370DB; margin-bottom: 15px;">
                    ${data.video_title || '未命名视频'}
                </h2>
                <video id="${videoId}" class="video-js" controls preload="auto" style="width: 100%;">
                    <source src="${data.video_url}" type="video/mp4">
                    <p>要观看此视频，请启用 JavaScript。</p>
                </video>
            </div>
        `;

        // 初始化 Video.js 播放器
        videojs(videoId, {
            fluid: true, // 响应式布局
            playbackRates: [0.5, 1, 1.5, 2], // 播放速度选项
            controlBar: {
                volumePanel: { inline: false },
                pictureInPictureToggle: true
            }
        });
    }
    contentBox.style.opacity = 1;
}

// 显示提示
function showAlert(message) {
    const alert = document.createElement('div');
    alert.style.cssText = `
        position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
        background: rgba(255, 255, 255, 0.95); padding: 15px 30px;
        border-radius: 30px; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        color: #6A5ACD;
    `;
    alert.innerHTML = message;
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 3000);
}

// 切换加载动画
function toggleLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
}
