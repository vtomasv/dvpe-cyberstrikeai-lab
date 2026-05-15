# Explicación de los archivos de configuración de roles

Este directorio contiene todos los archivos de configuración de roles, cada rol define el patrón de comportamiento de la IA y las herramientas disponibles.

## Crear un nuevo rol

Al crear un nuevo rol, crea un archivo YAML en el directorio `roles/` con el siguiente formato:

**Método 1: Especificar explícitamente la lista de herramientas (Recomendado)**
```yaml
name: Nombre del rol
description: Descripción del rol
user_prompt: Prompt del usuario (se añade antes del mensaje del usuario para guiar el comportamiento de la IA)
icon: "Icono (opcional)"
tools:
    # Añade las herramientas que necesites...
    # ⚠️ Importante: Se recomienda incluir las siguientes herramientas MCP integradas principales (vulnerabilidad y base de conocimiento)
    - record_vulnerability
    - list_knowledge_risk_types
    - search_knowledge_base
enabled: true
```

**Método 2: No configurar el campo tools (Usa todas las herramientas habilitadas)**
```yaml
name: Nombre del rol
description: Descripción del rol
user_prompt: Prompt del usuario (se añade antes del mensaje del usuario para guiar el comportamiento de la IA)
icon: "Icono (opcional)"
# Si no configuras el campo tools, se usarán por defecto todas las herramientas habilitadas en la gestión de MCP
enabled: true
```

## ⚠️ Recordatorio importante: Herramientas MCP integradas principales

**Si configuras el campo `tools`, asegúrate de incluir las siguientes herramientas en la lista (al menos estas tres):**

1. **`record_vulnerability`** - Herramienta de gestión de vulnerabilidades, utilizada para registrar la vulnerabilidad encontrada
2. **`list_knowledge_risk_types`** - Herramienta de base de conocimiento, enumera los tipos de riesgo disponibles
3. **`search_knowledge_base`** - Herramienta de base de conocimiento, busca contenido en la base de conocimiento

Según sea necesario, también puedes añadir WebShell, tareas por lotes y otras herramientas integradas o externas (basadas en las habilitadas en la gestión de MCP).

**Skills (Paquetes de habilidades)**: En sesiones de **múltiples agentes / Eino**, la herramienta integrada **`skill`** carga bajo demanda los paquetes en `skills_dir`, sin relación vinculante con el YAML del rol.

**Nota**: Si no configuras el campo `tools`, el sistema usará por defecto todas las herramientas habilitadas en la gestión de MCP. Para controlar explícitamente las herramientas disponibles para el rol, se recomienda configurar explícitamente el campo `tools`.

## Explicación de los campos de configuración del rol

- **name**: Nombre del rol (obligatorio)
- **description**: Descripción del rol (obligatorio)
- **user_prompt**: Prompt del usuario, se añadirá antes del mensaje del usuario para guiar a la IA a adoptar métodos de pruebas de seguridad y puntos de enfoque específicos (opcional)
- **icon**: Icono del rol, soporta emoji Unicode (opcional)
- **tools**: Lista de herramientas, especifica las herramientas disponibles para este rol (opcional)
  - **Si no configuras el campo `tools`**: Se seleccionarán por defecto **todas las herramientas habilitadas en la gestión de MCP**
  - **Si configuras el campo `tools`**: Solo se usarán las herramientas especificadas en la lista (se recomienda incluir al menos las herramientas integradas principales mencionadas anteriormente)
- **enabled**: Si se habilita este rol (obligatorio, true/false)

## Ejemplos

Consulta otros archivos de roles en este directorio, como `渗透测试.yaml`, `Web应用扫描.yaml`, etc.
