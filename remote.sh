#!/bin/bash
echo "== blocs du Caddyfile =="
grep -nE '^[a-z0-9*.-]+\.(fr|com|net|io|dev)|^\*|^\{' /opt/chet/Caddyfile | head -40
echo "== grep chetana.fr =="
grep -n 'chetana.fr' /opt/chet/Caddyfile | head -30
echo "== serveur qui repond sur soleils.chetana.fr (local) =="
curl -s -H 'Host: soleils.chetana.fr' http://127.0.0.1/ -o /dev/null -w '%{http_code}\n'



