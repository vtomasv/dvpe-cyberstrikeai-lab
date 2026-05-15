# =============================================================================
# Guía web del alumno — Vite build (Node 22) + runtime Nginx Alpine
# El contexto del build es la raíz del repo (ver docker-compose.yml).
# =============================================================================

FROM node:22-bookworm-slim AS builder

WORKDIR /workspace

# Activar pnpm vía corepack (no requiere descargas externas)
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

# Instalar dependencias usando la lockfile completa del proyecto.
COPY package.json pnpm-lock.yaml .npmrc* ./
COPY patches ./patches
RUN pnpm install --frozen-lockfile

# Copiar sólo lo necesario para el build estático
COPY tsconfig.json tsconfig.node.json vite.config.ts components.json ./
COPY shared ./shared
COPY server ./server
COPY client ./client

# Variables vacías para evitar fallos del template script tag
ENV VITE_ANALYTICS_ENDPOINT="" \
    VITE_ANALYTICS_WEBSITE_ID="lab" \
    VITE_APP_TITLE="DVPE + CyberStrikeAI Lab"

RUN pnpm exec vite build

# ---------- runtime ----------
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /workspace/dist/public /usr/share/nginx/html

EXPOSE 80
