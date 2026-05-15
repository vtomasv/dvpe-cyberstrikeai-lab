---
name: mobile-app-security-testing
description: Habilidades profesionales y metodologías para pruebas de seguridad en aplicaciones móviles
version: 1.0.0
---

# Pruebas de seguridad en aplicaciones móviles

## Descripción general

Las pruebas de seguridad en aplicaciones móviles son un aspecto fundamental para garantizar la seguridad de las aplicaciones móviles. Esta habilidad proporciona metodologías, herramientas y mejores prácticas para las pruebas de seguridad en aplicaciones móviles, abarcando las plataformas Android e iOS.

## Alcance de las pruebas

### 1. Seguridad de la aplicación

**Elementos a verificar:**
- Ofuscación de código
- Protección contra descompilación
- Protección contra depuración
- Fijación de certificados (Certificate pinning)

### 2. Seguridad de los datos

**Elementos a verificar:**
- Cifrado de datos
- Gestión de claves
- Almacenamiento de datos sensibles
- Transmisión de datos

### 3. Autenticación y autorización

**Elementos a verificar:**
- Mecanismos de autenticación
- Gestión de tokens
- Autenticación biométrica
- Gestión de sesiones

### 4. Seguridad en las comunicaciones

**Elementos a verificar:**
- Configuración de TLS/SSL
- Verificación de certificados
- Seguridad de API
- Protección contra ataques de intermediario (MitM)

## Pruebas de seguridad en Android

### Análisis estático

**Uso de APKTool:**
```bash
# Descompilar APK
apktool d app.apk

# Ver AndroidManifest.xml
cat app/AndroidManifest.xml

# Ver código Smali
find app/smali -name "*.smali"
```

**Uso de Jadx:**
```bash
# Descompilar APK
jadx -d output app.apk

# Ver código fuente Java
find output -name "*.java"
```

**Uso de MobSF:**
```bash
# Iniciar MobSF
docker run -it -p 8000:8000 opensecurity/mobsf

# Subir APK para análisis
# Acceder a http://localhost:8000
```

### Análisis dinámico

**Uso de Frida:**
```javascript
// Hook a función
Java.perform(function() {
    var MainActivity = Java.use("com.example.MainActivity");
    MainActivity.onCreate.implementation = function(savedInstanceState) {
        console.log("[*] onCreate called");
        this.onCreate(savedInstanceState);
    };
});
```

**Uso de Objection:**
```bash
# Iniciar Objection
objection -g com.example.app explore

# Hook a función
android hooking watch class_method com.example.MainActivity.onCreate
```

**Uso de Burp Suite:**
```bash
# Configurar proxy
# Configurar el proxy en Android para que apunte a Burp Suite
# Instalar el certificado de Burp
```

### Vulnerabilidades comunes

**Claves codificadas (Hardcoded keys):**
```java
// Código inseguro
String apiKey = "1234567890abcdef";
String password = "admin123";
```

**Almacenamiento inseguro:**
```java
// Almacenamiento de datos sensibles en SharedPreferences
SharedPreferences prefs = getSharedPreferences("data", MODE_WORLD_READABLE);
prefs.edit().putString("password", password).apply();
```

**Evasión de verificación de certificados:**
```java
// No verificar certificados
TrustManager[] trustAllCerts = new TrustManager[] {
    new X509TrustManager() {
        public X509Certificate[] getAcceptedIssuers() { return null; }
        public void checkClientTrusted(X509Certificate[] certs, String authType) { }
        public void checkServerTrusted(X509Certificate[] certs, String authType) { }
    }
};
```

## Pruebas de seguridad en iOS

### Análisis estático

**Uso de class-dump:**
```bash
# Exportar archivos de cabecera
class-dump app.ipa

# Ver archivos de cabecera
find app -name "*.h"
```

**Uso de Hopper:**
```bash
# Desensamblar con Hopper
# Abrir el archivo binario de la app
# Analizar el código ensamblador
```

**Uso de otool:**
```bash
# Ver información de Mach-O
otool -L app

# Ver cadenas de texto
strings app | grep -i "password\|key\|secret"
```

### Análisis dinámico

**Uso de Frida:**
```javascript
// Hook a método de Objective-C
var className = ObjC.classes.ViewController;
var method = className['- login:password:'];
Interceptor.attach(method.implementation, {
    onEnter: function(args) {
        console.log("[*] Login called");
        console.log("Username: " + ObjC.Object(args[2]).toString());
        console.log("Password: " + ObjC.Object(args[3]).toString());
    }
});
```

