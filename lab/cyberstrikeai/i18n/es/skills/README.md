# Directorio Skills (Agent Skills / Eino)

- Cada skill es un **subdirectorio**, en la raíz debe haber un **`SKILL.md`** (YAML front matter: `name`, `description` + cuerpo Markdown), ver [agentskills.io](https://agentskills.io/specification.md).
- **El nombre del directorio debe coincidir con `name`**.
- **Carga en tiempo de ejecución**: En la sesión de **Eino DeepAgent (multi-agente)** es revelado progresivamente por el **middleware `skill`** del ADK (el prompt del sistema lista el name/description de cada skill, luego el modelo llama a la herramienta **`skill`** para obtener el texto completo de `SKILL.md`). Opcionalmente se puede habilitar **`multi_agent.eino_skills.filesystem_tools`**, usando los mismos `read_file` / `execute` que la máquina local para acceder a scripts y recursos dentro del paquete.
- **Gestión Web**: HTTP `/api/skills/*` se sigue usando para listar, editar y cargar archivos dentro del paquete (implementado como `internal/skillpackage`, no MCP).
- **Tiempo de ejecución**: Dentro de la sesión multi-agente (DeepAgent) es cargado progresivamente por la herramienta **`skill`** del ADK; el bucle MCP de agente único no incluye Skills, requiere abrir multi-agente o una ruta Eino de agente único posterior.
