# index.html和css文件夹的css2.css
为抖音去水印下载

# 哪吒V1 部署到 serv00 
## serv00_nezha_dashboard.sh 为哪吒V1面板适应serv00部署
bash <(curl -Ls https://raw.githubusercontent.com/jc-lw/douyinjiexi/refs/heads/main/serv00_nezha_dashboard.sh)
## serv00_public.sh 为哪吒监控agent适应serv00部署
bash <(curl -Ls https://raw.githubusercontent.com/jc-lw/douyinjiexi/refs/heads/main/serv00_public.sh)

后台启动为
nohup ~/nezha/main >/dev/null 2>&1 &
