#!/usr/bin/env bash
###############################################################################
# Entrypoint de CyberStrikeAI dentro del laboratorio dvpe-cyberstrikeai-lab.
# - Si /app/config.yaml viene montado desde el compose, se usa esa plantilla.
# - Si no, se cae a /app/config.upstream.yaml (incluida en la imagen).
# - Se reemplazan las claves openai.{provider,base_url,api_key,model} con las
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

PROVIDER="${CSAI_OPENAI_PROVIDER:-openai}"
BASE_URL="${CSAI_OPENAI_BASE_URL:-http://ollama-proxy:11434/v1}"
API_KEY="${CSAI_OPENAI_API_KEY:-ollama}"
MODEL="${CSAI_OPENAI_MODEL:-llama3.1:8b}"

cp "${CONFIG_SRC}" "${CONFIG_DST}"

python3 - "$CONFIG_DST" "$PROVIDER" "$BASE_URL" "$API_KEY" "$MODEL" <<'PY'
import re, sys

path, provider, base_url, api_key, model = sys.argv[1:]
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

for key, value in (("provider", provider), ("base_url", base_url), ("api_key", api_key), ("model", model)):
    new_data, ok = replace_under("openai", key, value)
    if ok:
        data = new_data
    else:
        print(f"[entrypoint] WARN: no se pudo localizar openai.{key}", file=sys.stderr)

with open(path, "w", encoding="utf-8") as fh:
    fh.write(data)
PY

python3 - <<'PY'
import os
import re
import shutil
from pathlib import Path

tools_dir = Path("/app/tools")
if not tools_dir.is_dir():
    raise SystemExit(0)

disabled = []
for path in sorted(tools_dir.glob("*.yaml")):
    data = path.read_text(encoding="utf-8")
    enabled_m = re.search(r"(?m)^enabled:\s*(true|false)\s*$", data)
    if enabled_m and enabled_m.group(1) == "false":
        continue
    command_m = re.search(r"(?m)^command:\s*['\"]?([^'\"\n]+)['\"]?\s*$", data)
    if not command_m:
        continue
    command = command_m.group(1).strip()
    if not command or command.startswith("internal:"):
        continue
    exe = command.split()[0]
    exists = os.path.exists(exe) if exe.startswith("/") else shutil.which(exe) is not None
    if exists:
        continue

    if enabled_m:
        data = data[: enabled_m.start()] + "enabled: false" + data[enabled_m.end():]
    else:
        insert_at = command_m.end()
        data = data[:insert_at] + "\nenabled: false" + data[insert_at:]
    path.write_text(data, encoding="utf-8")

    name_m = re.search(r"(?m)^name:\s*['\"]?([^'\"\n]+)['\"]?\s*$", data)
    disabled.append((name_m.group(1).strip() if name_m else path.stem, exe))

if disabled:
    print("[entrypoint] Tools deshabilitadas porque falta el ejecutable en PATH:")
    for name, exe in disabled:
        print(f"             - {name} ({exe})")
PY

cat <<EOF
[entrypoint] CyberStrikeAI listo:
             provider = ${PROVIDER}
             base_url = ${BASE_URL}
             model    = ${MODEL}
             web      = http://0.0.0.0:8080
             mcp      = http://0.0.0.0:8081
EOF

cd /app
exec /app/cyberstrike-ai -config "${CONFIG_DST}"
