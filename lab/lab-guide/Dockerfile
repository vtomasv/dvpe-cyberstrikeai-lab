# =============================================================================
# Guía web del alumno — Vite build (Node 22) + runtime Nginx Alpine
#
# IMPORTANTE: este Dockerfile espera que el contexto de build sea la RAÍZ del
# repositorio (ver docker-compose.yml -> services.lab-guide.build.context: .).
# Se referencian rutas como `lab/lab-guide/...` para mantener la
# configuración del servicio agrupada en su propio directorio.
# =============================================================================

# ---------- builder ----------
FROM node:22-bookworm-slim AS builder

WORKDIR /workspace

# Activar pnpm vía corepack (no requiere descargas externas).
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

# Instalar dependencias usando la lockfile completa del proyecto. Se copia
# antes que el código para aprovechar la caché de Docker cuando sólo cambian
# fuentes y no dependencias.
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
RUN pnpm install --frozen-lockfile

# Copiar sólo lo necesario para el build estático del frontend.
COPY tsconfig.json tsconfig.node.json components.json ./
COPY shared ./shared
COPY server ./server
COPY client ./client

# Configuración Vite "minimal" específica para el lab (sin plugins propios
# del entorno de desarrollo Manus que requieren variables externas).
COPY lab/lab-guide/vite.config.lab.ts ./vite.config.ts
# index.html limpio, sin scripts de analytics que rompan el build estático.
COPY lab/lab-guide/index.html ./client/index.html

ENV NODE_ENV=production

# Vite genera dist/public/ según la configuración del lab.
RUN pnpm exec vite build

# ---------- runtime ----------
FROM nginx:1.27-alpine

# Configuración Nginx minimalista (SPA fallback + healthz).
COPY lab/lab-guide/nginx.conf /etc/nginx/conf.d/default.conf

# Copiar artefactos estáticos compilados.
COPY --from=builder /workspace/dist/public /usr/share/nginx/html

EXPOSE 80
