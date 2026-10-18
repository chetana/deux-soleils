#!/bin/bash
# Deploy deux-soleils to chetbox
set -e
SRV="root@163.172.7.239"
KEY="$HOME/.ssh/chetbox"
echo "== find remote dir =="
ssh -i "$KEY" -o BatchMode=yes "$SRV" "find / -maxdepth 4 -name 'deux-soleils' -type d 2>/dev/null; docker ps --format '{{.Names}}'"
