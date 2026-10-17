#!/bin/bash
for u in "https://soleils.chetana.fr/" "https://soleils.chetana.fr/app.js" "https://soleils.chetana.fr/style.css"; do
  code=$(curl -s -o /tmp/out.bin -w "%{http_code} %{size_download}" --max-time 25 "$u")
  echo "$u -> HTTP $code"
done
echo "=== début du HTML ==="
curl -s --max-time 25 https://soleils.chetana.fr/ | head -c 250
