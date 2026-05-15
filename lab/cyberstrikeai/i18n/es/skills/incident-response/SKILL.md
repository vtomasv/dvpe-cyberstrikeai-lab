---
name: incident-response
description: Habilidades profesionales y metodología para la respuesta a incidentes de seguridad
version: 1.0.0
---

# Respuesta a incidentes de seguridad

## Descripción general

La respuesta a incidentes de seguridad es un proceso crítico para manejar eventos de seguridad. Esta habilidad proporciona metodologías, herramientas y mejores prácticas para la respuesta a incidentes de seguridad.

## Flujo de trabajo de respuesta

### 1. Fase de preparación

**Trabajo de preparación:**
- Establecer un equipo de respuesta
- Desarrollar un plan de respuesta
- Preparar herramientas y recursos
- Establecer canales de comunicación

### 2. Fase de identificación

**Identificación de incidentes:**
- Monitoreo de alertas
- Detección de anomalías
- Análisis de registros
- Reportes de usuarios

### 3. Fase de contención

**Medidas de contención:**
- Aislar sistemas afectados
- Deshabilitar cuentas
- Bloquear conexiones de red
- Respaldar evidencia

### 4. Fase de erradicación

**Erradicación de amenazas:**
- Eliminar malware
- Parchear vulnerabilidades
- Restablecer credenciales
- Limpiar puertas traseras

### 5. Fase de recuperación

**Recuperación de sistemas:**
- Restaurar respaldos
- Verificar la integridad del sistema
- Monitorear sistemas
- Restaurar servicios gradualmente

### 6. Fase de lecciones aprendidas

**Resumen de la experiencia:**
- Reporte del incidente
- Lecciones aprendidas
- Medidas de mejora
- Actualización de procesos

## Uso de herramientas

### Análisis de registros

**Uso de Splunk:**
```bash
# Buscar registros
index=security event_type="failed_login"

# Análisis estadístico
index=security | stats count by src_ip

# Análisis de series temporales
index=security | timechart count by event_type
```

**Uso de ELK:**
```bash
# Consulta en Elasticsearch
GET /logs/_search
{
  "query": {
    "match": {
      "event_type": "malware"
    }
  }
}
```

### Herramientas forenses

**Uso de Volatility:**
```bash
# Analizar imagen de memoria
volatility -f memory.dump imageinfo

# Listar procesos
volatility -f memory.dump --profile=Win7SP1x64 pslist

# Extraer memoria de procesos
volatility -f memory.dump --profile=Win7SP1x64 memdump -p 1234 -D output/
```

**Uso de Autopsy:**
```bash
# Iniciar Autopsy
# Crear caso
# Agregar evidencia
# Analizar datos
```

### Análisis de red

**Uso de Wireshark:**
```bash
# Capturar tráfico
wireshark -i eth0

# Analizar archivo PCAP
wireshark -r capture.pcap

# Filtrar tráfico
# Filtro de visualización: ip.addr == 192.168.1.100
# Filtro de captura: host 192.168.1.100
```

**Uso de tcpdump:**
```bash
# Capturar tráfico
tcpdump -i eth0 -w capture.pcap

# Analizar tráfico
tcpdump -r capture.pcap -A
```

## Tipos de incidentes

### Malware

**Pasos de respuesta:**
1. Aislar sistemas afectados
2. Recolectar muestras
3. Analizar el malware
4. Erradicar la amenaza
5. Parchear vulnerabilidades

**Herramientas:**
- VirusTotal
- Cuckoo Sandbox
- Reglas YARA

### Fuga de datos

**Pasos de respuesta:**
1. Confirmar el alcance de la fuga
2. Contener la fuga
3. Evaluar el impacto
4. Notificar a las partes interesadas
5. Parchear vulnerabilidades

**Elementos a verificar:**
- Volumen de datos filtrados
- Usuarios afectados
- Canal de fuga
- Sensibilidad de los datos

### Denegación de servicio

**Pasos de respuesta:**
1. Confirmar el tipo de ataque
2. Habilitar medidas de protección
3. Filtrar tráfico malicioso
4. Monitorear el estado del sistema
5. Restaurar servicios normales

**Medidas de protección:**
- Servicios de protección DDoS
- Limpieza de tráfico
- Medidas de limitación de tasa
- Protección CDN

### Acceso no autorizado

**Pasos de respuesta:**
1. Deshabilitar cuentas afectadas
2. Restablecer credenciales
3. Revisar registros de acceso
4. Evaluar el acceso a datos
5. Parchear vulnerabilidades

**Elementos a verificar:**
- Tiempo de acceso
- Contenido accedido
- Origen del acceso
- Modificación de datos

## Lista de verificación de respuesta

### Fase de preparación
- [ ] Establecer equipo de respuesta
- [ ] Desarrollar plan de respuesta
- [ ] Preparar herramientas
- [ ] Establecer canales de comunicación

### Fase de identificación
- [ ] Confirmar incidente
- [ ] Recopilar información
- [ ] Evaluar impacto
- [ ] Registrar línea de tiempo

### Fase de contención
- [ ] Aislar sistemas
- [ ] Deshabilitar cuentas
- [ ] Bloquear conexiones
- [ ] Respaldar evidencia

### Fase de erradicación
- [ ] Eliminar amenazas
- [ ] Parchear vulnerabilidades
- [ ] Restablecer credenciales
- [ ] Verificar erradicación

### Fase de recuperación
- [ ] Restaurar sistemas
- [ ] Verificar integridad
- [ ] Monitorear sistemas
- [ ] Restaurar servicios

### Fase de lecciones aprendidas
- [ ] Escribir reporte
- [ ] Resumir experiencia
- [ ] Medidas de mejora
- [ ] Actualizar procesos

## Mejores prácticas

### 1. Preparación

- Establecer equipo de respuesta
- Desarrollar plan de respuesta
- Realizar simulacros regulares
- Preparar herramientas

### 2. Respuesta

- Respuesta rápida
- Manejo sistemático
- Registrar todas las operaciones
- Proteger la evidencia

### 3. Comunicación

- Comunicación interna
- Notificaciones externas
- Actualizaciones de estado
- Reporte posterior al incidente

### 4. Mejora

- Análisis de incidentes
- Mejora de procesos
- Actualización de herramientas
- Mejora de capacitación

## Consideraciones

- Respuesta rápida
- Proteger la evidencia
- Registrar operaciones
- Cumplir con leyes y regulaciones