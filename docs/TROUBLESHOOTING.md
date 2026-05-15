# Troubleshooting

Problemas que suelen aparecer al levantar `dvpe-cyberstrikeai-lab` y cómo resolverlos.

## 1. `Error: Cannot connect to the Docker daemon`

- Linux: arranca el servicio con `sudo systemctl start docker` y asegúrate de pertenecer al grupo `docker`.
- macOS / Windows: abre Docker Desktop y confirma que el icono está en verde.

## 2. Build de DVPE falla descargando `toolkit.tar.gz`

El compose descarga el toolkit (≈55 MB) desde `franc205/dvpe` durante el build. Si tu red no puede salir o el archivo cambia de ruta:

```bash
DVPE_TOOLKIT_URL="https://mi-mirror.local/toolkit.tar.gz" docker compose build attacker_pc jerry_pc
```

`DVPE_TOOLKIT_URL` se admite como `ARG` en todos los Dockerfiles que lo requieren.

## 3. CyberStrikeAI arranca pero responde con `400/connection refused`

Significa que el LLM remoto no respondió.

```bash
docker exec -it CyberStrikeAI curl -s http://ollama-proxy:11434/api/tags
```

Si esa salida está vacía:

- Confirmar que Ollama corre en el host: `curl http://127.0.0.1:11434/api/tags`.
- En Linux, comprueba que `extra_hosts: host.docker.internal:host-gateway` quedó aplicado (`docker inspect ollama-proxy | grep -i HostAliases`).
- Si descargaste un modelo distinto, edita `CSAI_OPENAI_MODEL` en `.env` y reinicia: `docker compose restart cyberstrikeai`.

## 4. El modelo es muy lento

- Cambia a un modelo más pequeño: `ollama pull llama3.1:8b-instruct-q4_K_M` y ajusta `CSAI_OPENAI_MODEL`.
- Si tu GPU lo permite, prueba `qwen2.5-coder:7b` (mejor en código) o `deepseek-r1:7b` (reasoning extendido).

## 5. No puedo conectarme al Attacker-PC por noVNC

- La contraseña del cliente VNC/noVNC del Attacker-PC es `kali` (no `toor`). `toor` es la contraseña de **root para SSH** (`ssh -p 2222 root@127.0.0.1`); el VNC usa una credencial separada que el upstream fija con `x11vnc -storepasswd kali` en `Dockerfile-Attacker-PC`.
- Si quieres cambiarla, edita `lab/dvpe/configs/Dockerfile-Attacker-PC` y reemplaza `kali` por tu password en la línea `RUN mkdir -p ~/.vnc && x11vnc -storepasswd kali ~/.vnc/passwd`, luego rebuild: `docker compose build --no-cache attacker_pc && docker compose up -d --force-recreate attacker_pc`.
- Comprueba que el contenedor está vivo: `docker ps | grep Attacker-PC`.
- Reinicia su entrypoint: `docker restart Attacker-PC`.
- En Docker Desktop con perfiles de seguridad estrictos puede ser necesario habilitar el dispositivo TUN: edita `docker-compose.yml` y comenta la línea `- "/dev/net/tun:/dev/net/tun"` si Docker Desktop bloquea la inyección.

## 6. Conflicto de puertos en el host

Los puertos publicados por defecto son: `2222`, `2200`, `6080`, `8000`, `8081`, `8088`, `8090`, `8091`. Si alguno está en uso, edita la sección `ports:` correspondiente en `docker-compose.yml`. Si cambias `8088` o `8090`, recuerda actualizar también los enlaces en la guía web (`client/src/pages/Home.tsx`) o servirla desde otro dominio interno.

## 7. Quiero rehacer la guía web tras tocar el código React

```bash
docker compose build lab-guide && docker compose up -d lab-guide
```

Si la página queda vacía, abre `http://localhost:8088/healthz` para verificar Nginx y revisa los logs con `docker logs -f Lab-Guide`.

## 8. Limpieza profunda

```bash
make clean        # down -v --remove-orphans
docker image prune -f
docker builder prune -f
```

Esto elimina contenedores, redes, volúmenes y caché de build asociados al laboratorio.
