---
name: secure-code-review
description: Habilidades profesionales y metodología para la revisión de código seguro
version: 1.0.0
---

# Revisión de código seguro

## Resumen

La revisión de código seguro es un método importante para identificar vulnerabilidades de seguridad en el código. Esta habilidad proporciona métodos, herramientas y mejores prácticas para la revisión de código seguro.

## Alcance de la revisión

### 1. Validación de entrada

**Elementos de verificación:**
- Validación de entrada del usuario
- Validación de parámetros
- Filtrado de datos
- Comprobación de límites

### 2. Codificación de salida

**Elementos de verificación:**
- Protección contra XSS
- Codificación de salida
- Política de seguridad de contenido
- Configuración de cabeceras de respuesta

### 3. Autenticación y autorización

**Elementos de verificación:**
- Mecanismos de autenticación
- Gestión de sesiones
- Control de permisos
- Manejo de contraseñas

### 4. Cifrado y claves

**Elementos de verificación:**
- Cifrado de datos
- Gestión de claves
- Algoritmos de hash
- Generación de números aleatorios

## Métodos de revisión

### 1. Análisis estático

**Uso de herramientas SAST:**
```bash
# SonarQube
sonar-scanner

# Checkmarx
# Usar interfaz web

# Fortify
sourceanalyzer -b project build.sh
sourceanalyzer -b project -scan

# Semgrep
semgrep --config=auto .
```

### 2. Revisión manual

**Lista de verificación de revisión:**
- [ ] Validación de entrada
- [ ] Codificación de salida
- [ ] Inyección SQL
- [ ] Vulnerabilidad XSS
- [ ] Autenticación y autorización
- [ ] Uso de cifrado
- [ ] Manejo de errores
- [ ] Registro de logs

### 3. Reconocimiento de patrones de código

**Funciones peligrosas:**
```python
# Funciones peligrosas en Python
eval()
exec()
pickle.loads()
os.system()
subprocess.call()
```

```java
// Funciones peligrosas en Java
Runtime.exec()
ProcessBuilder()
Class.forName()
```

```php
// Funciones peligrosas en PHP
eval()
exec()
system()
passthru()
```

## Patrones de vulnerabilidad comunes

### Inyección SQL

**Código peligroso:**
```java
String query = "SELECT * FROM users WHERE id = " + userId;
Statement stmt = connection.createStatement();
ResultSet rs = stmt.executeQuery(query);
```

**Código seguro:**
```java
String query = "SELECT * FROM users WHERE id = ?";
PreparedStatement stmt = connection.prepareStatement(query);
stmt.setInt(1, userId);
ResultSet rs = stmt.executeQuery();
```

### Vulnerabilidad XSS

**Código peligroso:**
```javascript
document.innerHTML = userInput;
element.innerHTML = "<div>" + userInput + "</div>";
```

**Código seguro:**
```javascript
element.textContent = userInput;
element.setAttribute("data-value", userInput);
// O usar biblioteca de codificación
element.innerHTML = escapeHtml(userInput);
```

### Inyección de comandos

**Código peligroso:**
```python
import os
os.system("ping " + user_input)
```

**Código seguro:**
```python
import subprocess
subprocess.run(["ping", "-c", "1", validated_input])
```

### Salto de directorio

**Código peligroso:**
```java
String filePath = "/uploads/" + fileName;
File file = new File(filePath);
```

**Código seguro:**
```java
String basePath = "/uploads/";
String fileName = Paths.get(fileName).getFileName().toString();
String filePath = basePath + fileName;
File file = new File(filePath);
if (!file.getCanonicalPath().startsWith(basePath)) {
    throw new SecurityException("Invalid path");
}
```

### Claves codificadas

**Código peligroso:**
```java
String apiKey = "1234567890abcdef";
String password = "admin123";
```

**Código seguro:**
```java
String apiKey = System.getenv("API_KEY");
String password = keyStore.getPassword("db_password");
```

## Uso de herramientas

### SonarQube

```bash
# Iniciar SonarQube
docker run -d -p 9000:9000 sonarqube

# Ejecutar escaneo
sonar-scanner \
  -Dsonar.projectKey=myproject \
  -Dsonar.sources=. \
  -Dsonar.host.url=http://localhost:9000
```

### Semgrep

```bash
# Instalar
pip install semgrep

# Ejecutar escaneo
semgrep --config=auto .

# Usar reglas
semgrep --config=p/security-audit .
```

### CodeQL

```bash
# Crear base de datos
codeql database create database --language=java --source-root=.

# Ejecutar consulta
codeql database analyze database security-and-quality.qls --format=sarif-latest
```

## Lista de verificación de revisión

### Validación de entrada
- [ ] Todas las entradas de usuario están validadas
- [ ] Uso de validación por lista blanca
- [ ] Validación de tipos de datos y rangos
- [ ] Manejo de caracteres especiales

### Codificación de salida
- [ ] Codificación de salida HTML
- [ ] Codificación de URL
- [ ] Codificación de JavaScript
- [ ] Parametrización SQL

### Autenticación y autorización
- [ ] Política de contraseñas seguras
- [ ] Gestión segura de sesiones
- [ ] Verificación de permisos
- [ ] Autenticación multifactor

### Cifrado
- [ ] Uso de algoritmos de cifrado fuertes
- [ ] Almacenamiento seguro de claves
- [ ] Cifrado en tránsito
- [ ] Cifrado en reposo

### Manejo de errores
- [ ] No filtrar información sensible
- [ ] Respuestas de error unificadas
- [ ] Registro de logs de errores
- [ ] Manejo de excepciones

## Mejores prácticas

### 1. Estándares de codificación segura

- Seguir OWASP Top 10
- Usar guías de codificación segura
- Flujo de trabajo de revisión de código
- Capacitación en seguridad

### 2. Herramientas automatizadas

- Integración de herramientas SAST
- Comprobaciones de seguridad en CI/CD
- Escaneo automatizado
- Análisis de resultados

### 3. Flujo de trabajo de revisión de código

- Revisión por pares
- Revisión por expertos en seguridad
- Revisión periódica
- Registro de problemas

## Consideraciones

- Combinar herramientas y revisión manual
- Prestar atención a las vulnerabilidades de la lógica de negocio
- Actualizar regularmente las reglas de las herramientas
- Establecer una cultura de codificación segura