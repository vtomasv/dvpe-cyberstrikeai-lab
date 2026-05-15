#!/usr/bin/env bash
###############################################################################
# Entrypoint de CyberStrikeAI dentro del laboratorio.
# - Renderiza /app/config.yaml con las variables de entorno (Ollama).
# - Lanza el binario `cyberstrike-ai` en primer plano.
###############################################################################
set -euo pipefail

CONFIG_SRC="/app/config.yaml"
CONFIG_DST="/app/config.runtime.yaml"

BASE_URL="${CSAI_OPENAI_BASE_URL:-http://ollama-proxy:11434/v1}"
API_KEY="${CSAI_OPENAI_API_KEY:-ollama}"
MODEL="${CSAI_OPENAI_MODEL:-llama3.1:8b}"

# Copia + reemplazo seguro (el archivo es montado como :ro).
cp "${CONFIG_SRC}" "${CONFIG_DST}"

python3 - <<PY
import os, re, sys
path = "${CONFIG_DST}"
with open(path, "r", encoding="utf-8") as fh:
    data = fh.read()

def replace_under(section, key, value):
    global data
    pattern = re.compile(
        r"(^" + re.escape(section) + r":\s*\n(?:[ \t]+[^\n]*\n)*?[ \t]+" +
        re.escape(key) + r":\s*)([^\n#]*)",
        flags=re.MULTILINE,
    )
    if pattern.search(data):
        data = pattern.sub(lambda m: m.group(1) + repr(value), data, count=1)
    else:
        print(f"WARN: no se pudo localizar {section}.{key}", file=sys.stderr)

replace_under("openai", "base_url", "${BASE_URL}")
replace_under("openai", "api_key",  "${API_KEY}")
replace_under("openai", "model",    "${MODEL}")

with open(path, "w", encoding="utf-8") as fh:
    fh.write(data)
PY

echo "[entrypoint] CyberStrikeAI listo:"
echo "             base_url = ${BASE_URL}"
echo "             model    = ${MODEL}"
echo "             web      = http://0.0.0.0:8080"
echo "             mcp      = http://0.0.0.0:8081"

cd /app
exec /app/cyberstrike-ai -config "${CONFIG_DST}"
