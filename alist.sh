#!/bin/bash

cd ~/domains
mkdir -p serv00-play/alist
cd serv00-play/alist/

if [ -f nezhav1 ]; then
    echo "alist 已存在，跳过下载。"
else
    wget https://github.com/nezhahq/agent/releases/download/v1.7.3/nezha-agent_freebsd_amd64.zip >/dev/null 2>&1
    unzip nezha-agent_freebsd_amd64.zip >/dev/null 2>&1
    mv start.sh alist
    chmod 755 start.sh
    echo "下载成功"
fi

config_file="config.yml"

# 检查 config.yml 文件是否已存在
if [ -f "$config_file" ]; then
    echo "$config_file 已存在。"
else



pkill -f alist
sleep 2
chmod +x alist
nohup ./alist server >/dev/null 2>&1 &

echo "哪吒监控agent启动完成"
