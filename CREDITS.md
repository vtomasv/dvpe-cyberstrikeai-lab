# Créditos

Este laboratorio educativo no existiría sin el trabajo previo de las siguientes personas y proyectos.

## DVPE — Damn Vulnerable Pivoting Environment

- Autor: **franc205** ([GitHub](https://github.com/franc205))
- Repositorio: <https://github.com/franc205/dvpe>
- Commit base usado en este snapshot: ver [`lab/dvpe/UPSTREAM_COMMIT.txt`](lab/dvpe/UPSTREAM_COMMIT.txt)
- Licencia upstream: **Artistic License 2.0** (conservada en [`lab/dvpe/LICENSE`](lab/dvpe/LICENSE) cuando aplica)
- Adaptaciones realizadas:
  - Se ajustó el puerto host de `Server51` (`8080 → 8081`) para liberar `8080` para CyberStrikeAI.
  - Las redes `b–f` se marcan `internal: true` en el compose maestro para forzar el pivoting.
  - El toolkit binario (`toolkit.tar.gz`, ~55 MB) se descarga al *build* desde el repositorio upstream mediante el ARG `DVPE_TOOLKIT_URL`, evitando versionarlo en este repo.

## CyberStrikeAI

- Autor: **Ed1s0nZ** ([GitHub](https://github.com/Ed1s0nZ))
- Repositorio: <https://github.com/Ed1s0nZ/CyberStrikeAI>
- Commit base usado para producir esta imagen: ver [`lab/cyberstrikeai/UPSTREAM_COMMIT.txt`](lab/cyberstrikeai/UPSTREAM_COMMIT.txt)
- Integración en este lab:
  - Build multi-stage que clona el upstream (rama configurable con `CYBERSTRIKEAI_REF`).
  - `config.yaml` adaptado para Ollama local con HITL preencendido sobre herramientas ofensivas.
  - Entrypoint que parchea base URL / API key / modelo en tiempo de arranque.

## Guía didáctica de pivoting

- Autor: **franc205**
- Título: *From Network to Network — Hands-On Pivoting Techniques in Internal Environments*
- URL: <https://franc205.notion.site/ESPA-OL-From-Network-to-Network-Hands-On-Pivoting-Techniques-in-Internal-Environments-13b1f42ae1de80cd8c20f0e5a8d29a08>
- Uso: los módulos 01–08 de la clase replican el orden lógico de la guía. La guía web del laboratorio añade checklist, comandos copiables y spoilers ocultos.

## Herramientas y librerías

- **Chisel** por [@jpillora](https://github.com/jpillora/chisel)
- **LinPEAS** por [@carlospolop](https://github.com/peass-ng/PEASS-ng)
- **FFUF** por [@joohoi](https://github.com/ffuf/ffuf)
- **Maltrail** por [@stamparm](https://github.com/stamparm/maltrail)
- **wp2fac** vulnerability environment incluido en DVPE
- **noVNC** y **x11vnc** para la sesión gráfica del Attacker-PC
- Frontend: React 19, Vite, TailwindCSS 4, shadcn/ui, framer-motion, lucide-react

## Empaquetado y publicación

- Diseño, integración Docker, página web, documentación y publicación: **Tom (vtomasv)** con el apoyo de Manus.
