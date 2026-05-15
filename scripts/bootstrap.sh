#!/usr/bin/env bash
###############################################################################
# bootstrap.sh — verifica prerrequisitos y arranca dvpe-cyberstrikeai-lab.
###############################################################################
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"

bold() { printf "\033[1m%s\033[0m\n" "$*"; }
ok()   { printf "  \033[32m✓\033[0m %s\n" "$*"; }
warn() { printf "  \033[33m!\033[0m %s\n" "$*"; }
err()  { printf "  \033[31m✗\033[0m %s\n" "$*" >&2; }

bold "==> Verificando Docker"
if ! command -v docker >/dev/null 2>&1; then
  err "Docker no está instalado. Instala Docker Desktop o Docker Engine y vuelve a intentar."
  exit 1
fi
ok "docker $(docker --version | awk '{print $3}' | tr -d ',')"

if ! docker compose version >/dev/null 2>&1; then
  err "Docker Compose v2 no está disponible (usa 'docker compose' moderno)."
  exit 1
fi
ok "$(docker compose version | head -n1)"

bold "==> Preparando .env del laboratorio"
if [[ ! -f .env ]]; then
  cp lab.env.example .env
  ok "Se creó .env a partir de lab.env.example"
else
  ok ".env ya existe (se respeta)"
fi
# shellcheck disable=SC1091
source .env

bold "==> Verificando Ollama en el host"
if curl -fsS "http://127.0.0.1:${OLLAMA_PORT:-11434}/api/tags" >/dev/null 2>&1; then
  ok "Ollama responde en el host (puerto ${OLLAMA_PORT:-11434})"
else
  warn "No se detectó Ollama en 127.0.0.1:${OLLAMA_PORT:-11434}."
  warn "Instálalo desde https://ollama.com/download y arráncalo antes de usar CyberStrikeAI."
fi

bold "==> Construyendo y levantando el laboratorio"
docker compose up -d --build

bold "==> Servicios principales"
cat <<EOF
  • Guía del alumno      → http://localhost:8088
  • CyberStrikeAI web    → http://localhost:8090   (pass: lab-cyberstrike)
  • CyberStrikeAI MCP    → http://localhost:8091/mcp
  • Attacker-PC noVNC    → http://localhost:6080
  • Attacker-PC SSH      → ssh -p 2222 root@127.0.0.1  (root:toor)
  • Jerry-PC SSH         → ssh -p 2200 root@127.0.0.1  (root:IAmJerry)
  • Server51 Maltrail    → http://localhost:8081
EOF
