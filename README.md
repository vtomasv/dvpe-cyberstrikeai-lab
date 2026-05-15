# dvpe-cyberstrikeai-lab

Laboratorio de **hacking ético** reproducible que combina:

- **[DVPE](https://github.com/franc205/dvpe)** — 10 contenedores vulnerables distribuidos en 6 redes para practicar técnicas de *pivoting* interno (`Attacker-PC → Jerry-PC → Webserver → Server51 → Morty-PC → Rick-PC`).
- **[CyberStrikeAI](https://github.com/Ed1s0nZ/CyberStrikeAI)** — plataforma de pentesting asistido por LLM integrada en la red del operador (`network_a`).
- **Ollama local** como backend del LLM, consumido vía un proxy TCP que expone Ollama del host como un endpoint estable dentro de la red Docker.
- **Guía web interactiva v2** servida desde el propio compose, con layout *app-shell* (un módulo a la vez), stepper interno por paso y solapa **Asistido · CyberStrikeAI** con prompts en español listos para pegar en la consola del agente.

> ⚠️ **Uso responsable.** Este laboratorio está construido sobre redes Docker aisladas y existe únicamente con fines educativos. No utilices ninguna de estas técnicas contra sistemas que no te pertenezcan o para los cuales no tengas autorización explícita por escrito.

---

## 1. Receta de despliegue

Esta es la sección operativa: dos flujos según sea la primera vez o una actualización. Los módulos didácticos viven en la guía web (`http://localhost:8088`) una vez levantado el laboratorio.

### 1.1 Primera vez (instalación)

Requisitos previos: Docker Engine 24+ con Compose v2 (o Docker Desktop), 8 GB de RAM libres (16 GB si vas a usar `llama3.1:8b`), 25 GB de disco para imágenes y modelos, y **Ollama** corriendo en el host. En Linux puro instalá Ollama con `curl -fsSL https://ollama.com/install.sh | sh`; en macOS/Windows usá el instalador oficial. Verificá con `ollama list` que el servicio esté arriba.

```bash
# 1. Clonar el repositorio
git clone https://github.com/vtomasv/dvpe-cyberstrikeai-lab.git
cd dvpe-cyberstrikeai-lab

# 2. Variables del compose (modelo, password, puertos)
cp lab.env.example .env
# Editá .env si querés cambiar CSAI_ACCESS_PASSWORD o CSAI_OPENAI_MODEL

# 3. Descargar al menos un modelo Ollama (host)
make pull-models       # o: ollama pull llama3.1:8b

# 4. Levantar todo el stack (build + up)
make up                # equivale a: docker compose up -d --build

# 5. Verificar
docker compose ps
```

Si todo arrancó bien, abrí en el navegador `http://localhost:8088` y vas a ver la guía v2 con los 10 módulos. La password inicial de CyberStrikeAI (`http://localhost:8090`) es `lab-cyberstrike`.

### 1.2 Actualizar laboratorio existente

Si ya tenés el repo clonado y querés traer las correcciones más recientes:

```bash
cd /ruta/a/dvpe-cyberstrikeai-lab

# 1. Sincronizar el código
git pull origin main

# 2. Reconstruir las imágenes que cambiaron
docker compose build --no-cache lab-guide cyberstrikeai
# Si sólo cambió el frontend, alcanza con `docker compose build lab-guide`.
# Si cambiaron los Dockerfiles de DVPE, agregá el servicio a la lista.

# 3. Recrear los contenedores afectados
docker compose up -d --force-recreate lab-guide cyberstrikeai

# 4. Confirmar
docker compose ps
docker compose logs --tail=50 cyberstrikeai
```

> **Nota.** El estado del checklist y la posición del stepper se guardan en `localStorage` del navegador, por lo que no se pierden al actualizar la imagen `lab-guide`. Si querés borrarlos, abrí la consola y ejecutá `localStorage.removeItem('lab-progress'); localStorage.removeItem('lab-nav'); location.reload();`.

### 1.3 Atajos del Makefile

| Comando | Acción |
|---|---|
| `make up` | Build + up en background |
| `make down` | Detiene los contenedores sin borrar volúmenes |
| `make logs` | `docker compose logs -f --tail=100` |
| `make pull-models` | Descarga `llama3.1:8b`, `qwen2.5-coder:7b`, `deepseek-r1:7b` en el host |
| `make clean` | `down -v` (incluye volúmenes) |

---

## 2. Arquitectura general

| Componente | Imagen / build | Red(es) | Puerto host |
|---|---|---|---|
| Attacker-PC | `./lab/dvpe/configs` (Dockerfile-Attacker-PC) | `network_a` (`192.168.10.2`) | `2222` (SSH), `6080` (noVNC) |
| Jerry-PC | DVPE | `network_a` + `network_b` | `2200` (SSH), `8000` |
| Webserver | DVPE | `network_b` + `network_c` + `network_d` | — |
| Summer / Beth / SpaceBeth | DVPE | `network_c` | — |
| Server51 | DVPE | `network_d` + `network_e` | `8081` (Maltrail) |
| Birdperson / Morty / Rick | DVPE | `network_e` + `network_f` | — |
| **CyberStrikeAI** | `./lab/cyberstrikeai` (Go 1.24 + Python) | `network_a` (`192.168.10.10`) | `8090` (web), `8091` (MCP) |
| **ollama-proxy** | `./lab/ollama-proxy` (Alpine + socat) | `network_a` (`192.168.10.30`) → `host.docker.internal:11434` | — |
| **lab-guide** | `./lab/lab-guide` (Vite build + Nginx) | `network_a` (`192.168.10.20`) | `8088` (UI) |

Sólo `network_a` publica puertos al host. El resto de redes queda interno (`internal: true`) para forzar el *pivoting* tal como describe la guía original de DVPE. Para una vista más detallada (decisiones de diseño, flujo de datos, alternativas) revisá [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## 3. Credenciales por defecto

| Servicio | Usuario | Password | Origen |
|---|---|---|---|
| Attacker-PC noVNC (`:6080`) | – | `kali` | `x11vnc -storepasswd kali` en `Dockerfile-Attacker-PC` |
| Attacker-PC SSH (`:2222`) | `root` | `toor` | `chpasswd` en `Dockerfile-Attacker-PC` |
| CyberStrikeAI (`:8090`) | – | `lab-cyberstrike` | `CSAI_ACCESS_PASSWORD` en `lab.env.example` |
| Jerry-PC SSH (`:2200`) | `root` | `IAmJerry` | `Dockerfile-Jerry-PC` |
| Server51 / Maltrail (`:8081`) | – | – (panel abierto) | DVPE upstream |

Estos valores son *intencionalmente débiles* para uso didáctico. **No expongas el laboratorio a Internet.** Si tu firewall ya lo expone, cambiá al menos `CSAI_ACCESS_PASSWORD` en `.env` y recreá CyberStrikeAI con `docker compose up -d --force-recreate cyberstrikeai`.

---

## 4. Cómo se integra CyberStrikeAI con Ollama

CyberStrikeAI usa una API compatible-OpenAI. En `lab/cyberstrikeai/config.yaml` se inyectan al iniciar tres variables:

```env
CSAI_OPENAI_BASE_URL=http://ollama-proxy:11434/v1
CSAI_OPENAI_API_KEY=ollama
CSAI_OPENAI_MODEL=llama3.1:8b
```

El contenedor `ollama-proxy` es un simple `socat` (`TCP-LISTEN:11434 → TCP:host.docker.internal:11434`) que mantiene un nombre estable dentro de la red Docker, independiente del SO del host. Si preferís cambiar el modelo, basta editar `CSAI_OPENAI_MODEL` en `.env` y reiniciar el contenedor:

```bash
docker compose restart cyberstrikeai
```

Para validar el canal end-to-end, desde el propio contenedor:

```bash
docker exec -it CyberStrikeAI curl -s http://ollama-proxy:11434/api/tags | jq
```

La consola web arranca por defecto en **inglés** (parche aplicado al `i18n.js` upstream). Podés cambiar a chino con el switcher de la barra superior; la elección se guarda en `localStorage.csai_lang`.

---

## 5. Clase paso a paso (10 módulos)

La clase está estructurada como una secuencia de **diez módulos** (00 a 09). La página web del laboratorio (`http://localhost:8088`) renderiza la misma estructura con stepper interno y persistencia de progreso. El documento [`docs/CLASS.md`](docs/CLASS.md) ofrece la versión extendida para el instructor.

| Módulo | Tema | Duración aprox. |
|---|---|---|
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

Cada módulo de la guía web tiene dos pestañas:

> **Manual · Attacker-PC** — los comandos y procedimientos clásicos, copiables con un click y agrupados por host (`host`, `attacker`, `jerry`, `webserver`, etc.). Pensado para que el alumno los ejecute primero a mano y entienda qué pasa por debajo.
>
> **Asistido · CyberStrikeAI** — un prompt en español listo para pegar en `http://localhost:8090`, con rol del agente, modelo recomendado, criterio de éxito y los puntos donde el operador debe aprobar la siguiente acción (HITL). El alumno repite el mismo objetivo del módulo, pero ahora delegando la ejecución al agente, comparando resultados y aprendiendo a auditar un agente ofensivo.

---

## 6. Estructura del repositorio

```
dvpe-cyberstrikeai-lab/
├── docker-compose.yml         # Compose maestro del laboratorio
├── lab.env.example            # Variables para docker compose (copiar a .env)
├── Makefile                   # Atajos: up, down, logs, pull-models, clean
├── scripts/
│   ├── bootstrap.sh           # Verifica prerequisitos y levanta el stack
│   ├── pull-models.sh         # Descarga modelos Ollama recomendados
│   └── cleanup.sh             # Down con eliminación de volúmenes
├── lab/
│   ├── dvpe/                  # Snapshot adaptado de franc205/dvpe (toolkit se descarga en build)
│   ├── cyberstrikeai/         # Dockerfile + config + entrypoint para Ed1s0nZ/CyberStrikeAI
│   ├── ollama-proxy/          # Imagen socat → host.docker.internal:11434
│   └── lab-guide/             # Dockerfile + nginx.conf + vite.config.lab.ts (build de la SPA)
├── client/, server/, shared/  # Código fuente de la guía web (React 19 + Vite + Tailwind 4)
└── docs/
    ├── ARCHITECTURE.md
    ├── CLASS.md
    └── TROUBLESHOOTING.md
```

---

## 7. Troubleshooting rápido

Para problemas más detallados consultá [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md). Lo más frecuente:

| Síntoma | Causa habitual | Solución |
|---|---|---|
| `lab-guide` falla al build con `"/client": not found` | Versión vieja del Dockerfile | `git pull && docker compose build --no-cache lab-guide` |
| `cyberstrikeai` muere con `go-sqlite3 requires cgo` | Build sin CGO | `git pull && docker compose build --no-cache cyberstrikeai` |
| `cyberstrikeai` no se loguea contra Ollama | Modelo no descargado | `ollama pull llama3.1:8b` y `docker compose restart cyberstrikeai` |
| noVNC pide password | – | Usá `kali` (no es la misma que SSH) |
| Algún Dockerfile DVPE falla con `curl: (77) … ca-certificates.crt` | Imagen base sin CAs | `git pull && docker compose build --no-cache <servicio>` |
| Quiero borrar progreso del alumno en el navegador | localStorage persistente | Consola del navegador → `localStorage.clear(); location.reload()` |

Para inspeccionar logs en vivo durante una clase: `docker compose logs -f cyberstrikeai lab-guide Attacker-PC`.

---

## 8. Créditos y licencias

Este repositorio reúne y adapta los siguientes proyectos. Sus respectivas licencias se conservan dentro de cada subdirectorio:

- **DVPE** © [franc205](https://github.com/franc205/dvpe). Distribuido bajo **Artistic License 2.0**. La adaptación aquí presente está autorizada explícitamente por el autor con fines educativos. Toolkit binario no versionado: se descarga en *build time* desde el repositorio original.
- **CyberStrikeAI** © [Ed1s0nZ](https://github.com/Ed1s0nZ/CyberStrikeAI). Se integra mediante clonado en *build time* (rama configurable mediante `CYBERSTRIKEAI_REF`, default `v1.6.13`).
- **Guía de pivoting**: *From Network to Network — Hands-On Pivoting Techniques in Internal Environments*, por franc205 ([Notion](https://franc205.notion.site/ESPA-OL-From-Network-to-Network-Hands-On-Pivoting-Techniques-in-Internal-Environments-13b1f42ae1de80cd8c20f0e5a8d29a08)).

El código original aportado por este repositorio (Compose, Dockerfiles propios, guía web v2 y documentación) se publica bajo **MIT License** (ver [`LICENSE`](LICENSE)).

---

## 9. Próximos pasos sugeridos

- Botón "Copiar prompt para CyberStrikeAI" dentro de la pestaña Asistido para no tener que seleccionar el bloque a mano.
- Indicador de paso completado en el sidebar (cambiar el contador a verde con check cuando el módulo llega al 100%).
- Atajos de teclado (`←/→` para navegar pasos, `Espacio` para marcar/desmarcar) ideales para uso docente proyectado.
- Plantillas de informe en `docs/REPORT_TEMPLATE.md` para que cada alumno entregue un reporte ejecutivo.
- Modo `ollama-bundled` opcional (perfil docker compose) que levante Ollama dentro del propio stack si el host no puede correrlo.

Issues y pull requests bienvenidos.
