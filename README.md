# dvpe-cyberstrikeai-lab

Laboratorio de **hacking ético** reproducible que combina:

- **[DVPE](https://github.com/franc205/dvpe)** — 10 contenedores vulnerables distribuidos en 6 redes para practicar técnicas de *pivoting* interno (`Attacker-PC → Jerry-PC → Webserver → Server51 → Morty-PC → Rick-PC`).
- **[CyberStrikeAI](https://github.com/Ed1s0nZ/CyberStrikeAI)** — plataforma de pentesting asistido por LLM integrada en la red del operador (`network_a`).
- **Ollama local** como backend del LLM, consumido vía un proxy TCP que expone Ollama del host como un endpoint estable dentro de la red Docker.
- **Guía web interactiva** servida desde el propio compose con módulos numerados, checklist persistente y *spoilers* ocultos para uso docente.

> ⚠️ **Uso responsable.** Este laboratorio está construido sobre redes Docker aisladas y existe únicamente con fines educativos. No utilices ninguna de estas técnicas contra sistemas que no te pertenezcan o para los cuales no tengas autorización explícita por escrito.

---

## 1. Arquitectura general

| Componente        | Imagen / build                            | Red(es)                                              | Puerto host |
|-------------------|-------------------------------------------|------------------------------------------------------|-------------|
| Attacker-PC       | `./lab/dvpe/configs` (Dockerfile-Attacker-PC) | `network_a` (`192.168.10.2`)                          | `2222` (SSH), `6080` (noVNC) |
| Jerry-PC          | DVPE                                      | `network_a` + `network_b`                            | `2200` (SSH), `8000` |
| Webserver         | DVPE                                      | `network_b` + `network_c` + `network_d`              | —           |
| Summer / Beth / SpaceBeth | DVPE                              | `network_c`                                          | —           |
| Server51          | DVPE                                      | `network_d` + `network_e`                            | `8081` (Maltrail) |
| Birdperson / Morty / Rick | DVPE                              | `network_e` + `network_f`                            | —           |
| **CyberStrikeAI** | `./lab/cyberstrikeai` (Go + Python)       | `network_a` (`192.168.10.10`)                        | `8090` (web), `8091` (MCP) |
| **ollama-proxy**  | `./lab/ollama-proxy` (Alpine + socat)     | `network_a` (`192.168.10.30`) → `host.docker.internal:11434` | — |
| **lab-guide**     | `./lab/lab-guide` (Vite build + Nginx)    | `network_a` (`192.168.10.20`)                        | `8088` (UI) |

Sólo `network_a` publica puertos al host. El resto de redes queda interno (`internal: true`) para forzar el *pivoting* tal como describe la guía original de DVPE.

```
host:8088  ── Lab-Guide   ─┐
host:8090  ── CyberStrikeAI ┤
host:6080  ── Attacker noVNC├──── network_a (192.168.10.0/24)
host:2222  ── Attacker SSH  ┘
host:8081  ── Server51 web (en network_d) → expuesto al host
```

---

## 2. Requisitos previos

| Componente | Versión mínima recomendada |
|------------|----------------------------|
| Docker Engine o Docker Desktop | 24.x con Compose v2 |
| Memoria libre | 8 GB (16 GB recomendado si se ejecuta `llama3.1:8b`) |
| Disco libre | 25 GB para todas las imágenes y modelos |
| **Ollama** | 0.4.x corriendo en el **host Docker** |
| Modelos sugeridos | `llama3.1:8b` (por defecto), `qwen2.5-coder:7b`, `deepseek-r1:7b` |

> En Linux, Docker añade automáticamente `host.docker.internal` mediante `extra_hosts: host-gateway`. En macOS y Windows con Docker Desktop el alias existe de forma nativa.

Instalación rápida de Ollama:

```bash
curl -fsSL https://ollama.com/install.sh | sh   # Linux / macOS
ollama pull llama3.1:8b
```

---

## 3. Cómo levantar el laboratorio

```bash
git clone https://github.com/vtomasv/dvpe-cyberstrikeai-lab.git
cd dvpe-cyberstrikeai-lab
cp lab.env.example .env       # variables del compose (modelo, puertos, etc.)
make up                       # equivale a docker compose up -d --build
```

Servicios principales una vez arriba:

| URL / comando                                | Para qué |
|----------------------------------------------|----------|
| `http://localhost:8088`                      | Guía web del alumno (esta página) |
| `http://localhost:8090`                      | CyberStrikeAI (web). Password inicial: `lab-cyberstrike` |
| `http://localhost:8091/mcp`                  | Endpoint MCP HTTP de CyberStrikeAI |
| `http://localhost:6080`                      | Escritorio gráfico del Attacker-PC (noVNC) |
| `ssh -p 2222 root@127.0.0.1`                 | Acceso shell al Attacker-PC (`root:toor`) |
| `ssh -p 2200 root@127.0.0.1`                 | Acceso shell a Jerry-PC (`root:IAmJerry`) |
| `http://localhost:8081`                      | Panel Maltrail expuesto desde Server51 |

Para detener: `make down`. Para limpieza total (incluye volúmenes): `make clean`.

---

## 4. Cómo se integra CyberStrikeAI con Ollama

CyberStrikeAI usa una API compatible-OpenAI. En `lab/cyberstrikeai/config.yaml` se inyectan al iniciar tres variables:

```env
CSAI_OPENAI_BASE_URL=http://ollama-proxy:11434/v1
CSAI_OPENAI_API_KEY=ollama
CSAI_OPENAI_MODEL=llama3.1:8b
```

El contenedor `ollama-proxy` es un simple `socat` (`TCP-LISTEN:11434 → TCP:host.docker.internal:11434`) que mantiene un nombre estable dentro de la red Docker, independiente del SO del host. Si prefieres cambiar el modelo (por ejemplo `qwen2.5-coder:7b`), basta editar la variable `CSAI_OPENAI_MODEL` en `.env` y reiniciar el contenedor:

```bash
docker compose restart cyberstrikeai
```

Para validar el canal end-to-end:

```bash
docker exec -it CyberStrikeAI curl -s http://ollama-proxy:11434/api/tags | jq
```

---

## 5. Clase paso a paso

La clase está estructurada como una secuencia de **diez módulos** (00 a 09). La página web del laboratorio (`http://localhost:8088`) renderiza la misma estructura con checklist persistente; este README resume el orden y el documento [`docs/CLASS.md`](docs/CLASS.md) ofrece la versión extendida para el instructor.

| Módulo | Tema | Duración aprox. |
|--------|------|-----------------|
| 00 | Preparación del laboratorio y descarga de modelos Ollama | 20 min |
| 01 | Reconocimiento desde el Attacker-PC | 15 min |
| 02 | Compromiso inicial de Jerry-PC vía SSH | 15 min |
| 03 | Pivote SOCKS con Chisel hacia `network_b` | 20 min |
| 04 | Enumeración web del Webserver a través del SOCKS | 20 min |
| 05 | Explotación, reverse shell y captura de la primera flag | 25 min |
| 06 | Escalación de privilegios con LinPEAS / SUID | 20 min |
| 07 | Avance lateral con CyberStrikeAI (planificación asistida) | 25 min |
| 08 | Doble pivote a `network_e` y `network_f`, flag final en Rick-PC | 30 min |
| 09 | Visión Blue Team: detección, IOC en Maltrail y mitigaciones | 25 min |

---

## 6. Estructura del repositorio

```
dvpe-cyberstrikeai-lab/
├── docker-compose.yml         # Compose maestro del laboratorio
├── lab.env.example            # Variables para docker compose
├── Makefile                   # Atajos: up, down, logs, pull-models, clean
├── scripts/
│   ├── bootstrap.sh           # Verifica prerequisitos y levanta el stack
│   ├── pull-models.sh         # Descarga modelos Ollama recomendados
│   └── cleanup.sh             # Down con eliminación de volúmenes
├── lab/
│   ├── dvpe/                  # Snapshot adaptado de franc205/dvpe (toolkit se descarga en build)
│   ├── cyberstrikeai/         # Dockerfile + config + entrypoint para Ed1s0nZ/CyberStrikeAI
│   ├── ollama-proxy/          # Imagen socat → host.docker.internal:11434
│   └── lab-guide/             # Dockerfile + nginx.conf que sirve la SPA estática
├── client/, server/, shared/  # Código fuente de la guía web (React 19 + Vite)
└── docs/
    ├── ARCHITECTURE.md
    ├── CLASS.md
    └── TROUBLESHOOTING.md
```

---

## 7. Créditos y licencias

Este repositorio reúne y adapta los siguientes proyectos. Sus respectivas licencias se conservan dentro de cada subdirectorio (`lab/dvpe/LICENSE`, `lab/cyberstrikeai/UPSTREAM_COMMIT.txt`):

- **DVPE** © [franc205](https://github.com/franc205/dvpe). Distribuido bajo **Artistic License 2.0**. La adaptación aquí presente está autorizada explícitamente por el autor con fines educativos. Toolkit binario no versionado: se descarga en *build time* desde el repositorio original.
- **CyberStrikeAI** © [Ed1s0nZ](https://github.com/Ed1s0nZ/CyberStrikeAI). Se integra mediante clonado en *build time* (rama configurable mediante `CYBERSTRIKEAI_REF`).
- **Guía de pivoting**: *From Network to Network — Hands-On Pivoting Techniques in Internal Environments*, por franc205 ([Notion](https://franc205.notion.site/ESPA-OL-From-Network-to-Network-Hands-On-Pivoting-Techniques-in-Internal-Environments-13b1f42ae1de80cd8c20f0e5a8d29a08)).

El código original aportado por este repositorio (Compose, Dockerfiles propios, guía web y documentación) se publica bajo **MIT License** (ver [`LICENSE`](LICENSE)).

---

## 8. Próximos pasos sugeridos

- Plantillas de informes en `docs/REPORT_TEMPLATE.md` para que cada alumno entregue un reporte ejecutivo.
- Integración con Caldera o Atomic Red Team para automatizar parte del Blue Team.
- Modo `ollama-bundled` opcional (perfil docker compose) que levante Ollama dentro del propio stack si el host no puede correrlo.

Cualquier idea o mejora se acepta vía issues o pull requests.
