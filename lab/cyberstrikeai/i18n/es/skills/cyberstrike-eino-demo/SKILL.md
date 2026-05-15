---
name: cyberstrike-eino-demo
description: Paquete de habilidades de ejemplo completo: SKILL.md + directorios opcionales como scripts/, references/, assets/; verifica la habilidad Eino y las rutas dentro del paquete HTTP (solo para pruebas de seguridad autorizadas y enseñanza).
---

# Demostración de habilidad completa CyberStrike × Eino

Este paquete es consistente con [Agent Skills](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview): **`SKILL.md` es el manifiesto + la descripción principal** (sin un `SKILL.yaml` separado). En el mismo directorio puede haber cualquier subdirectorio como **`scripts/`**, **`references/`**, **`assets/`** (siempre que la ruta sea segura y no alcance el límite de profundidad/número de archivos del paquete), leídos por **`ListPackageFiles` / `resource_path`** y las herramientas locales de Eino. Para explicaciones adicionales, ver `FORMS.md`, `REFERENCE.md`.

## Descripción general

Se utiliza para una validación única:

- Lista HTTP `GET /api/skills` (`script_count`, `file_count`, `progressive`, etc. son resultados derivados/escaneados)
- `GET /api/skills/cyberstrike-eino-demo?depth=summary|full`
- `section=` corresponde al **título `##`** en `SKILL.md` o al id corto del título ASCII (por ejemplo, `## Payload 样例` a menudo corresponde a `section=payload`)
- La herramienta ADK **`skill`** dentro del multi-agente (y herramientas de archivo locales opcionales) lee recursos de rutas relativas dentro del paquete
- Recuperación de `FilesystemSkillsRetriever` de Eino para resúmenes de paquetes, bloques `##` y entradas de scripts

**Requisito estricto**: Cualquier prueba debe obtener autorización por escrito y limitarse al alcance y ventana de tiempo acordados.

## Flujo de trabajo de pruebas autorizadas

1. **Confirmación de alcance**: Dominios / IPs, lista de interfaces, acciones prohibidas (DoS, exfiltración de datos, etc.).
2. **Registro de línea base**: Realizar un reconocimiento de solo lectura en el activo acordado, guardando marcas de tiempo y resúmenes de solicitudes/respuestas originales.
3. **Pruebas clasificadas**: Dividir la tarea por tipo de vulnerabilidad; reconfirmar los límites de autorización antes de operaciones de alto riesgo.
4. **Evidencia e informes**: Cada hallazgo debe incluir pasos de reproducción, impacto y sugerencias de remediación; desensibilizar datos sensibles.
5. **Cierre**: Eliminar cuentas temporales, limpiar datos de prueba, entregar el informe.

## Ejemplos de Payload

Lo siguiente es un **marcador de posición para enseñanza**, las pruebas reales deben reemplazarse con el contexto del objetivo y no deben usarse en sistemas no autorizados:

- Detección de SQLi (basada en errores): `"'` (observar si desencadena la fuga de información de error de la base de datos)
- XSS reflejado (inofensivo): `<script>alert(1)</script>` → en un entorno de pruebas debería ser codificado o bloqueado por CSP
- Salto de directorio (validación de solo lectura): `....//....//etc/passwd` (solo en escenarios de lectura de archivos autorizados)

Para una lista detallada, ver `scripts/payloads.txt`.

## references/ y assets/

Se utiliza para verificar si los subdirectorios que no son `scripts/` se tratan de la misma manera:

| Ruta | Propósito |
|------|------|
| `references/citations.md` | Citas y explicación de pruebas HTTP `resource_path` |
| `assets/README.txt` | Recurso de marcador de posición (se puede reemplazar con binarios reales para pruebas de límite de lectura de archivos) |

## Cadena de herramientas recomendada

| Fase | Ejemplo de herramienta |
|------|-----------|
| Proxy y repetición | Burp Suite, mitmproxy |
| Escaneo y directorios | ffuf, nuclei (se debe reducir la concurrencia para cumplir con la autorización) |
| Validación de vulnerabilidad | PoC propio, CLI oficial (sqlmap, etc.) solo dentro del alcance autorizado |
| Registro | Markdown + plantillas de fragmentos JSON (ver `scripts/report-snippet.json`) |

## Lista de verificación y validación

- [ ] Autorización por escrito y ventana de prueba guardadas
- [ ] Los archivos bajo `scripts/` son consistentes con las referencias en el texto
- [ ] Web o `GET /api/skills?...` puede verificar el índice; en sesiones multi-agente, usar la herramienta **`skill`** para cargar por paquete y ahorrar tokens
- [ ] Cuando se necesiten detalles, extraer el texto completo a través de **`skill`**, o HTTP `depth=full`, `section=<título o id corto>`
- [ ] Cuando se necesite el script original, a través de la herramienta de archivo local o HTTP `resource_path=scripts/check-env.sh`
- [ ] `resource_path=references/citations.md` y `resource_path=assets/README.txt` son legibles
