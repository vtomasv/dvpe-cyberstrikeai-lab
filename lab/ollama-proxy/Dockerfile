# Pequeño puente TCP -> Ollama del host Docker.
# Mantiene un endpoint estable (`ollama-proxy:11434`) para CyberStrikeAI
# y elimina diferencias entre Docker Desktop y Docker Engine en Linux.
FROM alpine:3.20

RUN apk add --no-cache socat

ENV OLLAMA_HOST=host.docker.internal \
    OLLAMA_PORT=11434

EXPOSE 11434

# `fork,reuseaddr` permite múltiples conexiones simultáneas desde CyberStrikeAI.
CMD ["sh", "-c", "exec socat -d TCP-LISTEN:11434,fork,reuseaddr TCP:${OLLAMA_HOST}:${OLLAMA_PORT}"]