**Uso de Cycript:**
```bash
# Adjuntar al proceso
cycript -p app

# Ejecutar comando
[UIApplication sharedApplication]
```

### Vulnerabilidades comunes

**Claves codificadas (Hardcoded keys):**
```objective-c
// Código inseguro
NSString *apiKey = @"1234567890abcdef";
NSString *password = @"admin123";
```

**Almacenamiento inseguro:**
```objective-c
// Almacenamiento inadecuado en Keychain
NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
[defaults setObject:password forKey:@"password"];
```

**Evasión de verificación de certificados:**
```objective-c
// No verificar certificados
- (void)connection:(NSURLConnection *)connection 
didReceiveAuthenticationChallenge:(NSURLAuthenticationChallenge *)challenge {
    [challenge.sender useCredential:[NSURLCredential credentialForTrust:challenge.protectionSpace.serverTrust] 
          forAuthenticationChallenge:challenge];
}
```

## Uso de herramientas

### MobSF

```bash
# Iniciar MobSF
docker run -it -p 8000:8000 opensecurity/mobsf

# Subir aplicación para análisis
# Soporta Android e iOS
```

### Frida

```bash
# Instalar Frida
pip install frida-tools

# Ejecutar script
frida -U -f com.example.app -l script.js
```

### Objection

```bash
# Instalar Objection
pip install objection

# Iniciar Objection
objection -g com.example.app explore
```

### Burp Suite

**Configuración del proxy:**
1. Configurar el listener en Burp Suite
2. Configurar el proxy en el dispositivo móvil
3. Instalar el certificado de Burp
4. Interceptar y analizar el tráfico

## Lista de verificación de pruebas

### Seguridad de la aplicación
- [ ] Verificación de ofuscación de código
- [ ] Protección contra descompilación
- [ ] Protección contra depuración
- [ ] Fijación de certificados (Certificate pinning)

### Seguridad de los datos
- [ ] Verificación de cifrado de datos
- [ ] Gestión de claves
- [ ] Almacenamiento de datos sensibles
- [ ] Seguridad en la transmisión de datos

### Autenticación y autorización
- [ ] Pruebas de mecanismos de autenticación
- [ ] Gestión de tokens
- [ ] Gestión de sesiones
- [ ] Autenticación biométrica

### Seguridad en las comunicaciones
- [ ] Configuración de TLS/SSL
- [ ] Verificación de certificados
- [ ] Pruebas de seguridad de API
- [ ] Protección contra ataques de intermediario (MitM)

## Problemas de seguridad comunes

### 1. Claves codificadas (Hardcoded keys)

**Problema:**
- Claves de API codificadas
- Contraseñas codificadas
- Claves de cifrado codificadas

**Solución:**
- Usar servicios de gestión de claves
- Usar variables de entorno
- Usar almacenamiento seguro

### 2. Almacenamiento inseguro

**Problema:**
- Almacenamiento de datos sensibles en texto plano
- Uso de métodos de almacenamiento inseguros
- Datos no cifrados

**Solución:**
- Usar almacenamiento cifrado
- Usar Keychain/Keystore
- Implementar cifrado de datos

### 3. Evasión de verificación de certificados

**Problema:**
- No verificar certificados SSL
- Aceptar certificados autofirmados
- Fijación de certificados no implementada

**Solución:**
- Implementar fijación de certificados
- Verificar la cadena de certificados
- Usar el almacén de certificados del sistema

### 4. Fuga de información de depuración

**Problema:**
- Los registros contienen información sensible
- Fuga de mensajes de error
- Modo de depuración no deshabilitado

**Solución:**
- Eliminar el código de depuración
- Limitar la salida de registros
- Deshabilitar la depuración en el entorno de producción

## Mejores prácticas

### 1. Seguridad del código

- Implementar ofuscación de código
- Deshabilitar funciones de depuración
- Implementar protección contra depuración
- Usar fijación de certificados

### 2. Seguridad de los datos

- Cifrar datos sensibles
- Usar almacenamiento seguro
- Implementar gestión de claves
- Limitar el acceso a los datos

### 3. Seguridad en las comunicaciones

- Usar TLS/SSL
- Implementar fijación de certificados
- Verificar certificados del servidor
- Usar API seguras

### 4. Seguridad en la autenticación

- Implementar autenticación fuerte
- Gestión segura de tokens
- Implementar gestión de sesiones
- Usar autenticación biométrica

## Consideraciones

- Realizar pruebas únicamente en entornos autorizados
- Cumplir con las leyes y regulaciones
- Prestar atención a las diferencias entre plataformas
- Proteger la privacidad del usuario