---
name: api-security-testing
description: Habilidades profesionales y metodología para pruebas de seguridad de API
version: 1.0.0
---

# Pruebas de seguridad de API

## Descripción general

Las pruebas de seguridad de API son un paso crucial para garantizar la seguridad de las interfaces API. Esta habilidad proporciona métodos, herramientas y mejores prácticas para las pruebas de seguridad de API.

## Alcance de las pruebas

### 1. Autenticación y autorización

**Elementos de prueba:**
- Validación de la validez del token
- Manejo de expiración del token
- Control de permisos
- Validación de permisos de roles

### 2. Validación de entrada

**Elementos de prueba:**
- Validación del tipo de parámetro
- Límite de longitud de datos
- Manejo de caracteres especiales
- Prevención de inyección SQL
- Prevención de XSS

### 3. Lógica de negocio

**Elementos de prueba:**
- Validación del flujo de trabajo
- Transición de estado
- Control de concurrencia
- Reglas de negocio

### 4. Manejo de errores

**Elementos de prueba:**
- Fuga de mensajes de error
- Trazas de pila
- Exposición de información sensible

## Métodos de prueba

### 1. Descubrimiento de API

**Identificación de endpoints de API:**
```bash
# Usar escaneo de directorios
gobuster dir -u https://target.com -w api-wordlist.txt

# Usar escaneo pasivo de Burp Suite
# Navegar por la aplicación, observar llamadas a la API

# Analizar archivos JavaScript
# Buscar definiciones de endpoints de API
```

### 2. Pruebas de autenticación

**Pruebas de token:**
```http
# Probar token inválido
GET /api/user
Authorization: Bearer invalid_token

# Probar token expirado
GET /api/user
Authorization: Bearer expired_token

# Probar sin token
GET /api/user
```

**Pruebas de JWT:**
```bash
# Usar jwt_tool
python jwt_tool.py <JWT_TOKEN>

# Probar confusión de algoritmos
python jwt_tool.py <JWT_TOKEN> -X a

# Probar fuerza bruta de claves
python jwt_tool.py <JWT_TOKEN> -C -d wordlist.txt
```

### 3. Pruebas de autorización

**Permisos horizontales:**
```http
# Usuario A accede a los recursos del usuario B
GET /api/user/123
Authorization: Bearer user_a_token

# Debería devolver 403
```

**Permisos verticales:**
```http
# Usuario normal accede a la interfaz de administrador
GET /api/admin/users
Authorization: Bearer user_token

# Debería devolver 403
```

### 4. Pruebas de validación de entrada

**Inyección SQL:**
```http
POST /api/search
{
  "query": "test' OR '1'='1"
}
```

**Inyección de comandos:**
```http
POST /api/execute
{
  "command": "ping; id"
}
```

**XXE:**
```http
POST /api/parse
Content-Type: application/xml

<?xml version="1.0"?>
<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
<foo>&xxe;</foo>
```

### 5. Pruebas de límite de velocidad

**Probar límite de velocidad:**
```python
import requests

for i in range(1000):
    response = requests.get('https://target.com/api/endpoint')
    print(f"Request {i}: {response.status_code}")
```

## Uso de herramientas

### Postman

**Crear colección de pruebas:**
1. Importar documentación de la API
2. Configurar autenticación
3. Crear casos de prueba
4. Ejecutar pruebas automatizadas

### Burp Suite

**Escaneo de API:**
1. Configurar endpoints de API
2. Configurar autenticación
3. Ejecutar escaneo activo
4. Analizar resultados

### OWASP ZAP

```bash
# Escaneo de API
zap-cli quick-scan --self-contained \
  --start-options '-config api.disablekey=true' \
  http://target.com/api
```

### REST-Attacker

```bash
# Escanear especificación OpenAPI
rest-attacker scan openapi.yaml
```

## Vulnerabilidades comunes

### 1. Omisión de autenticación

**Defectos de validación de token:**
- Generación de token débil
- Token predecible
- El token no valida la firma

### 2. Escalada de privilegios

**IDOR:**
- Referencia directa a objetos
- Propiedad de recursos no validada

### 3. Fuga de información

**Mensajes de error:**
- Mensajes de error detallados
- Trazas de pila
- Datos sensibles

### 4. Vulnerabilidades de inyección

**Inyecciones comunes:**
- Inyección SQL
- Inyección NoSQL
- Inyección de comandos
- XXE

### 5. Lógica de negocio

**Defectos lógicos:**
- Manipulación de precios
- Omisión de límite de cantidad
- Modificación de estado

## Lista de verificación de pruebas

### Pruebas de autenticación
- [ ] Validación de la validez del token
- [ ] Manejo de expiración del token
- [ ] Detección de token débil
- [ ] Ataque de repetición de token

### Pruebas de autorización
- [ ] Pruebas de permisos horizontales
- [ ] Pruebas de permisos verticales
- [ ] Validación de permisos de roles
- [ ] Control de acceso a recursos

### Validación de entrada
- [ ] Pruebas de inyección SQL
- [ ] Pruebas de XSS
- [ ] Pruebas de inyección de comandos
- [ ] Pruebas de XXE
- [ ] Contaminación de parámetros

### Lógica de negocio
- [ ] Validación del flujo de trabajo
- [ ] Transición de estado
- [ ] Control de concurrencia
- [ ] Reglas de negocio

### Manejo de errores
- [ ] Fuga de mensajes de error
- [ ] Trazas de pila
- [ ] Exposición de información sensible

## Medidas de protección

### Soluciones recomendadas

1. **Autenticación**
   - Usar tokens fuertes
   - Implementar actualización de tokens
   - Validar firma de tokens

2. **Autorización**
   - Control de acceso basado en roles
   - Validación de propiedad de recursos
   - Principio de mínimo privilegio

3. **Validación de entrada**
   - Validación del tipo de parámetro
   - Límite de longitud de datos
   - Validación de lista blanca

4. **Manejo de errores**
   - Respuesta de error unificada
   - No filtrar información detallada
   - Registrar registros de errores

5. **Límite de velocidad**
   - Implementar limitación de velocidad de API
   - Prevenir fuerza bruta
   - Monitorear solicitudes anormales

## Notas

- Realizar solo en entornos de pruebas de seguridad autorizados
- Evitar causar impacto en la API
- Prestar atención a las diferencias entre las versiones de la API
- Prestar atención a la frecuencia de las solicitudes durante las pruebas