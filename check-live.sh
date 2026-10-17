#!/bin/bash
echo "== noms de clés CF dans /opt/chet/env =="
grep -ioE "^[A-Z0-9_]*(CLOUDFLARE|CF_)[A-Z0-9_]*" /opt/chet/env | sort -u
echo "== fichiers mentionnant cloudflare =="
grep -rlioE "cloudflare" /opt/chet --include="*.sh" --include="*.md" --include="*.yml" --include="*.example" 2>/dev/null | head -5
