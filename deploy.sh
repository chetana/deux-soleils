#!/bin/bash
# Deploy deux-soleils → chetbox (site statique générique)
#   sert https://soleils.chetana.fr depuis /opt/chet/static/sites/soleils/
#   (le Caddyfile publie tout dossier de /srv/static/sites, et le monitor
#    de status.chetana.fr détecte le site automatiquement)
set -e
SRV="root@163.172.7.239"
KEY="$HOME/.ssh/chetbox"
DEST="/opt/chet/static/sites/soleils"

echo "== deploy vers $SRV:$DEST =="
ssh -i "$KEY" -o BatchMode=yes "$SRV" "mkdir -p $DEST"
for f in index.html app.js style.css sw.js manifest.json icon-192.png icon-512.png robots.txt; do
  [ -f "$f" ] && scp -q -i "$KEY" "$f" "$SRV:$DEST/" && echo "  ✓ $f"
done
echo "== ok — vérifie https://soleils.chetana.fr (cache bumpé si sw.js a changé) =="
