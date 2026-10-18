#!/bin/bash
# Extrait GCS_SERVICE_ACCOUNT_JSON + VERTEX_* de lys.env vers /tmp/gem.env (jamais affiché)
set -e
grep -E '^(GCS_SERVICE_ACCOUNT_JSON|VERTEX_PROJECT_ID|VERTEX_LOCATION)=' /opt/chet/env/lys.env > /tmp/gem.env
chmod 600 /tmp/gem.env
grep -oE '^[A-Za-z_]+' /tmp/gem.env

