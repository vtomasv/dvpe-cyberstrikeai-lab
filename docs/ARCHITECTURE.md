# Arquitectura del laboratorio

`dvpe-cyberstrikeai-lab` reúne tres familias de componentes orquestados con `docker compose`:

1. **Plano de la víctima** — los 10 contenedores originales de DVPE, distribuidos en seis redes Docker (`network_a` … `network_f`).
2. **Plano del operador** — los servicios añadidos por este laboratorio: la guía web, CyberStrikeAI y el proxy hacia Ollama. Todos viven exclusivamente en `network_a`.
3. **Plano del host** — Ollama corre en el host Docker (no como contenedor) y queda disponible para CyberStrikeAI a través del proxy interno.

## Topología

```
host
└─ Ollama (11434/tcp)
        ▲
        │ host.docker.internal
        │
network_a  192.168.10.0/24
├─ Attacker-PC      .2   ssh:22 (→ host 2222) · noVNC:6080
├─ Jerry-PC         .3   ssh:22 (→ host 2200) · chisel-listener 8000
├─ CyberStrikeAI    .10  web:8080 (→ host 8090) · mcp:8081 (→ host 8091)
├─ Lab-Guide        .20  nginx:80 (→ host 8088)
└─ ollama-proxy     .30  socat 11434/tcp → host:11434

network_b  192.168.11.0/24  (internal)
├─ Jerry-PC         .2
└─ Webserver        .3   apache+wp2fac

network_c  192.168.12.0/24  (internal)
├─ Webserver        .2
├─ Summer-PC        .3
├─ Beth-PC          .4
└─ SpaceBeth-PC     .5

network_d  192.168.13.0/24  (internal)
├─ Webserver        .2
└─ Server51         .3   apache+maltrail (→ host 8081)

network_e  192.168.14.0/24  (internal)
├─ Server51         .2
├─ Birdperson-PC    .3
└─ Morty-PC         .4

network_f  192.168.100.0/24 (internal)
├─ Morty-PC         .2
└─ Rick-PC          .50  objetivo final
```

## Decisiones clave

- **Puertos publicados**: sólo `network_a`. Cualquier acceso a redes profundas pasa obligatoriamente por túneles desde Attacker-PC, fiel al espíritu del walkthrough.
- **Server51 expone Maltrail** en el host (`8081`) porque cumple un rol Blue Team explícito en el módulo 09.
- **Toolkit no versionado**: el archivo `toolkit.tar.gz` (~55 MB) se descarga durante la fase `build` desde el repositorio upstream `franc205/dvpe` mediante el ARG `DVPE_TOOLKIT_URL`. Esto evita ensuciar el repo con binarios pesados y respeta la cadena de responsabilidad del autor original.
- **CyberStrikeAI** se construye desde el código fuente Go (`./cmd/server`). El `Dockerfile` clona el upstream durante el build (`CYBERSTRIKEAI_REF`, por defecto `v1.6.13`; el upstream requiere Go ≥ 1.24, por eso la imagen base es `golang:1.24-bookworm`), copia los assets necesarios (`agents/`, `roles/`, `skills/`, `tools/`, `mcp-servers/`, `plugins/`) y monta `lab/cyberstrikeai/config.yaml` en `read-only`. Un `entrypoint.sh` parchea la configuración con las variables del entorno antes de arrancar el binario.
- **Ollama-proxy** existe para mantener un endpoint estable (`ollama-proxy:11434`) sin importar si el host es Linux, macOS o Windows. Internamente es `socat TCP-LISTEN:11434 → TCP:host.docker.internal:11434`.
- **Guía web**: el código React/Vite del proyecto se compila a estáticos y se sirve desde Nginx Alpine dentro de la red `network_a`. Esto permite que el alumno consulte la guía aunque su navegador no salga al host vía túnel SSH.

## Variables de entorno relevantes

| Variable | Servicio | Descripción |
|----------|----------|-------------|
| `CYBERSTRIKEAI_REF` | build de `cyberstrikeai` | rama/tag a clonar del upstream |
| `OLLAMA_HOST` / `OLLAMA_PORT` | `ollama-proxy` | endpoint del Ollama del host |
| `CSAI_OPENAI_PROVIDER` | `cyberstrikeai` | proveedor LLM: `openai`/compatible, `gemini` o `claude` |
| `CSAI_OPENAI_BASE_URL` | `cyberstrikeai` | API compatible-OpenAI usada por el agente |
| `CSAI_OPENAI_API_KEY`  | `cyberstrikeai` | API key del proveedor; cualquier cadena si es Ollama |
| `CSAI_OPENAI_MODEL`    | `cyberstrikeai` | modelo que recibirá las consultas |
| `DVPE_TOOLKIT_URL` | builds DVPE | mirror alternativo del toolkit binario |

## Flujo end-to-end del módulo IA

```
Alumno → http://localhost:8090 (web)
       → CyberStrikeAI (8080 dentro del contenedor)
       → http://ollama-proxy:11434/v1/chat/completions
       → socat → host.docker.internal:11434
       → Ollama en el host → modelo seleccionado
```

Para Gemini, `cyberstrikeai` conserva el mismo cliente OpenAI-compatible y cambia el destino a `https://generativelanguage.googleapis.com/v1beta/openai`.

CyberStrikeAI conserva HITL: las herramientas ofensivas requieren aprobación humana explícita, mientras que las lecturas (read_file/list_dir/glob/grep) están en el whitelist.

## Persistencia

- `cyberstrikeai_data` (volumen Docker) — historial y artefactos generados por el agente.
- No hay volúmenes adicionales para DVPE; cada `make up` reinicia el laboratorio limpio, lo cual facilita iterar la clase.

## Diagrama de despliegue (lectura rápida)

```
make up
 ├─ build lab/dvpe/configs/*  → 10 contenedores DVPE
 ├─ build lab/cyberstrikeai   → imagen Go+Python
 ├─ build lab/ollama-proxy    → imagen Alpine+socat
 ├─ build lab/lab-guide       → SPA + Nginx
 └─ up -d                     → red network_a expuesta · b–f internal
```
