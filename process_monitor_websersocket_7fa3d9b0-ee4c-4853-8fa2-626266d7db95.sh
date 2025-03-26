pid_websersocket=$(pgrep -f "websersocket_7fa3d9b0-ee4c-4853-8fa2-626266d7db95.js")
watch -n 1 ps -p $pid_websersocket -o pid,etime,%cpu,%mem,cmd