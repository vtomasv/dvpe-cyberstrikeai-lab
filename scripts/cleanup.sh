#!/usr/bin/env bash
###############################################################################
# cleanup.sh — derriba el laboratorio y elimina volúmenes asociados.
###############################################################################
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"

echo "==> docker compose down -v --remove-orphans"
docker compose down -v --remove-orphans

cat <<'EOF'
Listo. Si quieres liberar también las imágenes:
  docker image prune -f
  docker builder prune -f
EOF
