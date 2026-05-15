# =============================================================================
# CyberStrikeAI — imagen para dvpe-cyberstrikeai-lab
#
# Etapa 1: clona y compila CyberStrikeAI (Go 1.22) desde el upstream oficial
#          https://github.com/Ed1s0nZ/CyberStrikeAI (ver ARG CYBERSTRIKEAI_REF).
# Etapa 2: runtime ligero con Python (para herramientas auxiliares) y un set
#          mínimo de utilidades de red. La idea es que el agente IA actúe como
#          asistente analítico, no que reemplace a Attacker-PC en la operación.
# =============================================================================

# ---------- builder ----------
FROM golang:1.22-bookworm AS builder

ARG CYBERSTRIKEAI_REPO=https://github.com/Ed1s0nZ/CyberStrikeAI.git
ARG CYBERSTRIKEAI_REF=main

WORKDIR /src
RUN apt-get update \
 && apt-get install -y --no-install-recommends git ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# git clone --depth 1 --branch puede fallar si el ref es un commit; en ese caso
# hacemos un clone completo.
RUN git clone --depth 1 --branch "${CYBERSTRIKEAI_REF}" "${CYBERSTRIKEAI_REPO}" CyberStrikeAI \
 || git clone "${CYBERSTRIKEAI_REPO}" CyberStrikeAI

WORKDIR /src/CyberStrikeAI

ENV GOPROXY=https://proxy.golang.org,direct \
    CGO_ENABLED=0

RUN go mod download
RUN go build -trimpath -ldflags "-s -w" -o /out/cyberstrike-ai ./cmd/server

# ---------- runtime ----------
FROM debian:bookworm-slim AS runtime

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
        ca-certificates curl wget git tini \
        python3 python3-pip python3-venv \
        iputils-ping iproute2 netcat-openbsd dnsutils \
        nmap \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Binario compilado + recursos del repo. Las rutas son las que el binario
# espera relativas al cwd (web/static, web/templates, agents, roles, etc.).
COPY --from=builder /out/cyberstrike-ai             /app/cyberstrike-ai
COPY --from=builder /src/CyberStrikeAI/agents       /app/agents
COPY --from=builder /src/CyberStrikeAI/roles        /app/roles
COPY --from=builder /src/CyberStrikeAI/skills       /app/skills
COPY --from=builder /src/CyberStrikeAI/tools        /app/tools
COPY --from=builder /src/CyberStrikeAI/mcp-servers  /app/mcp-servers
COPY --from=builder /src/CyberStrikeAI/plugins      /app/plugins
COPY --from=builder /src/CyberStrikeAI/web          /app/web
COPY --from=builder /src/CyberStrikeAI/knowledge_base /app/knowledge_base
COPY --from=builder /src/CyberStrikeAI/requirements.txt /app/requirements.txt
# config.yaml original como plantilla por defecto (será sobrescrito por el
# montaje del compose con nuestra versión adaptada).
COPY --from=builder /src/CyberStrikeAI/config.yaml  /app/config.upstream.yaml

# Dependencias Python opcionales (best-effort: no bloquea la imagen si fallan).
RUN pip3 install --no-cache-dir --break-system-packages -r /app/requirements.txt || \
    echo '[warn] Algunas deps Python no se instalaron; herramientas opcionales pueden no funcionar.'

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh \
 && mkdir -p /app/data /app/tmp /app/logs

EXPOSE 8080 8081

ENTRYPOINT ["/usr/bin/tini", "--", "/app/entrypoint.sh"]
