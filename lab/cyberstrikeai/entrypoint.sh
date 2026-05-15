#!/usr/bin/env bash
###############################################################################
# Entrypoint de CyberStrikeAI dentro del laboratorio dvpe-cyberstrikeai-lab.
# - Si /app/config.yaml viene montado desde el compose, se usa esa plantilla.
# - Si no, se cae a /app/config.upstream.yaml (incluida en la imagen).
# - Se reemplazan las claves openai.{base_url,api_key,model} con las
#   variables de entorno del contenedor para apuntar a Ollama local.
# - Se lanza el binario en primer plano.
###############################################################################
set -euo pipefail

if [[ -f /app/config.yaml ]]; then
  CONFIG_SRC="/app/config.yaml"
else
  CONFIG_SRC="/app/config.upstream.yaml"
fi
CONFIG_DST="/app/config.runtime.yaml"

BASE_URL="${CSAI_OPENAI_BASE_URL:-http://ollama-proxy:11434/v1}"
API_KEY="${CSAI_OPENAI_API_KEY:-ollama}"
MODEL="${CSAI_OPENAI_MODEL:-llama3.1:8b}"

cp "${CONFIG_SRC}" "${CONFIG_DST}"

python3 - "$CONFIG_DST" "$BASE_URL" "$API_KEY" "$MODEL" <<'PY'
import re, sys

path, base_url, api_key, model = sys.argv[1:]
with open(path, "r", encoding="utf-8") as fh:
    data = fh.read()

def replace_under(section, key, value):
    """Reemplaza el primer `key:` que aparece dentro del bloque `section:`."""
    pattern = re.compile(
        r"(^" + re.escape(section) + r":\s*\n(?:[ \t]+[^\n]*\n)*?[ \t]+" +
        re.escape(key) + r":\s*)([^\n#]*)",
        flags=re.MULTILINE,
    )
    return pattern.sub(lambda m: m.group(1) + repr(value), data, count=1), pattern.search(data) is not None

for key, value in (("base_url", base_url), ("api_key", api_key), ("model", model)):
    new_data, ok = replace_under("openai", key, value)
    if ok:
        data = new_data
    else:
        print(f"[entrypoint] WARN: no se pudo localizar openai.{key}", file=sys.stderr)

with open(path, "w", encoding="utf-8") as fh:
    fh.write(data)
PY

cat <<EOF
[entrypoint] CyberStrikeAI listo:
             base_url = ${BASE_URL}
             model    = ${MODEL}
             web      = http://0.0.0.0:8080
             mcp      = http://0.0.0.0:8081
EOF

cd /app
exec /app/cyberstrike-ai -config "${CONFIG_DST}"
