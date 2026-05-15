---
name: cloud-security-audit
description: Habilidades profesionales y metodologías para la auditoría de seguridad en la nube
version: 1.0.0
---

# Auditoría de seguridad en la nube

## Descripción general

La auditoría de seguridad en la nube es un paso importante para evaluar la seguridad de los entornos en la nube. Esta habilidad proporciona métodos, herramientas y mejores prácticas para la auditoría de seguridad en la nube, cubriendo las principales plataformas en la nube como AWS, Azure y GCP.

## Alcance de la auditoría

### 1. Gestión de identidad y acceso

**Elementos de verificación:**
- Configuración de políticas de IAM
- Permisos de usuario
- Permisos de rol
- Gestión de claves de acceso

### 2. Seguridad de red

**Elementos de verificación:**
- Configuración de grupos de seguridad
- ACL de red
- Configuración de VPC
- Cifrado de tráfico

### 3. Seguridad de datos

**Elementos de verificación:**
- Cifrado de datos
- Gestión de claves
- Políticas de respaldo
- Clasificación de datos

### 4. Cumplimiento

**Elementos de verificación:**
- Marcos de cumplimiento
- Registros de auditoría
- Monitoreo y alertas
- Respuesta a incidentes

## Auditoría de seguridad de AWS

### Auditoría de IAM

**Verificar políticas de IAM:**
```bash
# Listar todos los usuarios de IAM
aws iam list-users

# Listar todas las políticas de IAM
aws iam list-policies

# Verificar permisos de usuario
aws iam list-user-policies --user-name username
aws iam list-attached-user-policies --user-name username

# Verificar permisos de rol
aws iam list-role-policies --role-name rolename
```

**Problemas comunes:**
- Permisos excesivos
- Claves de acceso no utilizadas
- Políticas de contraseñas débiles
- MFA no habilitado

### Auditoría de seguridad de S3

**Verificar buckets de S3:**
```bash
# Listar todos los buckets
aws s3 ls

# Verificar políticas de bucket
aws s3api get-bucket-policy --bucket bucketname

# Verificar ACL de bucket
aws s3api get-bucket-acl --bucket bucketname

# Verificar cifrado de bucket
aws s3api get-bucket-encryption --bucket bucketname
```

**Problemas comunes:**
- Acceso público
- Sin cifrar
- Control de versiones no habilitado
- Registro no habilitado

### Auditoría de grupos de seguridad

**Verificar grupos de seguridad:**
```bash
# Listar todos los grupos de seguridad
aws ec2 describe-security-groups

# Verificar puertos abiertos
aws ec2 describe-security-groups --group-ids sg-xxx
```

**Problemas comunes:**
- 0.0.0.0/0 abierto
- Puertos abiertos innecesarios
- Reglas demasiado permisivas

### Auditoría de CloudTrail

**Verificar registros de auditoría:**
```bash
# Listar todos los rastros
aws cloudtrail describe-trails

# Verificar integridad de archivos de registro
aws cloudtrail get-trail-status --name trailname
```

## Auditoría de seguridad de Azure

### Suscripciones y grupos de recursos

**Verificar suscripciones:**
```bash
# Listar todas las suscripciones
az account list

# Verificar grupos de recursos
az group list
```

### Grupos de seguridad de red

**Verificar NSG:**
```bash
# Listar todos los NSG
az network nsg list

# Verificar reglas de NSG
az network nsg rule list --nsg-name nsgname --resource-group rgname
```

### Cuentas de almacenamiento

**Verificar cuentas de almacenamiento:**
```bash
# Listar todas las cuentas de almacenamiento
az storage account list

# Verificar políticas de acceso
az storage account show --name accountname --resource-group rgname
```

## Auditoría de seguridad de GCP

### Proyectos y organizaciones

**Verificar proyectos:**
```bash
# Listar todos los proyectos
gcloud projects list

# Verificar políticas de IAM
gcloud projects get-iam-policy project-id
```

