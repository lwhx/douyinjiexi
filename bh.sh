#!/bin/bash

cd serv00-play/alist/
nohup ./alist server >/dev/null 2>&1 &

cd

cd

cd Xrayr/

nohup ./XrayR --config config.yml > xrayr.log 2>&1 & 

cd

cd
cd domains/nezhav1/

bash <(curl -Ls https://raw.githubusercontent.com/jc-lw/douyinjiexi/refs/heads/main/serv00_public.sh)
