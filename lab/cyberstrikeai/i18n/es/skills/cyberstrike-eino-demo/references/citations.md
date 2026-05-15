# Citas y enlaces externos (ejemplo)

Este archivo se utiliza para verificar si el directorio **`references/`** dentro del paquete de habilidades es reconocido correctamente por la API de lista, el `resource_path` de HTTP y las herramientas de archivos locales multi-agente.

## Métodos de prueba (dentro del entorno autorizado)

1. El `package_files` en la respuesta de `GET /api/skills/cyberstrike-eino-demo` debe incluir `references/citations.md`.
2. `GET /api/skills/cyberstrike-eino-demo?resource_path=references/citations.md` debe devolver el contenido de este documento.
3. Cuando hay múltiples agentes y `eino_skills.filesystem_tools` está habilitado, este archivo se puede leer a través de una ruta relativa.

## Citas de marcador de posición

- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/) (solo como ejemplo de formato de enlace)