### Compute Engine

**Verificar instancias:**
```bash
# Listar todas las instancias
gcloud compute instances list

# Verificar reglas de firewall
gcloud compute firewall-rules list
```

### Almacenamiento

**Verificar buckets de almacenamiento:**
```bash
# Listar todos los buckets de almacenamiento
gsutil ls

# Verificar permisos de bucket
gsutil iam get gs://bucketname
```

## Herramientas automatizadas

### Scout Suite

```bash
# Auditoría de AWS
scout aws

# Auditoría de Azure
scout azure

# Auditoría de GCP
scout gcp
```

### Prowler

```bash
# Auditoría de seguridad de AWS
prowler -c check11,check12,check13

# Auditoría completa
prowler
```

### CloudSploit

```bash
# Escanear cuenta de AWS
cloudsploit scan aws

# Escanear suscripción de Azure
cloudsploit scan azure
```

### Pacu

```bash
# Framework de pruebas de penetración para AWS
pacu
```

## Lista de verificación de auditoría

### Seguridad de IAM
- [ ] Verificar permisos de usuario
- [ ] Verificar permisos de rol
- [ ] Verificar claves de acceso
- [ ] Verificar políticas de contraseñas
- [ ] Verificar estado de habilitación de MFA

### Seguridad de red
- [ ] Verificar reglas de grupos de seguridad/NSG
- [ ] Verificar configuración de VPC
- [ ] Verificar ACL de red
- [ ] Verificar cifrado de tráfico

### Seguridad de datos
- [ ] Verificar cifrado de datos
- [ ] Verificar gestión de claves
- [ ] Verificar políticas de respaldo
- [ ] Verificar clasificación de datos

### Cumplimiento
- [ ] Verificar registros de auditoría
- [ ] Verificar monitoreo y alertas
- [ ] Verificar respuesta a incidentes
- [ ] Verificar marcos de cumplimiento

## Problemas de seguridad comunes

### 1. Permisos excesivos

**Problema:**
- Políticas de IAM demasiado permisivas
- Usuarios con permisos de administrador
- Permisos de rol demasiado amplios

**Solución:**
- Principio de privilegio mínimo
- Revisar permisos regularmente
- Usar simulación de políticas de IAM

### 2. Recursos públicos

**Problema:**
- Buckets de S3 públicos
- Grupos de seguridad abiertos a 0.0.0.0/0
- Acceso público a bases de datos

**Solución:**
- Limitar el alcance del acceso
- Usar redes privadas
- Habilitar control de acceso

### 3. Datos sin cifrar

**Problema:**
- Almacenamiento sin cifrar
- Transmisión sin cifrar
- Gestión de claves inadecuada

**Solución:**
- Habilitar cifrado
- Usar TLS/SSL
- Usar servicios de gestión de claves

### 4. Registros faltantes

**Problema:**
- Registros de auditoría no habilitados
- Registros no retenidos
- Registros no monitoreados

**Solución:**
- Habilitar CloudTrail/Azure Monitor
- Configurar políticas de retención de registros
- Configurar monitoreo y alertas

## Mejores prácticas

### 1. Privilegio mínimo

- Otorgar solo los permisos necesarios
- Revisar permisos regularmente
- Usar simulación de políticas de IAM

### 2. Defensa en profundidad

- Protección a nivel de red
- Protección a nivel de aplicación
- Protección a nivel de datos

### 3. Monitoreo y alertas

- Habilitar registros de auditoría
- Configurar monitoreo y alertas
- Establecer procesos de respuesta a incidentes

### 4. Cumplimiento

- Seguir marcos de cumplimiento
- Auditorías de seguridad regulares
- Documentar políticas de seguridad

## Consideraciones

- Realizar auditorías solo en entornos autorizados
- Evitar impactar los entornos de producción
- Prestar atención a las diferencias entre plataformas en la nube
- Realizar auditorías de seguridad regularmente