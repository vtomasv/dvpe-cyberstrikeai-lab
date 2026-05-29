# AGENTS.md

## Proyecto

Laboratorio reproducible de hacking etico que integra:

- DVPE: contenedores vulnerables y redes internas para pivoting.
- CyberStrikeAI: agente ofensivo asistido por LLM en `network_a`.
- Ollama proxy: puente hacia Ollama del host.
- Guia web: SPA React/Vite servida como `lab-guide`.

## Estructura clave

- `client/`: frontend de la guia web.
- `server/`: servidor Express usado por el build de produccion.
- `shared/`: constantes compartidas.
- `lab/dvpe/`: stack DVPE adaptado, Dockerfiles y archivos del entorno vulnerable.
- `lab/cyberstrikeai/`: Dockerfile, config y entrypoint de CyberStrikeAI.
- `lab/ollama-proxy/`: proxy TCP hacia Ollama del host.
- `lab/lab-guide/`: build Docker/Nginx de la guia.
- `docs/`: documentacion de arquitectura, clase y troubleshooting.

## Comandos utiles

- `cp lab.env.example .env`: crear variables del laboratorio si no existe `.env`.
- `make up`: construir y levantar todo el laboratorio con Docker.
- `make down`: detener contenedores.
- `make ps`: ver estado del stack.
- `make logs`: seguir logs del laboratorio.
- `make clean`: borrar contenedores, volumenes y redes del lab.
- `docker compose config`: validar sintaxis final del compose.
- `docker compose build lab-guide`: validar cambios de la guia web en Docker.
- `docker compose build cyberstrikeai`: validar cambios de CyberStrikeAI en Docker.
- `docker compose up -d --build`: alternativa directa a `make up`.

## Ejecucion en Docker

- El flujo principal de pruebas es Docker, no ejecucion local con `pnpm`.
- Antes de levantar por primera vez, asegurar que Docker Compose v2 este disponible y que exista `.env`.
- CyberStrikeAI requiere Ollama corriendo en el host y al menos el modelo configurado en `CSAI_OPENAI_MODEL`.
- Para preparar modelos en el host: `make pull-models`.
- Para arranque completo: `make up`.
- Para verificar servicios: `make ps` y `docker compose logs --tail=100 lab-guide cyberstrikeai ollama-proxy`.
- URLs esperadas tras levantar:
  - Guia web: `http://localhost:8088`
  - CyberStrikeAI: `http://localhost:8090`
  - MCP CyberStrikeAI: `http://localhost:8091`
  - Attacker-PC noVNC: `http://localhost:6080`
  - Server51 / Maltrail: `http://localhost:8081`

## Validacion segun cambios

- Cambios en `docker-compose.yml`: ejecutar `docker compose config`.
- Cambios en `client/`, `server/`, `shared/`, `package.json`, `pnpm-lock.yaml` o `lab/lab-guide/`: ejecutar `docker compose build lab-guide`.
- Cambios en `lab/cyberstrikeai/`: ejecutar `docker compose build cyberstrikeai`.
- Cambios en `lab/ollama-proxy/`: ejecutar `docker compose build ollama-proxy`.
- Cambios en `lab/dvpe/configs/`: ejecutar `docker compose build <servicio-afectado>` o `make up` si hay dependencias cruzadas.
- Si se necesita validar TypeScript rapido, `pnpm run check` es aceptable como apoyo, pero la prueba final debe ser Docker.

## Reglas de trabajo

- No modificar binarios, tarballs ni snapshots de terceros salvo que la tarea lo pida explicitamente.
- Mantener cambios de UI dentro de `client/` y respetar los componentes existentes en `client/src/components/ui/`.
- Mantener cambios de contenido del laboratorio en `client/src/data/lab.ts` y documentos relacionados.
- No exponer puertos de redes internas DVPE (`network_b` a `network_f`) sin una razon explicita; el pivoting es parte del objetivo didactico.
- No cambiar credenciales por defecto ni puertos documentados sin actualizar `README.md` y `docs/`.
- Si se cambia Compose, Dockerfiles o entrypoints, validar con `docker compose config` como minimo.
- Si se cambia TypeScript/React, preferir `docker compose build lab-guide` como validacion final.

## Estado del repo

- Puede existir trabajo local no relacionado. No revertir cambios ajenos.
- Antes de editar archivos grandes del lab, revisar `git status --short`.
