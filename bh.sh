#!/bin/bash

cd ~/domains
mkdir -p nezhav1
cd nezhav1

if [ -f nezhav1 ]; then
    echo "nezhav1 已存在，跳过下载。"
else
    wget https://github.com/nezhahq/agent/releases/download/v1.7.3/nezha-agent_freebsd_amd64.zip >/dev/null 2>&1
    unzip nezha-agent_freebsd_amd64.zip >/dev/null 2>&1
    mv nezha-agent nezhav1
    chmod 755 nezhav1
    echo "下载成功"
fi

config_file="config.yml"

if [ -f "$config_file" ]; then
    echo "$config_file 已存在。"
else
    read -p "请直接输入后台复制的命令: " USER_INPUT

    if [[ $USER_INPUT =~ NZ_SERVER=([^ ]+) ]]; then
        NZ_SERVER="${BASH_REMATCH[1]}"
    fi
    if [[ $USER_INPUT =~ NZ_TLS=([^ ]+) ]]; then
        NZ_TLS="${BASH_REMATCH[1]}"
    fi
    if [[ $USER_INPUT =~ NZ_CLIENT_SECRET=([^ ]+) ]]; then
        NZ_CLIENT_SECRET="${BASH_REMATCH[1]}"
    fi

    if [ -z "$NZ_CLIENT_SECRET" ] || [ -z "$NZ_SERVER" ]; then
        echo "缺少必要的环境变量: NZ_CLIENT_SECRET 或 NZ_SERVER"
        return
    fi

    cat <<EOL > "$config_file"
client_secret: $NZ_CLIENT_SECRET
debug: false
disable_auto_update: true
disable_command_execute: false
disable_force_update: false
disable_nat: false
disable_send_query: false
gpu: false
insecure_tls: false
ip_report_period: 1800
report_delay: 1
server: $NZ_SERVER
skip_connection_count: false
skip_procs_count: false
temperature: false
tls: $NZ_TLS
use_gitee_to_upgrade: false
use_ipv6_country_code: false
uuid: $(uuidgen)
EOL
fi

# 检查并创建 restart.sh
restart_file="restart.sh"
if [ -f "$restart_file" ]; then
    echo "$restart_file 已存在，跳过创建。"
else
    cat <<EOL > "$restart_file"
#!/bin/bash

# 设置脚本路径
SCRIPT_PATH="domains/nezhav1/start.sh"
WORK_DIR="domains/nezhav1"

# 检查指定端口是否在使用
if ! sockstat -4 -l | grep -q ":$PORT"
then
    # 如果端口没有被占用，则重新启动脚本
    cd "\$WORK_DIR"
    nohup ./start.sh > /dev/null 2>&1 &
    echo "Restarted start.sh at \$(date)" >> "\$WORK_DIR/restart_log.txt"
fi
EOL
    chmod +x "$restart_file"
    echo "已创建 $restart_file"
fi

# 检查并创建 start.sh
start_file="start.sh"
if [ -f "$start_file" ]; then
    echo "$start_file 已存在，跳过创建。"
else
    cat <<EOL > "$start_file"
#!/bin/bash
cd
cd
cd serv00-play/alist/
nohup ./alist server >/dev/null 2>&1 &

cd
cd

cd XrayR/
nohup ./XrayR --config config.yml > xrayr.log 2>&1 & 

cd
cd

cd domains/nezhav1/
chmod +x nezhav1
chmod +x restart.sh start.sh
nohup ./nezhav1 -c config.yml >/dev/null 2>&1 &

cd
EOL
    chmod +x "$start_file"
    echo "已创建 $start_file"
fi

rm -rf nezha-agent_freebsd_amd64.zip
pkill -f nezhav1
sleep 2
chmod +x nezhav1
chmod +x restart.sh start.sh
nohup ./nezhav1 -c config.yml >/dev/null 2>&1 &

cd
cd
cd serv00-play/alist/
nohup ./alist server >/dev/null 2>&1 &

echo "哪吒监控agent启动完成，restart.sh运行成功"
