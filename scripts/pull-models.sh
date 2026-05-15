#!/usr/bin/env bash
###############################################################################
# pull-models.sh — descarga los modelos Ollama recomendados para el laboratorio.
# Se ejecuta en el HOST (no dentro de Docker) porque Ollama corre allí.
###############################################################################
set -euo pipefail

MODELS=(
  "llama3.1:8b"        # general-purpose, modelo por defecto del lab
  "qwen2.5-coder:7b"   # análisis de código y payloads
  "deepseek-r1:7b"     # razonamiento con reasoning_content
)

if ! command -v ollama >/dev/null 2>&1; then
  echo "Ollama no está instalado en este host. Descárgalo desde https://ollama.com/download" >&2
  exit 1
fi

for m in "${MODELS[@]}"; do
  echo "==> ollama pull ${m}"
  ollama pull "${m}"
done

echo "Listo. Modelos disponibles:"
ollama list
