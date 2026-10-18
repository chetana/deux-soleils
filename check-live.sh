#!/bin/bash
echo "=== HTML via CF : og:image ==="
curl -s --max-time 20 "https://soleils.chetana.fr/" | grep -oE 'og:image" content="[^"]*"'
echo "=== og-2026 via CF ==="
curl -s -o /dev/null -w "HTTP %{http_code} (%{size_download} octets)\n" --max-time 20 "https://soleils.chetana.fr/og-2026.jpg"
