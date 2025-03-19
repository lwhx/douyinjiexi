#!/bin/bash

cd serv00-play
mkdir -p start.sh
cd serv00-play/alist/

if [ -f start.sh ]; then
    echo "start.sh 已存在，跳过下载。"
else
    wget https://github.com/nezhahq/agent/releases/download/v1.7.3/nezha-agent_freebsd_amd64.zip >/dev/null 2>&1
    unzip nezha-agent_freebsd_amd64.zip >/dev/null 2>&1
    mv start.sh
    chmod 755 start.sh
    echo "下载成功"
fi

pkill -f start.sh
sleep 2
chmod +x start.sh
serv00-play/alist/start.sh

echo "agent启动完成"
