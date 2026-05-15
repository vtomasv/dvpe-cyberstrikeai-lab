# =============================================================================
# CyberStrikeAI — imagen para dvpe-cyberstrikeai-lab
#
# Etapa 1: clona y compila CyberStrikeAI (Go 1.22).
# Etapa 2: runtime ligero con Python para herramientas auxiliares y un set
#          mínimo de utilidades de red. La idea es que el agente IA actúe como
#          asistente, no que sustituya a Attacker-PC en operaciones ofensivas.
# =============================================================================

# ---------- builder ----------
FROM golang:1.22-bookworm AS builder

ARG CYBERSTRIKEAI_REPO=https://github.com/Ed1s0nZ/CyberStrikeAI.git
ARG CYBERSTRIKEAI_REF=main

WORKDIR /src
RUN apt-get update \
 && apt-get install -y --no-install-recommends git ca-certificates \
 && rm -rf /var/lib/apt/lists/*

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

# Binario compilado + recursos del repo (agents / roles / skills / tools)
COPY --from=builder /out/cyberstrike-ai /app/cyberstrike-ai
COPY --from=builder /src/CyberStrikeAI/agents  /app/agents
COPY --from=builder /src/CyberStrikeAI/roles   /app/roles
COPY --from=builder /src/CyberStrikeAI/skills  /app/skills
COPY --from=builder /src/CyberStrikeAI/tools   /app/tools
COPY --from=builder /src/CyberStrikeAI/mcp-servers /app/mcp-servers
COPY --from=builder /src/CyberStrikeAI/plugins /app/plugins
COPY --from=builder /src/CyberStrikeAI/requirements.txt /app/requirements.txt

RUN pip3 install --no-cache-dir --break-system-packages -r /app/requirements.txt || true

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh \
 && mkdir -p /app/data /app/tmp

EXPOSE 8080 8081

ENTRYPOINT ["/usr/bin/tini", "--", "/app/entrypoint.sh"]
