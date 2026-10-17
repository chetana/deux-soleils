#!/bin/bash
curl -sk -o /dev/null -w "ORIGINE og-2026: %{http_code} (%{size_download} octets)\n" --max-time 20 --resolve "soleils.chetana.fr:443:163.172.7.239" "https://soleils.chetana.fr/og-2026.jpg"
